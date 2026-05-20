import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CartDrawer from "@/components/cart/CartDrawer";
import CookieBanner from "@/components/ui/CookieBanner";
import CustomCursor from "@/components/ui/CustomCursor";
import ThemeRootSync from "@/components/layout/ThemeRootSync";
import AmbientMusic from "@/components/ui/AmbientMusic";
import Preloader from "@/components/preloader/Preloader";
import { ProductQuickViewProvider } from "@/components/catalog/ProductQuickViewContext";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeRootSync />
      <Preloader />
      <AmbientMusic />
      <CustomCursor />
      <Header />
      <main className="pb-[calc(60px+env(safe-area-inset-bottom,0px))] pt-[calc(var(--header-h-mobile)+env(safe-area-inset-top,0px))] min-[1024px]:pt-[calc(var(--header-h-desktop)+env(safe-area-inset-top,0px))] lg:pb-0">
        <ProductQuickViewProvider>{children}</ProductQuickViewProvider>
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <CookieBanner />
    </>
  );
}
