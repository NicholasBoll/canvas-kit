import fs from 'node:fs';
import path from 'node:path';

import fse from 'fs-extra';
import glob from 'glob';
import {styleTransformer, StylingWebpackPlugin} from '@workday/canvas-kit-styling-transform';
import stylingConfig from '../../../styling.config';
import typescriptLoaderWithTransformers from '@workday/canvas-kit-styling-transform/lib/webpack-loader';
// import wholeSourceLoader from '../../../.storybook/whole-source-loader';
// @ts-ignore
import extractExports from '@workday/canvas-kit-docs/webpack/extract-exports';

const args = process.argv.slice(2);
const inputPath = path.resolve(args[0]);
const distFolder = path.join(__dirname, '../dist');
const srcFolders = ['react', 'labs-react', 'preview-react', 'docs/mdx/style-props', 'styling'];

if (!inputPath) {
  console.error('You must supply a valid path');
  process.exit(1);
}

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder);
}

const sanitizeMdxFile = (inFile: string, outFile: string): void => {
  fs.readFile(inFile, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      return console.error(err);
    }
    const result = data
      // Remove storybook stuff
      .replace(/import {.*} from '@storybook\/addon-docs';/g, '')
      .replace(/\n?import \* as \w+Stories from '\.\/\w+\.stories';\n?/g, '')
      .replace(/<Meta.* \/>\n/g, '')
      .replace(/^\s+|\s+$/g, '')
      // The replace below converts named imports from files in the examples
      // folder to default imports (this is required by canvas-site in order
      // for examples to work). The regex specifically targets import
      // statements which exist on on a single line, which is fine because
      // example imports almost always fall on a single line. For example:
      //
      // import {FlexCard} from './examples/Flex/FlexCard';
      //
      // The line above will be converted (as desired) to:
      //
      // import FlexCard from './examples/Flex/FlexCard';
      //
      // This build process contains logic elsewhere to convert the named
      // exports in those example files to default exports.
      .replace(/import {\s?(\w+)\s?} from '\.\/examples/g, "import $1 from './examples");

    fs.writeFile(outFile, result, 'utf8', (err: NodeJS.ErrnoException | null) => {
      if (err) return console.error(err);
    });
  });
};

/**
 * Build files in the docs module
 */
glob(inputPath + '/**/*.md?(x)', {}, (err: Error | null, files: string[]) => {
  files.forEach(file => {
    const relativePath = file.replace(path.join(__dirname, '../'), '');
    const destFile = path.join(distFolder, relativePath);
    fse.ensureDirSync(path.dirname(destFile));
    sanitizeMdxFile(file, destFile);
  });
});

const tsPlugin = new StylingWebpackPlugin({
  tsconfigPath: path.resolve(__dirname, '../../../tsconfig.stories.json'),
  transformers: [program => styleTransformer(program, {...stylingConfig, extractCSS: false})],

  // transformers: [program => {...stylingConfig, extractCSS: false}]
});

/**
 * Build component files in react module, and copy them into the dist folder of the docs module
 */
srcFolders.forEach(folder => {
  const srcFolder = path.join(__dirname, '../../', folder);

  glob(srcFolder + '/**/*.mdx', {}, (err, files) => {
    const mdxDestinations = files.map(file => {
      return path.join(
        distFolder,
        'mdx',
        file
          .replace(path.join(srcFolder, '../'), '')
          .replace('/stories', '')
          .replace('.stories', '')
      );
    });

    mdxDestinations.forEach((destFile: string, index: number) => {
      const sourceMdx: string = files[index];
      const storiesDir: string = path.dirname(sourceMdx);
      const sourceExamplesDir: string = path.join(storiesDir, 'examples');
      const destDir: string = path.dirname(destFile);

      fs.mkdirSync(destDir, {recursive: true});
      sanitizeMdxFile(sourceMdx, destFile);

      // Copy examples if they exist
      if (fs.existsSync(sourceExamplesDir)) {
        const destExamplesDir: string = path.join(destDir, 'examples');
        // fse.copySync(sourceExamplesDir, destExamplesDir);
        fs.mkdirSync(destExamplesDir, {recursive: true});
        console.log('destExamplesDir', destExamplesDir);

        // // Change exports from named to default
        glob(
          sourceExamplesDir + '/**/*.@(js|jsx|ts|tsx)',
          {},
          (err: Error | null, examples: string[]) => {
            examples.forEach((example: string) => {
              // Only convert examples - not splitprops files
              if (!path.basename(example).includes('.splitprops')) {
                // const data = fs.readFileSync(example, 'utf8');
                const transformed = typescriptLoaderWithTransformers.call(
                  {
                    resourcePath: example,
                    getOptions: () => tsPlugin.getLoaderOptions(),
                  },
                  ''
                );
                console.log('writing', example);
                const destPath = example.replace(sourceExamplesDir, destExamplesDir);
                const exports = extractExports(transformed);

                // rewrite out example files so that we can attach the __RAW__ property
                // This will rewrite this:
                //  export default () => <div />;
                // to this:
                //  const Example = () => <div />;
                //  export default Example;
                //  Example.__RAW__ = 'export default () => <div />;';
                // We do this so that the whole source code can be used in Storybook examples
                const rewriteExampleSource = transformed.includes('export default (')
                  ? transformed.replace('export default (', 'const Example = (') +
                    '\nexport default Example;'
                  : transformed;
                const raw = JSON.stringify(transformed)
                  .replace(/\u2028/g, '\\u2028')
                  .replace(/\u2029/g, '\\u2029');
                const output = `${rewriteExampleSource}
${exports.map((name: string) => `${name}.__RAW__ = ${raw};`).join('\n')}
`;
                // .replace(/\.tsx?$/, '.js');
                fs.mkdirSync(path.dirname(destPath), {recursive: true});
                fs.writeFileSync(destPath, output, 'utf8');
              }
            });
            tsPlugin.close();
          }
        );
      }

      // Copy files that split the props of a Compound Component model.
      glob(storiesDir + '/*.splitprops.tsx', {}, (err: Error | null, files: string[]) =>
        files.forEach((file: string) => fse.copySync(file, path.join(destDir, path.basename(file))))
      );
    });
  });
});
