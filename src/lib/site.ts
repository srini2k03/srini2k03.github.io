export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Public URL of the deployed site (used for canonical URLs, OG tags and the sitemap). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://srini2k03.github.io/Resume-").replace(/\/$/, "");

/** Prefix a public asset path with the deploy base path (plain <a>/<img> do not get it automatically). */
export const asset = (path: string) => `${basePath}${path.startsWith("/") ? path : `/${path}`}`;

export const resumePdf = asset("/Srinivasan_Balasubramanian_Resume.pdf");
