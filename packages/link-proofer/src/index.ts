import { checkFiles } from "./link-proofer";
import { Command } from "commander";

export async function init(args: any) {
  const program = new Command();

  program
    .name("linkproofer")
    .description("CLI tool to audit links in your project")
    .version("1.0.0")
    .option(
      "-f, --files <files>",
      "Filepath pattern for files in which linkproofer should check for links"
    )
    .option(
      "-v, --verbose <verbose>",
      "Log out all checked links (not just the failures)"
    )
    .action(async (options) => {
      await checkFiles({
        filePattern: options.files,
        verbose: options.verbose,
      });
    });

  program.parse(args);
}
