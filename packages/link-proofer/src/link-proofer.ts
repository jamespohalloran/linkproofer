const fs = require("fs");
import fetch from "node-fetch";
import { build } from "esbuild";
import path from "path";

const getLinkProofFile = async () => {
  const linkproofFilename = "linkproof";

  let hasTs = false;

  if (fs.existsSync(path.join(process.cwd(), `${linkproofFilename}.ts`))) {
    hasTs = true;
  } else if (
    fs.existsSync(!path.join(process.cwd(), `${linkproofFilename}.js`))
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
  console.log("linkProofFile", linkProofFile);

  Object.keys(linkProofFile).forEach(async (key) => {
    const isValidUrl = await checkUrl(linkProofFile[key]);
    if (verbose) {
      console.log(
        `Checking: ${linkProofFile[key]} - ${isValidUrl ? "OK" : "FAIL"}`
      );
    }
  });
};

async function checkUrl(url: string) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}
