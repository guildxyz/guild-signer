//webpack.config.js
const path = require("path");

module.exports = {
  mode: "production",
  devtool: false,
  entry: {
    main: "./body.ts",
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "signer-bundle.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
      },
    ],
  },
};
