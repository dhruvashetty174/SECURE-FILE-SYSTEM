const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  filePath: String,
  folderPath: String,
  size: Number,
  ruleType: String,
  passcode: String,
  expiry: Date,
  publicLink: String
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
