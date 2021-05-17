/* eslint-disable func-names */
module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    files: [{ pattern: './tests/**/*.spec.js', watched: false }],
    frameworks: ['jasmine'],
    preprocessors: {
      './tests/**/*.spec.js': ['webpack']
    },

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },
    client: {
      captureConsole: false
    },
    reporters: ['spec'],
    webpack: {
      module: {
        loaders: [
          {
            test: /\.json$/,
            loader: 'json-loader'
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel?presets[]=env'
          }
        ]
      },
      resolve: {
        extensions: ['', '.webpack.js', '.js', '.ts']
      },
      node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
      },
      watch: true
    },
    webpackMiddleware: {
      noInfo: false,
      stats: 'errors-only'
    }
  });
};
