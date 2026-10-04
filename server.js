const express = require("express");
const cors = require("cors");
require("dotenv").config();

const router = require("./src/infrastructure/router");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});