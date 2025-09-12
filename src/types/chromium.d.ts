// types/chromium.d.ts
declare module '@sparticuz/chromium' {
  export const args: string[];
  export function executablePath(): Promise<string>;
  export const headless: boolean;
}