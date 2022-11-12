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
    .action(async (options) => {
      await checkFiles(options.files);
    });

  program.parse(args);
}
