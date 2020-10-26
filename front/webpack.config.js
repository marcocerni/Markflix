const path = require('path')

module.exports = {
  entry: {
    app: './src/index.js',
    admin: './src/admin.js',
    unsubscribe: './src/unsubscribe.js',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
    publicPath: '/src/public',
  },
  devServer: {
    publicPath: '/public/',
    compress: true,
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
}
