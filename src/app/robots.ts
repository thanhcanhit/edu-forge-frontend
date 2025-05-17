import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/payment/*", "/unauthorized/*"],
    },
    sitemap: "https://eduforge.io.vn/sitemap.xml",
  };
}
