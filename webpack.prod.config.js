const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: 'production',
  optimization: {
      minimizer: [
          new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: true
          }),
          new OptimizeCSSAssetsPlugin({})
      ],
      usedExports: true
    //   ,splitChunks: {
    //       chunks: 'all'
    //   }
  },
  entry: {
      index: './src/index.js'
  },
  target: 'web',
  devtool: '#source-map',
  plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
          template: "./src/templates/index.html",
          filename: "index.html",
          excludeChunks: [ 'server' ]
      }),
      new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true
      }),
      new MiniCssExtractPlugin({
          filename: "[name].css",
          chunkFilename: "[id].css"
      })
  ],
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader"
        }

    },
    {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
    },
    {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
            {loader: "url-loaders"}
        ]
    },
    {
        test: /\.html$/,
        use: {
            loader: "html-loader",
            options: { minimize: true }
        }
    }
    ]
  }
};