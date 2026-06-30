import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const index = readFileSync("index.html", "utf8");
const viteConfig = readFileSync("vite.config.ts", "utf8");
const script = readFileSync("script.js", "utf8");

function readPngSize(path: string): { width: number; height: number } {
  const png = readFileSync(path);
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

describe("PWA install support", () => {
  it("includes iOS home screen metadata and Apple touch icon", () => {
    expect(index).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(index).toContain('<meta name="apple-mobile-web-app-title" content="Train With Me" />');
    expect(index).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="default" />');
    expect(index).toContain('<link rel="apple-touch-icon" href="./apple-touch-icon.png" />');
  });

  it("ships PNG install icons for iOS and Android manifests", () => {
    expect(readPngSize("static/apple-touch-icon.png")).toEqual({ width: 180, height: 180 });
    expect(readPngSize("static/icon-192.png")).toEqual({ width: 192, height: 192 });
    expect(readPngSize("static/icon-512.png")).toEqual({ width: 512, height: 512 });

    expect(viteConfig).toContain('src: "./icon-192.png"');
    expect(viteConfig).toContain('sizes: "192x192"');
    expect(viteConfig).toContain('src: "./icon-512.png"');
    expect(viteConfig).toContain('sizes: "512x512"');
  });

  it("keeps native Android install prompts and provides iOS instructions", () => {
    expect(script).toContain('window.addEventListener("beforeinstallprompt"');
    expect(script).toContain("deferredInstallPrompt.prompt()");
    expect(script).toContain("On iPhone or iPad, tap Share, then Add to Home Screen.");
    expect(script).toContain("isStandaloneDisplay()");
    expect(script).toContain("isIosDevice()");
  });
});
