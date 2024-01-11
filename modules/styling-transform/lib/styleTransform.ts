/// <reference types="node" />
import ts from 'typescript';
import path from 'node:path';

import {getVariablesFromFiles} from './utils/getCssVariables';
import {handleCreateVars} from './utils/handleCreateVars';
import {handleCreateStyles} from './utils/handleCreateStyles';
import {handleCreateStencil} from './utils/handleCreateStencil';
import {handleCalc} from './utils/handleCalc';
import {handlePx2Rem} from './utils/handlePx2Rem';
import {handleFocusRing} from './utils/handleFocusRing';
import {handleCssVar} from './utils/handleCssVar';
import {NodeTransformer, StylesOutput} from './utils/types';

export type NestedStyleObject = {[key: string]: string | NestedStyleObject};

export interface StyleTransformerOptions {
  prefix: string;
  variables: Record<string, string>;
  styles: StylesOutput;
  fallbackFiles?: string[];
  transformers?: NodeTransformer[];
}

let styles: StylesOutput = {};
let vars: Record<string, string> = {};
let loadedFallbacks = false;

/**
 * The reset is used in tests and should not be called normally.
 */
export function _reset() {
  vars = {};
  styles = {};
  loadedFallbacks = false;
}

/**
 * Optional list of transformers. Useful to override for tests
 */
const defaultTransformers = [
  handleCssVar,
  handleFocusRing,
  handleCalc,
  handlePx2Rem,
  handleCreateVars,
  handleCreateStyles,
  handleCreateStencil,
];

export default function styleTransformer(
  program: ts.Program,
  {
    prefix = 'css',
    variables = {},
    styles = {},
    fallbackFiles = [],
    transformers = defaultTransformers,
  }: Partial<StyleTransformerOptions> = {
    prefix: 'css',
    variables: {},
    styles: {},
    transformers: defaultTransformers,
  }
): ts.TransformerFactory<ts.SourceFile> {
  if (!loadedFallbacks) {
    const files = fallbackFiles
      .filter(file => file) // don't process empty files
      .map(file => {
        // Find the fully-qualified path name. This could error which should give "module not found" errors
        return file.startsWith('.') ? path.resolve(process.cwd(), file) : require.resolve(file);
      })
      .map(file => {
        console.log(`Loading CSS variable fallback file: ${file}`);
        return ts.sys.readFile(file) || '';
      });

    const fallbackVars = getVariablesFromFiles(files);
    console.log(`Found ${Object.keys(fallbackVars).length} variables.`);

    // eslint-disable-next-line no-param-reassign
    vars = {...variables, ...fallbackVars};
    loadedFallbacks = true;
  }

  const checker = program.getTypeChecker();
  return context => {
    const visit: ts.Visitor = node => {
      // eslint-disable-next-line no-param-reassign
      node = ts.visitEachChild(node, visit, context);

      if (ts.isSourceFile(node) && node.fileName !== 'test.ts' && styles[node.fileName]) {
        console.log('sourceFile:', node.fileName);
        ts.sys.writeFile(
          node.fileName.replace('tsx', 'css'),
          (styles[node.fileName] || []).join('\n')
        );
        program.getCurrentDirectory(); //?
      }

      return handleTransformers(node, checker, prefix, vars, styles)(transformers);
    };

    return node => ts.visitNode(node, visit);
  };
}

/**
 * This function is useful for tests or a custom build. The `styleTransformer` function is used by
 * the https://www.npmjs.com/package/ttypescript package.
 */
export function transform(
  program: ts.Program,
  fileName = 'test.ts',
  options?: Partial<StyleTransformerOptions>,
  transformers?: NodeTransformer[]
) {
  const source =
    program.getSourceFile(fileName) || ts.createSourceFile(fileName, '', ts.ScriptTarget.ES2019);

  const printer = ts.createPrinter();

  return printer.printFile(
    ts
      .transform(source, [styleTransformer(program, {...options, transformers})])
      .transformed.find(s => s.fileName === fileName) || source
  );
}

const handleTransformers =
  (
    node: ts.Node,
    checker: ts.TypeChecker,
    prefix: string,
    variables: Record<string, string>,
    styles: StylesOutput
  ) =>
  (
    transformers: ((
      node: ts.Node,
      checker: ts.TypeChecker,
      prefix: string,
      variables: Record<string, string>,
      styles: StylesOutput
    ) => ts.Node | void)[]
  ) => {
    return (
      transformers.reduce((result, transformer) => {
        if (result) {
          return result;
        }
        return transformer(node, checker, prefix, variables, styles);
      }, undefined as ts.Node | void) || node
    );
  };
