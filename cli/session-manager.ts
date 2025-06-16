import { Session } from "@agent/agent";
import { existsSync } from "@std/fs/exists";

export class SessionManager {
  constructor(private sessionDir: string) {
    if (!existsSync(sessionDir)) {
      Deno.mkdirSync(sessionDir, { recursive: true });
    }
  }

  async list() {
    const output: Session[] = [];
    for await (const item of Deno.readDir(this.sessionDir)) {
      output.push(await Session.load(`${this.sessionDir}/${item.name}`));
    }

    output.sort((a, b) => b.createdAt - a.createdAt);

    return output;
  }
}
