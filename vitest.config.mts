import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["**/*.test.{ts,tsx}"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json"],
      reportsDirectory: "./coverage",
      include: [
        "lib/**/*.ts",
        "app/**/lib/**/*.ts",
        "app/**/hooks/**/*-utils.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "lib/generated/**",
        "lib/*-actions.ts",
        "lib/*-action.ts",
        "lib/print-*.ts",
        "lib/require-menu-access.ts",
        "lib/global-search-actions.ts",
      ],
    },
  },
});
