import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: [
      "tests/engine/**/*.test.ts",
      "tests/registry/**/*.test.ts",
      "tests/content/**/*.test.ts",
      "tests/design/**/*.test.ts",
      "tests/lib/**/*.test.ts",
    ],
    env: { NODE_ENV: "test" },
    coverage: {
      provider: "v8",
      include: ["src/engine/**/*.ts"],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        branches: 100,
      },
    },
  },
});
