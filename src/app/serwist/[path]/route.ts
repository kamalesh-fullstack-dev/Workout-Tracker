import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  randomUUID();

const {
  generateStaticParams,
  GET: serwistGET,
} = createSerwistRoute({
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});

// Next.js requires these route-segment-config exports to be statically
// analyzable literals, not re-exported/destructured values — these match
// exactly what createSerwistRoute itself sets internally.
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;
export { generateStaticParams };

// createSerwistRoute doesn't set a Cache-Control header, so sw.js falls
// under default Vercel/browser caching — the browser's update check can
// keep getting back the previous build's bytes, meaning it never notices
// (and never installs) a new service worker. skipWaiting/clientsClaim in
// sw.ts only matter once an update *is* detected; this is what makes sure
// it actually is, every load.
export async function GET(
  request: Request,
  context: { params: Promise<{ path: string }> }
) {
  const response = await serwistGET(request, context);
  const { path: filePath } = await context.params;
  if (filePath === "sw.js" || filePath === "sw.js.map") {
    response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }
  return response;
}
