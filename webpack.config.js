const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = [
  'login', 'account', 'set_admin'
];

module.exports = {
  context: path.resolve(__dirname, 'client/src'),
  entry: pages.reduce((o, p) => ({...o, [p]: `./${p}.jsx`}), {}),
  devtool: process.env.PRODUCTION ? false : 'eval-cheap-source-map',
  mode: process.env.PRODUCTION ? 'production' : 'development',
  output: {
    filename: 'bundles/[name].js',
    path: path.resolve(__dirname, 'client/dist/public'),
    library: {
      name: 'Dist',
      type: 'global'
    }
  },
  plugins: pages.map(page => 
    new HtmlWebpackPlugin({
      template: `views/template.mustache`,
      filename: `../views/${page}.mustache`,
      chunks: [page],
      publicPath: '/'
    }))
    .concat(
      process.env.NO_MUSTACHE ? [
        new CopyPlugin({
            patterns: [
                { from: "./**/*.html", to: "./" }
            ]
        })
      ] : []),
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
  },
  module: {
    rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  }
};