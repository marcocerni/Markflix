const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/src/public',
  },
  devServer: {
    publicPath: '/public/',
    compress: true,
    port: 8080,
  },
};
