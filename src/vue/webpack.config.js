let path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "./src/index.js"),
  output: {
    filename: "vue2.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".json"],
  },
};
