export interface PaymentData {
  orderId: string;
  amount: number;
  description: string;
  returnUrl: string;
  customerEmail?: string;
}

export interface PaymentResult {
  paymentId: string;
  confirmationUrl?: string;
  status: "pending" | "succeeded" | "canceled";
}

export interface PaymentProvider {
  createPayment(data: PaymentData): Promise<PaymentResult>;
  confirmPayment(paymentId: string): Promise<PaymentResult>;
  refund(paymentId: string, amount?: number): Promise<void>;
}

// Dev mode stub
class DevPaymentProvider implements PaymentProvider {
  async createPayment(data: PaymentData): Promise<PaymentResult> {
    console.log("[DEV] Creating payment:", data);
    const sep = data.returnUrl.includes("?") ? "&" : "?";
    return {
      paymentId: `dev_${Date.now()}`,
      confirmationUrl: `${data.returnUrl}${sep}status=success`,
      status: "pending",
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    console.log("[DEV] Confirming payment:", paymentId);
    return { paymentId, status: "succeeded" };
  }

  async refund(paymentId: string): Promise<void> {
    console.log("[DEV] Refund:", paymentId);
  }
}

// YooKassa provider (production)
class YooKassaProvider implements PaymentProvider {
  private shopId: string;
  private secretKey: string;
  private baseUrl = "https://api.yookassa.ru/v3";

  constructor(shopId: string, secretKey: string) {
    this.shopId = shopId;
    this.secretKey = secretKey;
  }

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.shopId}:${this.secretKey}`).toString("base64")}`;
  }

  async createPayment(data: PaymentData): Promise<PaymentResult> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        "Idempotence-Key": data.orderId,
      },
      body: JSON.stringify({
        amount: {
          value: data.amount.toFixed(2),
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: data.returnUrl,
        },
        description: data.description,
        metadata: { orderId: data.orderId },
      }),
    });

    const result = await response.json();
    return {
      paymentId: result.id,
      confirmationUrl: result.confirmation?.confirmation_url,
      status: result.status,
    };
  }

  async confirmPayment(paymentId: string): Promise<PaymentResult> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: { Authorization: this.authHeader },
    });
    const result = await response.json();
    return {
      paymentId: result.id,
      status: result.status === "succeeded" ? "succeeded" : "pending",
    };
  }

  async refund(paymentId: string, amount?: number): Promise<void> {
    await fetch(`${this.baseUrl}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        "Idempotence-Key": `refund_${paymentId}`,
      },
      body: JSON.stringify({
        payment_id: paymentId,
        amount: amount
          ? { value: amount.toFixed(2), currency: "RUB" }
          : undefined,
      }),
    });
  }
}

export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER || "dev";

  if (provider === "yookassa") {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      console.warn("YooKassa credentials not set, falling back to dev mode");
      return new DevPaymentProvider();
    }
    return new YooKassaProvider(shopId, secretKey);
  }

  return new DevPaymentProvider();
}
