import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const index = await readFile(path.join(dist, "index.html"), "utf8");
const manifest = JSON.parse(await readFile(path.join(dist, "manifest.webmanifest"), "utf8"));
const files = await readdir(dist, { recursive: true });

const failures = [];
const assetReferences = [...index.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);

if (index.includes("cdn.jsdelivr.net") || index.includes("https://cdn.")) {
  failures.push("Production HTML still references a CDN.");
}
if (index.includes("gitlab.io")) {
  failures.push("Production HTML still references a GitLab Pages URL.");
}
if (assetReferences.some((reference) => reference.startsWith("/"))) {
  failures.push("Production HTML contains root-absolute asset paths.");
}
if (!assetReferences.some((reference) => reference.startsWith("./assets/"))) {
  failures.push("Production HTML does not contain relative bundled assets.");
}
if (manifest.start_url !== "./" || manifest.scope !== "./") {
  failures.push("Manifest start_url and scope must remain relative for nested Pages paths.");
}
for (const required of ["index.html", "manifest.webmanifest", "sw.js", "service-worker.js"]) {
  try {
    await access(path.join(dist, required));
  } catch {
    failures.push(`Missing production file: ${required}`);
  }
}
if (!files.includes("icon.svg")) {
  failures.push("Missing installable app icon.");
}
if (!files.some((file) => /^workbox-.*\.js$/.test(file))) {
  failures.push("Missing generated Workbox runtime.");
}
if (!files.some((file) => /^assets\/script-.*\.js$/.test(file))) {
  failures.push("Missing bundled legacy application controller.");
}

const scriptFiles = files.filter((file) => /^assets\/.*\.js$/.test(file));
const scripts = await Promise.all(
  scriptFiles.map((file) => readFile(path.join(dist, file), "utf8")),
);
if (!scripts.some((script) => script.includes("Chart"))) {
  failures.push("The production bundle does not contain locally bundled Chart.js.");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Production build uses relative assets and contains the offline application shell.");
