const wp = require('@cypress/webpack-preprocessor');
module.exports = on => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js'],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-typescript'],
                },
              },
            ],
          },
        ],
      },
    },
  };
  on('file:preprocessor', wp(options));
};
