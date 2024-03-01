const express = require("express");
const router = require("./routes");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/v1", router);

app.listen(3000);
