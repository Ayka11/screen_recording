import { defineConfig } from "eslint/config";
import next from "eslint-config-next";

export default defineConfig([
  {
    ignores: ["android/**", "out/**", ".next/**", "node_modules/**"],
  },
  {
    extends: [...next],
  },
]);
