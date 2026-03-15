import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, context } from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const distDir = path.join(packageRoot, "dist");
const publicDir = path.join(packageRoot, "public");
const watchMode = process.argv.includes("--watch");

const workspaceAliases = new Map([
  ["@ai-ui-runtime/shared", path.resolve(packageRoot, "../shared/src/index.ts")],
  ["@ai-ui-runtime/ui-runtime", path.resolve(packageRoot, "../ui-runtime/src/index.ts")],
  ["@ai-ui-runtime/intent-engine", path.resolve(packageRoot, "../intent-engine/src/index.ts")]
]);

const aliasPlugin = {
  name: "workspace-alias",
  setup(buildContext) {
    for (const [alias, targetPath] of workspaceAliases.entries()) {
      buildContext.onResolve({ filter: new RegExp(`^${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) }, () => ({
        path: targetPath
      }));
    }
  }
};

const baseConfig = {
  bundle: true,
  loader: {
    ".css": "text"
  },
  legalComments: "none",
  logLevel: "info",
  platform: "browser",
  plugins: [aliasPlugin],
  sourcemap: true,
  target: ["chrome114"]
};

const buildTargets = [
  {
    entryPoints: [path.join(packageRoot, "src/content.ts")],
    format: "iife",
    outfile: path.join(distDir, "content.js")
  },
  {
    entryPoints: [path.join(packageRoot, "src/background.ts")],
    format: "iife",
    outfile: path.join(distDir, "background.js")
  },
  {
    entryPoints: [path.join(packageRoot, "src/popup/main.tsx")],
    format: "iife",
    outfile: path.join(distDir, "popup.js")
  }
];

async function copyStaticFiles() {
  await mkdir(distDir, { recursive: true });
  await cp(path.join(publicDir, "manifest.json"), path.join(distDir, "manifest.json"));
  await cp(path.join(publicDir, "popup.html"), path.join(distDir, "popup.html"));
  await cp(path.join(publicDir, "_locales"), path.join(distDir, "_locales"), { recursive: true });
}

async function runBuild() {
  await rm(distDir, { force: true, recursive: true });
  await copyStaticFiles();

  if (watchMode) {
    const contexts = await Promise.all(buildTargets.map((target) => context({ ...baseConfig, ...target })));
    await Promise.all(contexts.map((buildContext) => buildContext.watch()));
    console.log(`[AI UI Runtime] 扩展构建监听中: ${distDir}`);
    return;
  }

  await Promise.all(buildTargets.map((target) => build({ ...baseConfig, ...target })));
  console.log(`[AI UI Runtime] 扩展产物已输出到: ${distDir}`);
}

runBuild().catch((error) => {
  console.error("[AI UI Runtime] 扩展构建失败");
  console.error(error);
  process.exitCode = 1;
});
