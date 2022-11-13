import { checkFiles } from "./linkproofer";
import { Command } from "commander";

export async function init(args: any) {
  const program = new Command();

  program
    .name("linkproofer")
    .description("CLI tool to audit links in your project")
    .version("0.1.0")
    .option(
      "-f, --files <files>",
      "Filepath pattern for files in which linkproofer should check for links"
    )
    .option(
      "-v, --verbose",
      "Log out all checked links (not just the failures)"
    )
    .option(
      "-o, --outputDir <outputDir>",
      "Directory to put the compiled output files. (Default dist). This directory should be added to your .gitignore"
    )
    .option("-b, --baseURL <baseURL>", "baseURL to use for relative links.")
    .action(async (options) => {
      await checkFiles({
        filePattern: options.files,
        verbose: options.verbose,
        outputDir: options.outputDir,
        baseURL: options.baseURL,
      });
    });

  program.parse(args);
}
