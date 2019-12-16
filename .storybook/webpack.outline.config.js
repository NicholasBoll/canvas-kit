const path = require('path');
const HappyPack = require('happypack');

const modulesPath = path.resolve(__dirname, '../modules');
const utilsPath = path.resolve(__dirname, '../utils');

const customRules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    include: [modulesPath, utilsPath],
    use: [
      {
        loader: 'happypack/loader?id=ts', // creates style nodes from JS strings
      },
      {
        loader: path.resolve('./')
      }
    ]
  },
];

// TODO: We merge with Create React App's webpack.config.js since we include `react-scripts` as a devDep
// There is some config from CRA that we need in order to build Storybook correctly
// If you build without it, you get weird behavior like Button backgrounds disappearing
module.exports = async ({config}) => {
  // Exclude all node_modules from babel-loader
  config.module.rules
    .find(rule => /mjs\|jsx/.test(rule.test.toString()))
    .exclude.push(/node_modules/);

  // Remove any scss/sass rules that ship with storybook
  config.module.rules = config.module.rules.filter(rule => !/scss|sass/.test(rule.test.toString()));

  // Filter out extraneous rules added by CRA (react-scripts)
  // react-scripts automatically adds js/ts matchers for a `src` folder which we don't use so these rules are moot
  config.module.rules = config.module.rules.filter(
    rule => !/js\|mjs\|jsx\|ts\|tsx/.test(rule.test.toString())
  );

  // Add our custom rules
  config.module.rules.push(...customRules);

  // Add `.ts` and `.tsx` as a resolvable extension.
  config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx'];

  config.plugins.push(
    new HappyPack({
      id: 'ts',
      threads: 2,
      loaders: [
        babelLoader,
        {
          path: 'ts-loader',
          query: {
            happyPackMode: true,
            configFile: path.join(__dirname, './tsconfig.json'),
          },
        },
      ],
    })
  );

  return config;
};
