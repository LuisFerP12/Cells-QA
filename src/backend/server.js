// backend/server.js
const express = require("express");
const next = require("next");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const upload = multer({ dest: "/tmp/" });
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");
const teamsRoutes = require("./routes/teamsRoutes");
const projectRoutes = require("./routes/projectRoutes");
const filesRoutes = require("./routes/filesRoutes");
const cors = require("cors");


app.prepare().then(() => {
  const server = express();

  

  server.use(express.json());
  server.use(cors());

  server.use("/api/users", userRoutes);
  server.use("/api/tests", testRoutes);
  server.use("/api/teams", teamsRoutes);
  server.use("/api/projects", projectRoutes);
  server.use("/api/files", filesRoutes);
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3005, (err) => {
    if (err) throw err;
    console.log("> Servidor listo en http://localhost:3005");
  });
});
