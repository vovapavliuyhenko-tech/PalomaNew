import type { Metadata } from "next";

import Hero from "@/components/home/Hero";
import Showcase from "@/components/home/Showcase";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import About from "@/components/home/About";
import BouquetJourney from "@/components/home/BouquetJourney";
import CafeBlock from "@/components/home/CafeBlock";
import WeddingsBlock from "@/components/home/WeddingsBlock";
import Guarantee from "@/components/home/Guarantee";
import ContactsBlock from "@/components/home/ContactsBlock";
import { getHomeShowcaseProducts } from "@/lib/home/showcase";

export const metadata: Metadata = {
  title: "Paloma Flowers — цветы, кофе и доставка букетов в Новороссийске",
  description:
    "Цветочный бутик и кофейня Paloma на ул. Энгельса, 74. Доставка букетов по Новороссийску, Кабардинке, Геленджику и Анапе. Свадебная флористика и оформление мероприятий.",
  openGraph: {
    title: "Paloma Flowers — цветы, кофе и доставка букетов в Новороссийске",
    description:
      "Цветочный бутик и кофейня Paloma на ул. Энгельса, 74. Доставка букетов по побережью. Свадьбы и события.",
    locale: "ru_RU",
    type: "website",
    siteName: "Paloma Flowers",
    images: [{ url: "/og/home.jpg" }],
  },
};

export default function HomePage() {
  const showcaseItems = getHomeShowcaseProducts();

  return (
    <>
      <Hero />
      <Showcase products={showcaseItems} />
      <CategoriesGrid />
      <About />
      <BouquetJourney />
      <CafeBlock />
      <WeddingsBlock />
      <Guarantee />
      <ContactsBlock />
    </>
  );
}
