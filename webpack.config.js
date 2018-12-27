const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals')
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
      index: './src/index.js',
      server: './src/server.js'
  },
  devtool: 'inline-source-map',
  devServer: {
      contentBase: './dist',
      hot: true
  },
  plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
          template: "./src/templates/index.html",
          filename: "index.html",
          excludeChunks: [ 'server' ]
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
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'node',
  node: {
      // Need this when working with express, otherwise the build fails
      __dirname: false,
      __filename: false, 
  },
  //externals: [nodeExternals()], // Need this to avoid error when working with express
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
    },
    {
        test: /\.html$/,
        use: {loader: "html-loader"}
    }
    ]
  }
};