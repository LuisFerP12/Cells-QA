const csv = require("fast-csv");
const fs = require("fs");
const { setupWebDriver, runTest } = require("./selenium");
const express = require("express");
const next = require("next");
const multer = require("multer");
const upload = multer({ dest: "/tmp/" });
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const tests = [];
    let currentUrl = "";
    let currentInstructions = [];

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("error", (error) => reject(error))
      .on("data", (row) => {
        if (row.url && row.url.trim()) {
          if (currentUrl) {
            tests.push({ url: currentUrl, instructions: currentInstructions });
          }
          currentUrl = row.url.trim();
          currentInstructions = [];
        }
        currentInstructions.push({
          textInput: row.textInput,
          searchKey: row.searchKey,
          searchBy: row.searchBy,
          action: row.action,
        });
      })
      .on("end", () => {
        if (currentUrl) {
          tests.push({ url: currentUrl, instructions: currentInstructions });
        }
        resolve(tests);
      });
  });
}

async function executeTests(driver, tests) {
  const testResults = [];

  for (const test of tests) {
    const urlResults = { url: test.url, instructionsResults: [] };

    for (const instruction of test.instructions) {
      try {
        const result = await runTest(driver, [instruction], test.url);
        urlResults.instructionsResults.push({
          ...instruction,
          result: "Success",
          details: result,
        });
      } catch (error) {
        urlResults.instructionsResults.push({
          ...instruction,
          result: "Failure",
          error: error.message,
        });
      }
    }

    testResults.push(urlResults);
  }

  return testResults;
}

module.exports = { parseCSV, executeTests };
