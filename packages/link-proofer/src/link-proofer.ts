import * as fs from "fs";
//@ts-ignore
import fetch from "node-fetch";
import { build } from "esbuild";
import path from "path";
import fg from "fast-glob";

interface LinkList {
  key: string;
  value: string;
}

const getLinkProofFile = async (
  filePattern: string | string[]
): Promise<LinkList[]> => {
  const linkproofFilename = "linkproof";
  const outputDir = "dist";

  //glob for all files ending in .linkproof.ts or linkproof.js outside of dist
  const entries = await fg(
    filePattern
      ? filePattern
      : [`**/*.${linkproofFilename}.{ts,js}`, `!**/${outputDir}/**`]
  );

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

  let result: LinkList[] = [];
  await Promise.all(
    entries.map(async (entry) => {
      //replace entension of entry with .js
      const entryJs = entry.replace(/\.[^/.]+$/, ".js");

      const linkProofFile = await require(path.join(
        process.cwd(),
        "dist",
        entryJs
      )).default;

      const valueKeys = Object.keys(linkProofFile).map((key: any) => {
        return { key, value: linkProofFile[key] } as LinkList;
      });
      result = [...result, ...valueKeys];
    })
  );

  return result;
};

export const checkFiles = async (filePattern: string | string[]) => {
  const linkproofFile = await getLinkProofFile(filePattern);
  await checkLinkProofFile(linkproofFile);
};

const checkLinkProofFile = async (linkProofFile: LinkList[]) => {
  const verbose = true;

  const checkLinks = async () => {
    let failCount = 0;

    await Promise.all(
      linkProofFile.map(async (linkItem) => {
        const isValidUrl = await checkUrl(linkItem.value);

        if (!isValidUrl) {
          failCount++;
        }
        if (verbose) {
          console.log(
            `Checking: ${linkItem.key} - ${isValidUrl ? "OK" : "FAIL"}`
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

  if (linkProofFile.length > 0) console.log("All links passed!");
  else
    console.log("No links found. Please check your provided linkproof files.");
};

async function checkUrl(url: string) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}
