const fs = require("fs");
import { build } from "esbuild";
import path from "path";

export const getLinkProofFile = async () => {
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
};
