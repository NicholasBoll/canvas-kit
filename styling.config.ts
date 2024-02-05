import {Config} from '@workday/canvas-kit-styling-transform';

const config: Config = {
  prefix: 'cnvs',
  getFileName(path) {
    return path
      .replace(/modules\/([^/]+)\/([^/]+)\/.+/, (_, modulePath, subPath) => {
        return `modules/${modulePath.replace('react', 'css')}/${subPath}.css`;
      })
      .toLowerCase();
  },
  fallbackFiles: [
    '@workday/canvas-tokens-web/css/base/_variables.css',
    '@workday/canvas-tokens-web/css/brand/_variables.css',
    '@workday/canvas-tokens-web/css/system/_variables.css',
  ],
};

export default config;
