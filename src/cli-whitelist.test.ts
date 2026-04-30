import { describe, it, expect } from "vitest";
import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { registerWhitelistCommand } from "./cli-whitelist";

function writeTempFile(content: string, ext = ".env"): string {
  const file = path.join(os.tmpdir(), `stackdiff-wl-${Date.now()}${ext}`);
  fs.writeFileSync(file, content, "utf-8");
  return file;
}

function buildProgram() {
  const program = new Command();
  program.exitOverride();
  registerWhitelistCommand(program);
  return program;
}

describe("registerWhitelistCommand", () => {
  it("runs without error when all keys are whitelisted", () => {
    const envFile = writeTempFile("FOO=1\nBAR=2\n");
    const wlFile = writeTempFile("FOO\nBAR", ".txt");
    const program = buildProgram();
    expect(() =>
      program.parse(["whitelist", "-e", envFile, "-w", wlFile], {
        from: "user",
      })
    ).not.toThrow();
  });

  it("outputs JSON when --json flag is set", () => {
    const envFile = writeTempFile("FOO=1\n");
    const wlFile = writeTempFile("FOO", ".txt");
    const program = buildProgram();
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);
    program.parse(["whitelist", "-e", envFile, "-w", wlFile, "--json"], {
      from: "user",
    });
    console.log = origLog;
    const parsed = JSON.parse(logs[0]);
    expect(parsed).toHaveProperty("allowedCount");
    expect(parsed).toHaveProperty("blockedCount");
  });

  it("throws when --strict and blocked keys exist", () => {
    const envFile = writeTempFile("FOO=1\nSECRET=xyz\n");
    const wlFile = writeTempFile("FOO", ".txt");
    const program = buildProgram();
    const origExit = process.exit;
    let exitCode: number | undefined;
    (process as any).exit = (code: number) => { exitCode = code; };
    program.parse(["whitelist", "-e", envFile, "-w", wlFile, "--strict"], {
      from: "user",
    });
    (process as any).exit = origExit;
    expect(exitCode).toBe(1);
  });
});
