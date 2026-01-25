import { execFile } from "node:child_process";

export interface GitExecOptions {
  cwd: string;
  maxBuffer?: number;
}

export function runGit(args: string[], options: GitExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      args,
      {
        cwd: options.cwd,
        maxBuffer: options.maxBuffer ?? 20 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr?.toString().trim() || error.message));
          return;
        }
        resolve(stdout.toString());
      }
    );
  });
}
