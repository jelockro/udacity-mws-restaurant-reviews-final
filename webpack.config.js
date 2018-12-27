const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  mode: 'development',
  optimization: {
      usedExports: true
    //   ,splitChunks: {
    //       chunks: 'all'
    //   }
  },
  entry: {
      index: './src/index.js'
  },
  devtool: 'inline-source-map',
  devServer: {
      contentBase: './dist',
      hot: true
  },
  plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
          title: 'Progressive Web Application'
      }),
      new webpack.HotModuleReplacementPlugin(),
      new WorkboxPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true
      })
  ],
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
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
           'style-loader',
           'css-loader'
         ]
       },
       {
           test: /\.(png|svg|jpg|gif)$/,
           use: [
               'file-loader'
           ]
       }
     ]
   }
};