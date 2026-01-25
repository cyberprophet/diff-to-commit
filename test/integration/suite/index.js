const path = require("node:path");
const fs = require("node:fs");
const Mocha = require("mocha");

function run() {
  const mocha = new Mocha({
    ui: "tdd",
    color: true
  });

  const testsRoot = path.resolve(
    __dirname,
    "../../../out/test/test/integration/suite"
  );
  const files = collectTestFiles(testsRoot);
  for (const file of files) {
    mocha.addFile(file);
  }

  return new Promise((resolve, reject) => {
    try {
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

function collectTestFiles(root) {
  const results = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".test.js")) {
      results.push(fullPath);
    }
  }

  return results;
}

module.exports = { run };
