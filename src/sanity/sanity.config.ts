import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import product from "./schemas/product";
import coffeeItem from "./schemas/coffeeItem";
import blogPost from "./schemas/blogPost";
import banner from "./schemas/banner";
import settings from "./schemas/settings";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "Paloma Flowers CMS",
  schema: {
    types: [product, coffeeItem, blogPost, banner, settings],
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Paloma Flowers")
          .items([
            S.listItem()
              .title("Настройки сайта")
              .child(S.document().schemaType("settings").documentId("settings")),
            S.divider(),
            S.listItem()
              .title("Товары")
              .child(S.documentList().title("Товары").filter('_type == "product"')),
            S.listItem()
              .title("Меню кофейни")
              .child(
                S.documentList()
                  .title("Меню кофейни")
                  .filter('_type == "coffeeItem"')
              ),
            S.listItem()
              .title("Блог")
              .child(
                S.documentList().title("Статьи").filter('_type == "blogPost"')
              ),
            S.listItem()
              .title("Баннеры")
              .child(
                S.documentList().title("Баннеры").filter('_type == "banner"')
              ),
          ]),
    }),
    visionTool(),
  ],
});
