const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// const { authenticateToken } = require("../services/jwt");

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};

const createUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingUsername = await prisma.users.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.SECRET, {
      expiresIn: "10h",
    });

    return res.status(201).json({ token, newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

module.exports = {
  createUser,
  getAllUsers,
};

// userControllers.js

//esta madre es nomas pa calar el prisma, no es el login final. Falta ver que peige con la auth

// const { email, password } = req.body;
// try {
//   const user = await prisma.users.findUnique({
//     where: { email },
//   });

//   console.log(user);

//   if (!user) {
//     console.error("Login failed: User not found for email:", email);
//     return res.status(404).json({ error: "User not found" });
//   }

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (isMatch) {
//     const token = jwt.sign({ userId: user.userId }, "your_secret_key", {
//       expiresIn: "1h",
//     });

//     const userID = user.userId;
//     return res.json({ token, userID });
//   } else {
//     console.error("Login failed: Invalid credentials for user:", email);
//     return res.status(401).json({ error: "Invalid credentials" });
//   }

//   // console.log("Login successful for user:", user.userId);
//   // res.json({ message: "Login successful", userId: user.userId });
// } catch (error) {
//   console.error("Error logging in:", error);
//   res.status(500).json({ error: "Failed to login" });
// }
// console.log("Si funciona papu")
