import { profile } from "@/content/profile";
import { GitHub, Mail } from "./icons";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-fg">© {new Date().getFullYear()} {profile.name}</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">
            Built with Next.js, TypeScript, Tailwind CSS and Motion. Statically exported and deployed to GitHub Pages by GitHub Actions after
            lint, type-check, unit tests and the retrieval evaluation pass.{" "}
            <a href={profile.siteRepo} className="underline decoration-line-strong underline-offset-2 hover:text-fg">
              View source
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href={profile.github} aria-label="GitHub" className="grid size-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-fg">
            <GitHub />
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="grid size-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-fg">
            <Mail />
          </a>
        </div>
      </div>
    </footer>
  );
}
