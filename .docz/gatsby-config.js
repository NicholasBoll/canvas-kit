const { merge } = require('lodash/fp')

let custom
try {
  custom = require('./gatsby-config.custom')
} catch (err) {
  custom = {}
}

const config = {
  siteMetadata: {
    title: 'Canvas Kit',
    description: 'My awesome app using docz',
  },
  plugins: [
    {
      resolve: 'gatsby-theme-docz',
      options: {
        typescript: true,
        ts: false,
        propsParser: true,
        'props-parser': true,
        debug: false,
        native: false,
        openBrowser: false,
        o: false,
        open: false,
        'open-browser': false,
        root: '/Users/nicholas.boll/projects/canvas-kit/.docz',
        base: '/',
        source: './',
        src: './',
        files: '**/*.{md,markdown,mdx}',
        ignore: [{}, {}, {}, {}, {}],
        public: '/public',
        dest: '.docz/dist',
        d: '.docz/dist',
        editBranch: 'master',
        eb: 'master',
        'edit-branch': 'master',
        config: '',
        title: 'Canvas Kit',
        description: 'My awesome app using docz',
        host: 'localhost',
        port: 3000,
        p: 3000,
        separator: '-',
        themeConfig: {},
        docgenConfig: {},
        menu: [],
        mdPlugins: [],
        hastPlugins: [],
        paths: {
          root: '/Users/nicholas.boll/projects/canvas-kit',
          templates:
            '/Users/nicholas.boll/projects/canvas-kit/node_modules/docz-core/dist/templates',
          packageJson: '/Users/nicholas.boll/projects/canvas-kit/package.json',
          docz: '/Users/nicholas.boll/projects/canvas-kit/.docz',
          cache: '/Users/nicholas.boll/projects/canvas-kit/.docz/.cache',
          app: '/Users/nicholas.boll/projects/canvas-kit/.docz/app',
          appPublic: '/Users/nicholas.boll/projects/canvas-kit/.docz/public',
          appNodeModules:
            '/Users/nicholas.boll/projects/canvas-kit/node_modules',
          appPackageJson:
            '/Users/nicholas.boll/projects/canvas-kit/package.json',
          appYarnLock:
            '/Users/nicholas.boll/projects/canvas-kit/node_modules/docz-core/yarn.lock',
          ownNodeModules:
            '/Users/nicholas.boll/projects/canvas-kit/node_modules/docz-core/node_modules',
          gatsbyConfig:
            '/Users/nicholas.boll/projects/canvas-kit/gatsby-config.js',
          gatsbyBrowser:
            '/Users/nicholas.boll/projects/canvas-kit/gatsby-browser.js',
          gatsbyNode: '/Users/nicholas.boll/projects/canvas-kit/gatsby-node.js',
          gatsbySSR: '/Users/nicholas.boll/projects/canvas-kit/gatsby-ssr.js',
          importsJs:
            '/Users/nicholas.boll/projects/canvas-kit/.docz/app/imports.js',
          rootJs: '/Users/nicholas.boll/projects/canvas-kit/.docz/app/root.jsx',
          indexJs:
            '/Users/nicholas.boll/projects/canvas-kit/.docz/app/index.jsx',
          indexHtml:
            '/Users/nicholas.boll/projects/canvas-kit/.docz/app/index.html',
          db: '/Users/nicholas.boll/projects/canvas-kit/.docz/app/db.json',
        },
      },
    },
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
  ],
}

module.exports = merge(config, custom)
