import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Work } from "@/components/work";
import { Lab } from "@/components/lab";
import { Principles } from "@/components/principles";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { MoreProjects } from "@/components/more-projects";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <MoreProjects />
      <Lab />
      <Principles />
      <Experience />
      <Skills />
      <Contact />
    </>
  );
}
