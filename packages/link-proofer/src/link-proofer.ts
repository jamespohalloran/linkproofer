import * as fs from "fs";
//@ts-ignore
import fetch from "node-fetch";
import { build } from "esbuild";
import path from "path";
import fg from "fast-glob";

const getLinkProofFile = async () => {
  const linkproofFilename = "linkproof";
  const outputDir = "dist";

  //glob for all files ending in .linkproof.ts or linkproof.js outside of dist
  const entries = await fg([
    `**/*.${linkproofFilename}.{ts,js}`,
    `!**/${outputDir}/**`,
  ]);

  // if (fs.existsSync(path.join(process.cwd(), `${linkproofFilename}.ts`))) {
  //   hasTs = true;
  // } else if (
  //   fs.existsSync(!path.join(process.cwd(), `${linkproofFilename}.js`) as any)
  // ) {
  //   throw new Error(
  //     `No ${linkproofFilename}.ts or linkproof.js file found in project root`
  //   );
  // }

  await build({
    entryPoints: entries,
    bundle: true,
    platform: "node",
    target: "node17",
    outdir: path.join(process.cwd(), "dist"),
    allowOverwrite: true,
    //outfile: path.join(process.cwd(), "dist", `${linkproofFilename}.out.js`),
  });

  let result = {};
  await Promise.all(
    entries.map(async (entry) => {
      //replace entension of entry with .js
      const entryJs = entry.replace(/\.[^/.]+$/, ".js");

      const linkProofFile = await require(path.join(
        process.cwd(),
        "dist",
        entryJs
      )).default;

      result = { ...result, ...linkProofFile };
    })
  );

  return result;
};

export const checkFiles = async () => {
  const linkproofFile = await getLinkProofFile();
  await checkLinkProofFile(linkproofFile);
};

const checkLinkProofFile = async (linkProofFile: any) => {
  const verbose = true;

  const checkLinks = async () => {
    let failCount = 0;

    await Promise.all(
      Object.keys(linkProofFile).map(async (key) => {
        const isValidUrl = await checkUrl(linkProofFile[key]);

        if (!isValidUrl) {
          failCount++;
        }
        if (verbose) {
          console.log(
            `Checking: ${linkProofFile[key]} - ${isValidUrl ? "OK" : "FAIL"}`
          );
        }
      })
    );
    return failCount;
  };

  const failCount = await checkLinks();

  if (failCount > 0) {
    console.error(`${failCount} link${failCount > 1 ? "s" : ""} failed`);
    //TODO - throw error and kill process upstream
    process.exit(0);
  }
  console.log("All links passed!");
};

async function checkUrl(url: string) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}
