import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

interface Workflow {
  on?: {
    push?: { branches?: string[] };
    pull_request?: unknown;
    workflow_dispatch?: unknown;
  };
  permissions?: Record<string, string>;
  concurrency?: {
    group?: string;
    "cancel-in-progress"?: boolean;
  };
  jobs?: Record<string, {
    if?: string;
    needs?: string;
    environment?: { name?: string };
    steps?: Array<{
      uses?: string;
      run?: string;
      if?: string;
      with?: Record<string, string>;
    }>;
  }>;
}

const workflow = parse(
  readFileSync(".github/workflows/deploy-pages.yml", "utf8"),
) as Workflow;

describe("GitHub Pages workflow", () => {
  it("validates pushes to main and pull requests", () => {
    expect(workflow.on?.push?.branches).toEqual(["main"]);
    expect(workflow.on).toHaveProperty("pull_request");
    expect(workflow.on).toHaveProperty("workflow_dispatch");

    const buildSteps = workflow.jobs?.build?.steps ?? [];
    expect(buildSteps.some((step) => step.run === "npm ci")).toBe(true);
    expect(buildSteps.some((step) => step.run === "npm run check")).toBe(true);
  });

  it("uses official Pages actions and uploads only dist", () => {
    expect(existsSync(".gitlab-ci.yml")).toBe(false);

    const buildSteps = workflow.jobs?.build?.steps ?? [];
    expect(buildSteps.some((step) => step.uses === "actions/configure-pages@v5")).toBe(true);
    expect(buildSteps.some(
      (step) => step.uses === "actions/upload-pages-artifact@v3" && step.with?.path === "dist",
    )).toBe(true);

    const deploySteps = workflow.jobs?.deploy?.steps ?? [];
    expect(deploySteps.some((step) => step.uses === "actions/deploy-pages@v4")).toBe(true);
  });

  it("deploys only main with the required permissions and concurrency", () => {
    expect(workflow.permissions).toMatchObject({
      contents: "read",
      pages: "write",
      "id-token": "write",
    });
    expect(workflow.concurrency).toEqual({
      group: "github-pages",
      "cancel-in-progress": false,
    });
    expect(workflow.jobs?.deploy?.if).toContain("github.event_name == 'push'");
    expect(workflow.jobs?.deploy?.if).toContain("github.ref == 'refs/heads/main'");
    expect(workflow.jobs?.deploy?.needs).toBe("build");
    expect(workflow.jobs?.deploy?.environment?.name).toBe("github-pages");
  });
});
