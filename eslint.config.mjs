import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Security-related custom rules
  {
    rules: {
      // Security: Block dangerous functions
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Security: Warn on console usage (should be removed before production)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Code quality
      "no-var": "error",
      "prefer-const": "error",
      "no-param-reassign": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Project-specific ignores:
    "plan/**",
  ]),
]);

export default eslintConfig;
