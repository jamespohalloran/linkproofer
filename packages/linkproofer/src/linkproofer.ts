import * as fs from "fs";
//@ts-ignore
import fetch from "node-fetch";
import { build } from "esbuild";
import path from "path";
import fg from "fast-glob";
import chalk from "chalk";

interface LinkList {
  key: string;
  value: string;
}

const getLinkProofFile = async (
  filePattern: string | string[],
  outputDir: string,
  baseURL: string
): Promise<LinkList[]> => {
  const linkproofFilename = "linkproof";

  const defaultPattern = `**/*.${linkproofFilename}.{ts,js}`;
  //glob for all files ending in .linkproof.ts or linkproof.js outside of dist
  const entries = await fg(
    filePattern ? filePattern : [defaultPattern, `!**/${outputDir}/**`]
  );

  console.log(
    `Running Linkproofer on ${chalk.bold.blueBright(
      filePattern || defaultPattern
    )} `
  );

  if (entries.length === 0) {
    console.log(
      chalk.yellow(
        `No linkproofer files found matching "${chalk.bold(
          filePattern || defaultPattern
        )}".\nPlease create a matching file, or pass in a different file pattern with the --files flag.`
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.italic(
      `Found ${
        entries.length > 0
          ? chalk.bold.green(entries.length)
          : chalk.bold.yellow(entries.length)
      } linkproof files\n`
    )
  );

  await build({
    entryPoints: entries,
    bundle: true,
    platform: "node",
    target: "node17",
    outdir: path.join(process.cwd(), outputDir),
    allowOverwrite: true,
  });

  let result: LinkList[] = [];
  await Promise.all(
    entries.map(async (entry) => {
      //replace entension of entry with .js
      const entryJs = entry.replace(/\.[^/.]+$/, ".js");

      const linkProofFile = await require(path.join(
        process.cwd(),
        outputDir,
        entryJs
      )).default;

      const valueKeys = Object.keys(linkProofFile).map((key: any) => {
        //join baseUrl and linkProofFile[key] without messing up http:// or https://

        const val = linkProofFile[key].startsWith("/")
          ? (baseURL || "").replace(/\/$/, "") + linkProofFile[key]
          : linkProofFile[key];
        return {
          key: key,
          value: val,
        } as LinkList;
      });
      result = [...result, ...valueKeys];
    })
  );

  return result;
};

export interface CheckFilesProps {
  filePattern: string | string[];
  verbose: boolean;
  outputDir: string;
  baseURL: string;
}

export const checkFiles = async ({
  filePattern,
  verbose,
  outputDir = "dist",
  baseURL,
}: CheckFilesProps) => {
  const linkproofFile = await getLinkProofFile(filePattern, outputDir, baseURL);
  await checkLinkProofFile(linkproofFile, verbose);
};

const checkLinkProofFile = async (
  linkProofFile: LinkList[],
  verbose: boolean
) => {
  const checkLinks = async () => {
    let failCount = 0;

    await Promise.all(
      linkProofFile.map(async (linkItem) => {
        const isValidUrl = await checkUrl(linkItem.value);

        if (!isValidUrl) {
          failCount++;
        }
        if (verbose || !isValidUrl) {
          console.log(
            `${linkItem.key} (${chalk.italic(chalk.gray(linkItem.value))}) - ${
              isValidUrl ? chalk.bold.green("OK") : chalk.bold.red("FAIL")
            }`
          );
        }
      })
    );
    return failCount;
  };

  const failCount = await checkLinks();

  if (failCount > 0) {
    console.error(
      chalk.bold.red(`${failCount} link${failCount > 1 ? "s" : ""} failed`)
    );
    //TODO - throw error and kill process upstream
    process.exit(1);
  }

  if (linkProofFile.length > 0) {
    console.log(chalk.bold.green("All links passed!"));
  } else {
    console.log(
      chalk.bold.yellow(
        "No links found. Please check your provided linkproof files."
      )
    );
  }
};

async function checkUrl(url: string) {
  try {
    const response = await fetch(url);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}
