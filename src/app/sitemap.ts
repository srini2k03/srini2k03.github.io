import type { MetadataRoute } from "next";
import { featuredProjects } from "@/content/projects";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    ...featuredProjects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
