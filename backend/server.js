require("dotenv").config(); // MUST be first

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

console.log("MONGO_URI =", process.env.MONGO_URI); // Debug: check if loaded

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/files", require("./routes/file.routes"));
app.use("/download", require("./routes/download.routes"));

// Connect DB and start server unless running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
