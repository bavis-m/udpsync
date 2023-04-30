const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entries = [
  'toast'
];

const pages = {
  'login': ['toast'],
  'account': ['toast'],
  'set_admin': ['toast']
};

module.exports = {
  context: path.resolve(__dirname, 'client/src'),
  entry: entries.reduce((o, e) => ({...o, [e]: `./${e}.jsx`}), {}),
  devtool: process.env.PRODUCTION ? false : 'eval-cheap-source-map',
  mode: process.env.PRODUCTION ? 'production' : 'development',
  output: {
    filename: 'bundles/[name].js',
    path: path.resolve(__dirname, 'client/dist/public'),
    library: {
      name: ['Dist', '[name]'],
      type: 'var'
    }
  },
  plugins: Object.keys(pages).map(page => 
    new HtmlWebpackPlugin({
      template: `views/${page}.mustache`,
      filename: `../views/${page}.mustache`,
      chunks: pages[page],
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