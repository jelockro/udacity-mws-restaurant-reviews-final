const HtmlWebpackPlugin = require('html-webpack-plugin'); 

module.exports = {
  mode: "production",
  entry: __dirname + "/src/app/", 
  output: {
    path: __dirname + 'build', // Folder to store generated bundle
    filename: 'bundle.js',  // Name of generated bundle after build
    publicPath: '/' // public URL of the output directory when referenced in a browser
  },
  module: {  // where we define file patterns and their loaders
      rules: [ 
      ]
  },
  plugins: [  // Array of plugins to apply to build chunk
      new HtmlWebpackPlugin({
          template: __dirname + "/src/public/index.html",
          inject: 'body'
      })
  ],
  devServer: {  // configuration for webpack-dev-server
      contentBase: './src/public',  //source of static assets
      port: 7700, // port to run dev-server
  } 
};