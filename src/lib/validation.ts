import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Имя должно быть не менее 2 символов"),
  customerPhone: z.string().regex(/^[\d\s\-+()]+$/, "Некорректный номер телефона"),
  customerEmail: z.union([z.string().email(), z.literal("")]).optional(),
  contactMethod: z.enum(["phone", "telegram"]),
  deliveryType: z.enum(["delivery", "pickup"]),
  deliveryCity: z.string().min(1, "Выберите город"),
  deliveryAddress: z.union([z.string().min(5, "Укажите адрес как минимум 5 символов"), z.literal("")]).optional(),
  deliveryDate: z.coerce.date(),
  deliveryInterval: z.string().min(1, "Выберите интервал"),
  cardText: z.string().max(200, "Текст не более 200 символов").optional(),
  sendPhotoBefore: z.boolean().default(true),
  comment: z.string().max(500, "Комментарий не более 500 символов").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
