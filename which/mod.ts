import * as path from "node:path";
import * as fs from "node:fs";

export function which(name: string): string | undefined {
  const extensions = Deno.build.os === "windows"
    ? (Deno.env.get("PATHEXT") || ".EXE;.CMD;.BAT;.COM").split(";")
    : [""];
  const pathEnv = Deno.env.get("PATH") || "";
  const pathDelimiter = Deno.build.os === "windows" ? ";" : ":";

  for (const dir of pathEnv.split(pathDelimiter)) {
    for (const ext of extensions) {
      const fullPath = path.join(dir, name + ext);
      try {
        const fileInfo = fs.statSync(fullPath);
        if (
          fileInfo.isFile() &&
          (Deno.build.os !== "windows" ? (fileInfo.mode & 0o111) !== 0 : true)
        ) {
          return fullPath;
        }
      } catch (e) {
        if ((e as { code?: string }).code !== "ENOENT") {
          throw e;
        }
      }
    }
  }

  return undefined;
}
