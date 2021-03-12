const { readFileSync, writeFileSync, unlinkSync } = require("fs");
const { execSync } = require("child_process");

const originalREADME = readFileSync("./README.md");
const originalPackage = readFileSync("./package.json");
const originalChangelog = readFileSync("./CHANGELOG.md");
const package = JSON.parse(readFileSync("./package.json"));
delete package.devDependencies;
delete package.scripts;
delete package.imports;

package.description = package.description.replace(
  "Universal ",
  "(Node.JS ESM Runtime) "
);

for (const exportPath of Object.keys(package.exports)) {
  if (exportPath.startsWith("./webcrypto")) {
    delete package.exports[exportPath];
  } else if (
    typeof package.exports[exportPath] === "object" &&
    "import" in package.exports[exportPath]
  ) {
    package.exports[exportPath] = package.exports[exportPath].import;
  }
}

const deletedKeywords = new Set([
  "browser",
  "isomorphic",
  "universal",
  "webcrypto",
]);
package.keywords = package.keywords.filter((keyword) => {
  return !deletedKeywords.has(keyword);
});

package.files.push("!dist/browser/**/*");
package.files.push("!dist/node/cjs/**/*");
package.files.push("!dist/**/package.json");

package.name = "jose-node-esm-runtime";
package.type = "module";

writeFileSync("./package.json", JSON.stringify(package, null, 2) + "\n");
writeFileSync(
  "./README.md",
  `# jose

> ${package.description} using the Node.js \`crypto\` module.

⚠️ This distribution only supports the Browser ESM runtime.
Its purpose is to offer a distribution of \`jose\` with a smaller bundle/install
size.

For the universal module see [npmjs.com/package/jose](https://www.npmjs.com/package/jose)

## Support

If you or your business use \`jose\`, please consider becoming a [sponsor][support-sponsor] so I can continue maintaining it and adding new features carefree.

## Install

\`\`\`console
npm install jose@npm:${package.name}
\`\`\`

## Documentation

See [${package.homepage.replace("https://", "")}](${package.homepage})

[support-sponsor]: https://github.com/sponsors/panva
`
);
unlinkSync("./CHANGELOG.md");

// Release
execSync("npm publish");

writeFileSync("./package.json", originalPackage);
writeFileSync("./CHANGELOG.md", originalChangelog);
writeFileSync("./README.md", originalREADME);
