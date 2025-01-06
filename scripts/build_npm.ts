import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: {
      test: "dev",
    },
  },
  // needed because @std/assert types were not checking for some reason
  filterDiagnostic(diagnostic) {
    return !diagnostic.file?.fileName.includes("@std/assert");
  },
  package: {
    // package.json properties
    name: "garlic-nan",
    version: Deno.args[0],
    description: "Add some flavor to your NaN",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/synaptogenic/garlic-nan.git",
    },
    bugs: {
      url: "https://github.com/synaptogenic/garlic-nan/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
