module.exports = {
  entry: './workers/cryptoworker.ts',
  output: {
    filename: './workers/cryptoworker.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    loaders: [
      {test: /\.tsx?$/, loader: 'ts-loader'}
    ]
  }
};
