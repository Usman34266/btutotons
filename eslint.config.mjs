import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  // Engine is pure TypeScript: no React, no Next.js, no DOM.
  {
    files: ["src/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "react-dom", "react/*", "next", "next/*"],
              message: "src/engine must stay framework-free.",
            },
            {
              group: ["@/components/*", "@/app/*", "@/lib/*", "@/content/*"],
              message: "Engine dependencies point inward only.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "localStorage",
        "navigator",
      ],
    },
  },

  // Everything outside the engine imports it only through the facade.
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
      "src/content/**/*.ts",
      "src/registry/**/*.ts",
      "src/config/**/*.ts",
      "scripts/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/engine/(?!index$).+",
              message:
                "Import the engine only via '@/engine' (engine/index.ts facade).",
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    ".lighthouseci/**",
    ".wrangler/**",
    ".claude/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
