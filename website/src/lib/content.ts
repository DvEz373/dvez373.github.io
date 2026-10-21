import { getCollection, getEntry } from "astro:content";
import { byRecent } from "./dates";

export async function getProfile() {
  const entry = await getEntry("profile", "devin");
  if (!entry) throw new Error('src/data/profile.yaml must contain an entry with id "devin"');
  return entry.data;
}

export async function getExperience() {
  return (await getCollection("experience")).map((e) => ({ id: e.id, ...e.data })).sort(byRecent);
}

export async function getEducation() {
  return (await getCollection("education")).map((e) => ({ id: e.id, ...e.data })).sort(byRecent);
}

export async function getProjects() {
  return (await getCollection("projects")).sort((a, b) => a.data.order - b.data.order);
}

export async function getSkills() {
  return (await getCollection("skills")).map((e) => ({ id: e.id, ...e.data })).sort((a, b) => a.order - b.order);
}

export async function getCertifications() {
  return (await getCollection("certifications")).map((e) => ({ id: e.id, ...e.data })).sort(byRecent);
}

export const TYPE_LABEL = { work: "Work", internship: "Internship", campus: "Campus & academic" } as const;
export const KIND_LABEL = { degree: "Degree", exchange: "Exchange", courses: "Courses" } as const;
export { CATEGORY_LABEL, THEMES, TONE, DOMAIN, type Theme } from "./themes";
export const LEVEL_LABEL = ["", "Aware", "Familiar", "Proficient", "Advanced", "Expert"] as const;
export const KIND_LABEL_PROJECT = { professional: "Client work", academic: "Academic" } as const;
/** File name of the CV in public/ (copied there by website.yml on main). The old address /cv.pdf gets a copy from scripts/legacy-paths.mjs. */
export const CV_FILE = "CV_Devin_Ezekiel_Purba.pdf";
