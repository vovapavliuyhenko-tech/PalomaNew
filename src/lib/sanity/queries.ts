import { groq } from "next-sanity";

export const productsQuery = groq`
  *[_type == "product" && inStock == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    price,
    sizes,
    composition,
    origin,
    description,
    "images": images[].asset->url,
    inStock,
    isBestseller,
    isSeasonal
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    price,
    sizes,
    composition,
    origin,
    description,
    "images": images[].asset->url,
    inStock,
    isBestseller,
    isSeasonal
  }
`;

export const coffeeItemsQuery = groq`
  *[_type == "coffeeItem" && inStock == true] | order(category, _createdAt) {
    _id,
    title,
    "slug": slug.current,
    category,
    price,
    volume,
    composition,
    description,
    "image": image.asset->url,
    inStock
  }
`;

export const blogPostsQuery = groq`
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    excerpt,
    "coverImage": coverImage.asset->url,
    publishedAt,
    author
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    category,
    excerpt,
    "coverImage": coverImage.asset->url,
    body,
    publishedAt,
    author,
    seo
  }
`;

export const settingsQuery = groq`
  *[_type == "settings"][0] {
    siteName,
    siteDescription,
    phone,
    email,
    address,
    workingHours,
    socialLinks,
    "logo": logo.asset->url,
    freeDeliveryFrom
  }
`;
