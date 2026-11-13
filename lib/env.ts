// Reads a required environment variable, failing with its name if missing.
// Pass `process.env.NEXT_PUBLIC_…` as `value` in code that runs in the browser,
// so Next.js can inline it.
export function env(name: string, value = process.env[name]): string {
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}
