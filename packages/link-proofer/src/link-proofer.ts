import * as fs from "fs";
//@ts-ignore
import fetch from "node-fetch";
import { build } from "esbuild";
import path from "path";

const getLinkProofFile = async () => {
  const linkproofFilename = "linkproof";

  let hasTs = false;

  if (fs.existsSync(path.join(process.cwd(), `${linkproofFilename}.ts`))) {
    hasTs = true;
  } else if (
    fs.existsSync(!path.join(process.cwd(), `${linkproofFilename}.js`) as any)
  ) {
    throw new Error(
      `No ${linkproofFilename}.ts or linkproof.js file found in project root`
    );
  }

  await build({
    entryPoints: [
      path.join(process.cwd(), `${linkproofFilename}.${hasTs ? "ts" : "js"}`),
    ],
    bundle: true,
    platform: "node",
    target: "node17",
    outfile: path.join(process.cwd(), "dist", `${linkproofFilename}.out.js`),
  });

  const linkProofFile = await require(path.join(
    process.cwd(),
    "dist",
    `${linkproofFilename}.out.js`
  )).default;

  return linkProofFile;
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
