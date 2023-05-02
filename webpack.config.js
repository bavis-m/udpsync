const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = [
  'login', 'account', 'set_admin'
];

const plugins = [];
for (let page of pages)
{
  plugins.push(
    new HtmlWebpackPlugin({
      template: `views/template.mustache`,
      filename: `../views/${page}.mustache`,
      chunks: [page],
      publicPath: '/',
      minify: false
    })
  );
}
if (process.env.NO_MUSTACHE)
{
  plugins.push(new CopyPlugin({
    patterns: [
        { from: "./**/*.html", to: "./" }
    ]
  }));
}

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
  plugins: plugins,
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
    },
    runtimeChunk: 'single'
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