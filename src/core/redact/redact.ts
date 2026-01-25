import { REDACTION_RULES } from "./patterns";

export function maskSensitive(input: string): string {
  let output = input;
  for (const rule of REDACTION_RULES) {
    output = output.replace(rule.pattern, rule.replace);
  }
  return output;
}
