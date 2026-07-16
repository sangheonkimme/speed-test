import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    include: [
      "features/**/*.test.{js,jsx}",
      "app/**/*.test.{js,jsx}",
      "content/**/*.test.{js,jsx}",
    ],
  },
});
