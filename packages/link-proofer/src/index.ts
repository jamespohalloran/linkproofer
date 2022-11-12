import { checkFiles } from "./link-proofer";
import { Command } from "commander";

export async function init(args: any) {
  const program = new Command();

  program
    .name("linkproofer")
    .description("CLI tool to audit links in your project")
    .version("1.0.0")
    .action(async (options) => {
      await checkFiles();
    });

  program.parse(args);
}
