const { setupWebDriver, runTest } = require("../services/selenium");
const { parseCSV, executeTests } = require("../services/csv");
const { PrismaClient } = require("@prisma/client");
const { parseAsync } = require("json2csv");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { default: test } = require("node:test");

const runTests = async (req, res) => {
  try {
    console.log("Received body:", JSON.stringify(req.body, null, 2));
    const driver = await setupWebDriver();
    console.log("WebDriver setup complete.");

    const results = await runTest(driver, req.body.instructions, req.body.url);
    console.log("Test results:", results);
    res.status(200).json({ results });
  } catch (error) {
    console.error("Error during test execution:", error);
    // Send back the error message only in development mode for debugging
    if (process.env.NODE_ENV === "development") {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).send("Error during test execution.");
    }
  }
};

const saveTests = async (req, res) => {
  try {
    console.log("Received body:", JSON.stringify(req.body, null, 2));

    const { instructions, testId } = req.body;

    for (let index = 0; index < instructions.length; index++) {
      const instruction = instructions[index];
      const { action, searchKey, searchBy, textInput, status } = instruction;

      const testIdInt = parseInt(testId, 10);

      const createdInstruction = await prisma.instructions.create({
        data: {
          testId: testIdInt,
          action,
          sequence: index + 1,
          searchKey,
          searchBy,
          textInput,
          instructionStatus: status,
        },
      });

      console.log("Created Instruction:", createdInstruction);
    }

    res.status(200).json({ message: "Instrucciones creadas exitosamente" });
    console.log("se envio todo bien");
  } catch (error) {
    console.error("Error during test execution:", error);

    res.status(500).json({ error: "Error al guardar las instrucciones" });
  } finally {
    await prisma.$disconnect();
  }
};

const updateInstruction = async (req, res) => {
  const { instructionId } = req.params;
  const {
    action,
    sequence,
    searchKey,
    searchBy,
    textInput,
    instructionStatus,
  } = req.body;

  try {
    if (!instructionId) {
      return res.status(400).json({ error: "instructionId is required" });
    }

    const instruction = await prisma.instructions.findUnique({
      where: { instructionId: parseInt(instructionId, 10) },
    });

    if (!instruction) {
      return res.status(404).json({ error: "Instruction not found" });
    }

    const updatedInstruction = await prisma.instructions.update({
      where: { instructionId: parseInt(instructionId, 10) },
      data: {
        action,
        sequence,
        searchKey,
        searchBy,
        textInput,
        instructionStatus,
      },
    });

    res.status(200).json(updatedInstruction);
  } catch (error) {
    console.error("Error updating instruction:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const createTest = async (req, res) => {
  try {
    const { userId, directoryId, title } = req.body;

    if (!userId || !directoryId || !title) {
      return res
        .status(400)
        .json({ error: "userId, directoryId, and title are required fields." });
    }

    const userExists = await prisma.users.findUnique({
      where: { userId },
    });
    if (!userExists) {
      return res
        .status(400)
        .json({ error: "Invalid userId, user does not exist." });
    }

    const directoryExists = await prisma.directories.findUnique({
      where: { directoryId },
    });
    if (!directoryExists) {
      return res
        .status(400)
        .json({ error: "Invalid directoryId, directory does not exist." });
    }

    const newTest = await prisma.tests.create({
      data: {
        userId,
        directoryId,
        title,
        testStatus: false,
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    });

    res.status(201).json(newTest);
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const runTestsCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = req.file.path;

  try {
    const tests = await parseCSV(filePath);
    const driver = await setupWebDriver();
    const testResults = await executeTests(driver, tests);

    await driver.quit();
    res
      .status(200)
      .json({ message: "Tests completed and results saved.", testResults });
    console.log("Pruebas completadas y resultados .");
  } catch (error) {
    console.error("Error processing CSV file:", error);
    res.status(500).send("Error processing tests.");
  }
};

// CALCULATE TEST RESULTS putito

const calculateAllTestMetrics = async (req, res) => {
  try {
    const { directoryId } = req.params;

    const dirId = parseInt(directoryId);

    const tests = await prisma.tests.findMany({
      where: {
        directoryId: dirId,
      },
      select: {
        testId: true,
        title: true,
        instructions: {
          select: {
            instructionStatus: true,
            sequence: true,
          },
        },
      },
    });

    if (!tests.length) {
      return res
        .status(404)
        .json({ error: "No tests found for this directory" });
    }

    const testMetrics = tests.map((test) => {
      const testCount = test.instructions.length;
      const passedInstructions = test.instructions.filter(
        (i) => i.instructionStatus
      );
      const rejectedInstructions = test.instructions.filter(
        (i) => !i.instructionStatus
      );

      const passPercentage = (passedInstructions.length / testCount) * 100;
      const passedTests = passedInstructions.map((i) => `No.${i.sequence}`);
      const rejectedTests = rejectedInstructions.map((i) => `No.${i.sequence}`);

      return {
        testId: test.testId,
        title: test.title,
        testCount,
        passPercentage: passPercentage.toFixed(2),
        passedTests,
        rejectedTests,
        notExecutedTests: [],
      };
    });

    res.status(200).json(testMetrics);
  } catch (error) {
    console.error("Error calculating test metrics:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

const exportTestMetricsToCSV = async (req, res) => {
  try {
    const { directoryId } = req.params;
    const dirId = parseInt(directoryId);

    // Fetch all tests for the directory
    const tests = await prisma.tests.findMany({
      where: { directoryId: dirId },
      include: {
        instructions: true,
      },
    });

    if (!tests.length) {
      return res
        .status(404)
        .json({ error: "No tests found for this directory" });
    }

    const testMetrics = tests.map((test) => {
      const testCount = test.instructions.length;
      const passedInstructions = test.instructions.filter(
        (i) => i.instructionStatus
      );
      const rejectedInstructions = test.instructions.filter(
        (i) => !i.instructionStatus
      );

      const passPercentage = (passedInstructions.length / testCount) * 100;
      const passedTests = passedInstructions.map((i) => `No.${i.sequence}`);
      const rejectedTests = rejectedInstructions.map((i) => `No.${i.sequence}`);

      return {
        testId: test.testId,
        title: test.title,
        testCount,
        passPercentage: passPercentage.toFixed(2),
        passedTests: passedTests.join(", "),
        rejectedTests: rejectedTests.join(", "),
        notExecutedTests: [], // me pelan toda la verga
        instructions: test.instructions.map((inst) => ({
          instructionId: inst.instructionId,
          action: inst.action,
          sequence: inst.sequence,
          searchKey: inst.searchKey,
          searchBy: inst.searchBy,
          textInput: inst.textInput,
          instructionStatus: inst.instructionStatus,
        })),
      };
    });

    const csv = await parseAsync(testMetrics, {
      fields: [
        "testId",
        "title",
        "testCount",
        "passPercentage",
        "passedTests",
        "rejectedTests",
        "notExecutedTests",
        "instructions",
      ],
    });

    const exportsDir = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }
    const filePath = path.join(exportsDir, "test_metrics.csv");

    fs.writeFileSync(filePath, csv);
    console.log(`CSV file written successfully to ${filePath}`);

    // Send the file to the client
    res.download(filePath, "test_metrics.csv", (err) => {
      if (err) {
        console.error("Error sending the file:", err);
        res.status(500).json({ error: "Error sending the file" });
      } else {
        console.log("File sent successfully");
      }
      // Optionally delete the file after sending it to the client CHECAR BIEN ESTE PEDO SIU REMINDER
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error exporting test metrics to CSV:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

const exportIndividualTestMetricsToCSV = async (req, res) => {
  try {
    const { testId } = req.params;
    const tId = parseInt(testId, 10);

    const test = await prisma.tests.findUnique({
      where: { testId: tId },
      include: {
        instructions: true,
      },
    });

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    const testCount = test.instructions.length;
    const passedInstructions = test.instructions.filter(
      (i) => i.instructionStatus
    );
    const rejectedInstructions = test.instructions.filter(
      (i) => !i.instructionStatus
    );

    const passPercentage = (passedInstructions.length / testCount) * 100;
    const passedTests = passedInstructions.map((i) => `No.${i.sequence}`);
    const rejectedTests = rejectedInstructions.map((i) => `No.${i.sequence}`);

    const testMetrics = {
      testId: test.testId,
      title: test.title,
      testCount,
      passPercentage: passPercentage.toFixed(2),
      passedTests: passedTests.join(", "),
      rejectedTests: rejectedTests.join(", "),
      notExecutedTests: [],
      instructions: test.instructions.map((inst) => ({
        instructionId: inst.instructionId,
        action: inst.action,
        sequence: inst.sequence,
        searchKey: inst.searchKey,
        searchBy: inst.searchBy,
        textInput: inst.textInput,
        instructionStatus: inst.instructionStatus,
      })),
    };

    const csv = await parseAsync([testMetrics], {
      fields: [
        "testId",
        "title",
        "testCount",
        "passPercentage",
        "passedTests",
        "rejectedTests",
        "notExecutedTests",
        "instructions",
      ],
    });

    const exportsDir = path.join(__dirname, "../../exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }
    const filePath = path.join(exportsDir, `test_${test.testId}.csv`);

    fs.writeFileSync(filePath, csv);
    console.log(`CSV file written successfully to ${filePath}`);

    res.download(filePath, `test_${test.testId}.csv`, (err) => {
      if (err) {
        console.error("Error sending the file:", err);
        res.status(500).json({ error: "Error sending the file" });
      } else {
        console.log("File sent successfully");
      }

      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error exporting test metrics to CSV:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

const getInstructionsByTestId = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!testId) {
      return res.status(400).json({ error: "testId is required" });
    }

    const instructions = await prisma.instructions.findMany({
      where: { testId: parseInt(testId, 10) },
      orderBy: { sequence: "asc" },
    });

    if (!instructions.length) {
      return res
        .status(404)
        .json({ error: "No instructions found for this testId" });
    }

    res.status(200).json(instructions);
  } catch (error) {
    console.error("Error fetching instructions:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const deleteTest = async (req, res) => {
  const { testId } = req.params;

  try {
    // Eliminar instrucciones relacionadas manualmente
    await prisma.instructions.deleteMany({
      where: { testId: parseInt(testId, 10) },
    });

    // Eliminar el test
    const deletedTest = await prisma.tests.delete({
      where: { testId: parseInt(testId, 10) },
    });

    // // Delete the test
    // await prisma.tests.delete({
    //   where: { testId: tId },
    // });

    res.status(200).json({ message: "Test deleted successfully." });
  } catch (error) {
    console.error("Error deleting test:", error);
    // res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

const deleteInstruction = async (req, res) => {
  const { instructionId } = req.params;

  try {
    const instId = parseInt(instructionId, 10);
    if (isNaN(instId)) {
      return res
        .status(400)
        .json({ error: "Invalid instructionId: Must be an integer." });
    }

    // Check if the instruction exists
    const instruction = await prisma.instructions.findUnique({
      where: { instructionId: instId },
    });

    if (!instruction) {
      return res.status(404).json({ error: "Instruction not found" });
    }

    // Delete the instruction
    await prisma.instructions.delete({
      where: { instructionId: instId },
    });

    res.status(200).json({ message: "Instruction deleted successfully." });
  } catch (error) {
    console.error("Error deleting instruction:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  updateInstruction,
  deleteInstruction,
  createTest,
  runTests,
  runTestsCSV,
  calculateAllTestMetrics,
  exportTestMetricsToCSV,
  exportIndividualTestMetricsToCSV,
  getInstructionsByTestId,
  deleteTest,
  saveTests,
};
