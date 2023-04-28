const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'client/src'),
  entry: [
    "./test.js"
  ],
  devtool: process.env.PRODUCTION ? false : 'eval-cheap-source-map',
  mode: process.env.PRODUCTION ? 'production' : 'development',
  output: {
    filename: 'bundles/[name].js',
    path: path.resolve(__dirname, 'client/dist'),
  },
  plugins: process.env.NO_MUSTACHE ? [
    new CopyPlugin({
        patterns: [
            { from: "./**/*.html", to: "./" }
        ]
    })
  ] : [],
  module: {
    rules: [
        {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }
    ]
  },
  resolve: {
    extensions: ["*", ".js"]
  }
};