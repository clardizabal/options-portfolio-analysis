const path = require('path');

module.exports = {
    entry: './src/app.ts',
    // watch: true,
    output: {
      filename: 'app-bundle.js',
      path: path.resolve(__dirname, "lib/src")
    },
    devServer: {
      port: 3000,
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'awesome-typescript-loader?configFileName=src/tsconfig.json',
        },
      ],
    },
  };