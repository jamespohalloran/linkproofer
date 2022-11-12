import { checkFiles } from "./link-proofer";

export async function init(args: any) {
  await checkFiles();
}
