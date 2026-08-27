#!/usr/bin/env node
/**
 * Emits the design tokens as a CSS :root block into the CMS stylesheet.
 *
 * Run: node scripts/build-css-tokens.mjs
 *
 * This is what keeps the Next.js CMS on the exact same palette and spacing as
 * the Expo app: both read packages/shared/src/design-tokens.ts, so the CMS
 * cannot drift again. It writes between two sentinel comments in globals.css;
 * if it runs before the CSS is bundled (it is wired into the build), the tokens
 * are always fresh.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cssVariables } from "../packages/shared/src/design-tokens.ts";

const CSS_PATH = resolve(import.meta.dirname, "..", "src", "app", "globals.css");

const OPEN = "/* @design-tokens:start (auto-generated — do not edit) */";
const CLOSE = "/* @design-tokens:end */";

// Font is injected by next/font as --font-sans on <body>, so it is deliberately
// not emitted here: a :root value would clobber the webfont.
const lines = [OPEN, "  :root {"];
for (const [name, value] of Object.entries(cssVariables())) {
  lines.push(`    --${name}: ${value};`);
}
lines.push("  }");
lines.push(`  ${CLOSE}`);

const css = readFileSync(CSS_PATH, "utf8");

let next;
if (css.includes(OPEN)) {
  const start = css.indexOf(OPEN);
  const end = css.indexOf(CLOSE, start) + CLOSE.length;
  next = css.slice(0, start) + lines.join("\n") + css.slice(end);
} else {
  next = `${lines.join("\n")}\n\n${css}`;
}

writeFileSync(CSS_PATH, next);
console.log(`tokens written to globals.css (${Object.keys(cssVariables()).length} variables)`);
