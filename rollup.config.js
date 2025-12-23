import { terser } from "@rollup/plugin-terser";

export default {
  input: "src/index.jsx",
  output: {
    file: "dist/bundle.js",
    format: "iife",
  },
  plugins: [terser()],
};
