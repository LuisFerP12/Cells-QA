const { Builder, By, Key, until } = require("selenium-webdriver");
const levenshtein = require("fast-levenshtein");
const chrome = require("selenium-webdriver/chrome");

async function setupWebDriver() {
  const options = new chrome.Options();
  // Uncomment to run headless if needed
  // options.addArguments('headless');
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
}

async function findElementWithFallbacks(driver, searchBy, searchKey) {
  const basicSelectors = [
    { by: searchBy, value: searchKey },
    { by: "id", value: searchKey },
    { by: "css", value: `.${searchKey}` },
    { by: "css", value: `#${searchKey}` },
    { by: "name", value: searchKey },
    { by: "xpath", value: `//*[@id="${searchKey}"]` },
    { by: "xpath", value: `//*[@class="${searchKey}"]` },
    { by: "xpath", value: `//*[@name="${searchKey}"]` },
    { by: "css", value: `[name="${searchKey}"]` },
    { by: "css", value: `[class*="${searchKey}"]` },
    { by: "css", value: `[id*="${searchKey}"]` },
    { by: "xpath", value: `//*[contains(@class, "${searchKey}")]` },
    { by: "xpath", value: `//*[contains(@id, "${searchKey}")]` },
    { by: "xpath", value: `//*[contains(@name, "${searchKey}")]` },
    { by: "xpath", value: `//*[contains(text(), "${searchKey}")]` },
    { by: "css", value: `[class^="${searchKey}"]` },
    { by: "css", value: `[id^="${searchKey}"]` },
    { by: "css", value: `[name^="${searchKey}"]` },
    { by: "css", value: `[class$="${searchKey}"]` },
    { by: "css", value: `[id$="${searchKey}"]` },
    { by: "css", value: `[name$="${searchKey}"]` },
    { by: "xpath", value: `//*[@*="${searchKey}"]` },
    { by: "xpath", value: `//*[contains(@*, "${searchKey}")]` },
  ];

  try {
    let element = await driver.findElement(By[searchBy](searchKey));
    // let element = await driver.findElement(By[selector.by](selector.value));
    // console.log(`Found element with selector: ${selector.by} = ${selector.value}`);

    return { element, fallback: null };
  } catch (error) {
    console.log(`Failed with base selectors: ${searchBy} = ${searchKey}`);
  }

  console.log("First Self Healing");
  for (const selector of basicSelectors) {
    try {
      let element = await driver.findElement(By[selector.by](selector.value));
      console.log(
        `Found element with selector: ${selector.by} = ${selector.value}`
      );
      const id = await element.getAttribute("id");
      const className = await element.getAttribute("class");
      const name = await element.getAttribute("name");
      let text = await element.getText();

      closestFallback = { id, className, name, text };
      return { element: null, fallback: closestFallback };
    } catch (error) {
      console.log(`Failed with selector: ${selector.by} = ${selector.value}`);
    }
  }

  // Fallback logic
  let closestFallback = null;
  const elements = await driver.findElements(By.css("*"));
  let minDistance = Infinity;

  for (const element of elements) {
    const id = await element.getAttribute("id");
    const className = await element.getAttribute("class");
    const name = await element.getAttribute("name");
    let text = await element.getText();

    // Normalize text by removing extra whitespace
    text = text.replace(/\s+/g, " ").trim();

    // Calculate Levenshtein distance for better matching
    const distances = [
      levenshtein.get(searchKey, id || ""),
      levenshtein.get(searchKey, className || ""),
      levenshtein.get(searchKey, name || ""),
      levenshtein.get(searchKey, text || ""),
    ];

    const minLocalDistance = Math.min(...distances);

    if (minLocalDistance < minDistance) {
      minDistance = minLocalDistance;
      closestFallback = { id, className, name, text };
    }
  }

  if (closestFallback && minDistance <= 5) {
    // Assuming 5 as a threshold for closeness
    return { element: null, fallback: closestFallback };
  }

  throw new Error(`Element not found using any method: ${searchKey}`);
}

async function runTest(driver, instructions, url) {
  await driver.get(url);
  const results = [];

  for (const instruction of instructions) {
    const { action, searchBy, searchKey, textInput } = instruction;
    try {
      const { element, fallback } = await findElementWithFallbacks(
        driver,
        searchBy,
        searchKey
      );
      if (fallback) {
        results.push({ status: "Fallback", fallback: fallback });
        continue;
      }

      switch (action) {
        case "sendKeys":
          await element.sendKeys(textInput);
          results.push({ status: "Passed" });
          break;
        case "click":
          await element.click();
          results.push({ status: "Passed" });
          break;
        case "getText":
          const text = await element.getText();
          if (text.trim() === textInput.trim()) {
            results.push({ status: "Passed" });
          } else {
            results.push({ status: "Failed" });
          }
          break;
        default:
          results.push({ status: "Undefined Action" });
          break;
      }
    } catch (error) {
      console.error(`Error performing action: ${action}`, error);
      results.push({ status: "Error", error: error.toString() });
    }
  }

  return results;
}

module.exports = {
  setupWebDriver,
  runTest,
};
