var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var MiniCssExtractPlugin = require('mini-css-extract-plugin')
var rootAssetPath = path.resolve(__dirname, '../build')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var port = 3000

module.exports = {
  entry: {
    bundle: ['@babel/polyfill', './src/index.tsx', require.resolve('regenerator-runtime/runtime.js')],
  },
  output: {
    path: rootAssetPath,
    filename: '[name].js',
    publicPath: '',
  },
  resolve: {
    fallback: {
      process: require.resolve('process/browser'),
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      asset: require.resolve('assert'),
    },
    modules: ['node_modules', path.resolve(__dirname, '..', 'src')],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    //inline: true,
    host: 'localhost',
    port: port,
    //contentBase: __dirname,
    proxy: {
      '/api/**': {
        target: 'http://localhost:9999',
        secure: false,
        changeOrigin: true,
      },
    },
  },

  //devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|pdf|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, 'babel.conf.js'),
          },
        },
      },
      {
        test: /\.(css)|(scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: { reportFiles: ['src/**/*.{ts,tsx}', '!src/skip.ts'] },
      },
    ],
  },
  devtool: 'source-map',
  mode: 'development',
  plugins: [
    new MiniCssExtractPlugin({ filename: 'app.css' }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
  externals: {
    // only define the dependencies you are NOT using as externals!
    canvg: 'canvg',
    html2canvas: 'html2canvas',
    dompurify: 'dompurify',
  },
}
