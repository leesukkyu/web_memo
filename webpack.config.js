const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "js"),
    filename: "entry.js"
  },
  devtool: "inline-source-map"
};
