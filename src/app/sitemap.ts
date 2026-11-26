import type { MetadataRoute } from "next";
import { featuredProjects } from "@/content/projects";
import { posts } from "@/content/posts";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    ...featuredProjects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${siteUrl}/writing/`, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((p) => ({ url: `${siteUrl}/writing/${p.slug}/`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
