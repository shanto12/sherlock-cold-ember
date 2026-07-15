import type { MetadataRoute } from "next";

const SITE_URL = "https://sherlock-cold-ember.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-07-15T00:00:00-05:00"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
