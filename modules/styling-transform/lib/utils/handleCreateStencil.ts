import ts from 'typescript';

import {slugify} from '@workday/canvas-kit-styling';

import {getVarName} from './getVarName';
import {makeEmotionSafe} from './makeEmotionSafe';
import {NestedStyleObject, parseObjectToStaticValue} from './parseObjectToStaticValue';
import {compileCSS, createStyleObjectNode, serializeStyles} from './createStyleObjectNode';
import {parseNodeToStaticValue} from './parseNodeToStaticValue';
import {NodeTransformer, TransformerContext} from './types';
import {isImportedFromStyling} from './isImportedFromStyling';

/**
 * Handle all arguments of the CallExpression `createStencil()`
 */
export const handleCreateStencil: NodeTransformer = (node, context) => {
  const {checker, prefix, variables} = context;
  /**
   * This will match whenever a `createStencil()` call expression is encountered. It will loop
   * over all the config to extract variables and styles.
   *
   */
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'createStencil' &&
    isImportedFromStyling(node.expression, checker)
  ) {
    const config = node.arguments[0];

    /**
     * Stencils can define variables that are used in style object functions. Inside those
     * functions, the full variable name is not used, but rather destructured. We'll create
     * temporary local variables for these style object functions.
     *
     * For example:
     * ```ts
     * const myStencil = createStencil({
     *   vars: { color: 'red' },
     *   base: ({color}) => ({
     *     color: color
     *   })
     * })
     * ```
     */
    const tempVariables: Record<string, string> = {};
    // We need to keep track of stencil variables and values to automatically merge into the base
    // styles
    const stencilVariables: Record<string, string> = {};

    // Stencil name is the variable name
    const stencilName = slugify(getVarName(node)).replace('-stencil', '');

    if (ts.isObjectLiteralExpression(config)) {
      // get variables first
      const varsConfig = config.properties.find(property => {
        return (
          property.name &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'vars' &&
          ts.isPropertyAssignment(property)
        );
      }) as ts.PropertyAssignment | undefined;

      const fileName = node.getSourceFile().fileName;

      function extractVariables(node: ts.Node): any {
        if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
          if (ts.isObjectLiteralExpression(node.initializer)) {
            return node.initializer.properties.map(extractVariables);
          }

          const varName = `${stencilName}-${makeEmotionSafe(node.name.text)}`;
          const varValue = `--${prefix}-${varName}`;
          variables[`${varName}`] = varValue;

          variables[makeEmotionSafe(node.name.text)] = varValue;
          tempVariables[makeEmotionSafe(node.name.text)] = varValue;

          // Evaluate the variable defaults
          stencilVariables[varValue] = parseNodeToStaticValue(node.initializer, context);
        }
      }

      if (varsConfig && ts.isObjectLiteralExpression(varsConfig.initializer)) {
        varsConfig.initializer.properties.forEach(variable => {
          extractVariables(variable);
        });
      }

      config.properties.forEach((property, index, properties) => {
        if (property.name && ts.isIdentifier(property.name)) {
          // base config object
          if (property.name.text === 'base') {
            const styleObj = parseStyleBlock(property, context);

            if (styleObj) {
              // The `as any` are necessary because the properties are readonly, even though they
              // can be changed in transformers.
              const initializer = createStyleReplacementNode(
                {
                  ...stencilVariables,
                  ...styleObj,
                },
                getClassName(property),
                fileName,
                context
              );

              // We cast as any because TypeScript says these are readonly, but we're in a transform
              (initializer as any).parent = property;
              (properties as any)[index] = ts.factory.createPropertyAssignment(
                property.name,
                initializer
              );
            }
          }

          // modifiers config object
          if (
            property.name.text === 'modifiers' &&
            ts.isPropertyAssignment(property) &&
            ts.isObjectLiteralExpression(property.initializer)
          ) {
            property.initializer.properties.forEach(modifierProperty => {
              if (
                modifierProperty.name &&
                ts.isIdentifier(modifierProperty.name) &&
                ts.isPropertyAssignment(modifierProperty) &&
                ts.isObjectLiteralExpression(modifierProperty.initializer)
              ) {
                modifierProperty.initializer.properties.forEach((modifier, index, modifiers) => {
                  const styleObj = parseStyleBlock(modifier, context);

                  if (styleObj && modifier.name) {
                    // The `as any` are necessary because the properties are readonly, even though they
                    // can be changed in transformers.
                    const initializer = createStyleReplacementNode(
                      styleObj,
                      getClassName(modifier),
                      fileName,
                      context
                    );

                    // // We cast as any because TypeScript says these are readonly, but we're in a transform
                    (initializer as any).parent = modifier;
                    (modifiers as any)[index] = ts.factory.createPropertyAssignment(
                      modifier.name,
                      initializer
                    );
                  }
                });
              }
            });
          }

          // compound config array
          if (
            property.name.text === 'compound' &&
            ts.isPropertyAssignment(property) &&
            ts.isArrayLiteralExpression(property.initializer)
          ) {
            property.initializer.elements.forEach(element => {
              if (ts.isObjectLiteralExpression(element)) {
                const selectors: string[] = [];
                let styleObj: NestedStyleObject | undefined;
                let serialized: ReturnType<typeof serializeStyles>;
                element.properties.forEach((compoundProperty, index, compoundProperties) => {
                  /**
                   * If the property is `modifiers`, we want to extract selectors from it. For
                   * example,
                   *
                   * ```ts
                   * const button = createStencil({
                   *   // other config
                   *   compound: {
                   *     modifiers: { size: 'large', inverse: true },
                   *     styles: {}
                   *   }
                   * })
                   * ```
                   *
                   * After this, `selectors` should contain ['.button--size-large',
                   * '.button--inverse']
                   */
                  if (
                    compoundProperty.name &&
                    ts.isIdentifier(compoundProperty.name) &&
                    compoundProperty.name.text === 'modifiers' &&
                    ts.isPropertyAssignment(compoundProperty) &&
                    ts.isObjectLiteralExpression(compoundProperty.initializer)
                  ) {
                    compoundProperty.initializer.properties.forEach(modifier => {
                      if (ts.isPropertyAssignment(modifier)) {
                        let className = `.${getClassName(modifier.initializer)}`;
                        if (ts.isStringLiteral(modifier.initializer)) {
                          className += `-${modifier.initializer.text}`;
                        }
                        selectors.push(className);
                      }
                    });
                  }

                  // styles key
                  if (
                    compoundProperty.name &&
                    ts.isIdentifier(compoundProperty.name) &&
                    compoundProperty.name.text === 'styles'
                  ) {
                    styleObj = parseStyleBlock(compoundProperty, context);

                    if (styleObj) {
                      serialized = serializeStyles(styleObj);
                      // The `as any` are necessary because the properties are readonly, even though they
                      // can be changed in transformers.
                      const initializer = createStyleObjectNode(serialized.styles, serialized.name);

                      // We cast as any because TypeScript says these are readonly, but we're in a transform
                      (initializer as any).parent = compoundProperty;
                      (compoundProperties as any)[index] = ts.factory.createPropertyAssignment(
                        compoundProperty.name,
                        initializer
                      );
                    }
                  }

                  // We need to inject compound style selectors into a file. We'll compound the
                  // selectors with multiple class names. This will increase specificity of compound
                  // selectors. This will be harder to override and we don't increase specificity in
                  // the runtime implementation, but runtime creates an extra CSS class name that
                  // isn't known to anyone. It seems unreasonable to expect CSS users to remember to
                  // add compound modifier class names. We'll make it so it is easier to author
                  // components in CSS and let them sort the specificity issues.
                  if (serialized) {
                    const {styles} = context;

                    const styleOutput = compileCSS(`${selectors.join('')}{${serialized.styles}}`);
                    styles[fileName] = styles[fileName] || [];
                    styles[fileName].push(styleOutput);
                  }
                });
              }
            });
          }
        }
      });
    }

    // remove all our temp variables
    // eslint-disable-next-line guard-for-in
    for (const key in tempVariables) {
      delete variables[key];
    }

    // arguments are readonly, but we're in a transform
    (node.arguments[1] as any) = ts.factory.createStringLiteral(stencilName);
    (node.arguments[1] as any).parent = node;

    return node;
  }

  return;
};

/**
 * A style block is a `base`, `modifier`, or `compoundModifier` style block. It could be an ObjectLiteralExpression,
 * an ArrowFunction, MethodDeclaration, etc.
 */
function parseStyleBlock(
  property: ts.ObjectLiteralElementLike,
  context: TransformerContext
): NestedStyleObject | undefined {
  let styleObj: NestedStyleObject | undefined;
  if (ts.isPropertyAssignment(property)) {
    if (ts.isObjectLiteralExpression(property.initializer)) {
      styleObj = parseObjectToStaticValue(property.initializer, context);
    }

    if (isFunctionLikeDeclaration(property.initializer)) {
      const returnNode = getReturnStatement(property.initializer);
      if (returnNode) {
        styleObj = parseObjectToStaticValue(returnNode, context);
      }
    }
  }

  if (isFunctionLikeDeclaration(property)) {
    const returnNode = getReturnStatement(property);
    if (returnNode) {
      styleObj = parseObjectToStaticValue(returnNode, context);
    }
  }

  return styleObj;
}

function getReturnStatement(node: ts.FunctionLikeDeclaration): ts.Node | undefined {
  if (node.body && ts.isParenthesizedExpression(node.body)) {
    return node.body.expression;
  }

  if (node.body && ts.isBlock(node.body)) {
    let returnNode: ts.Node | undefined;

    // look for the return statement. It must be a top-level statement in the block
    node.body.statements.forEach(statement => {
      // () => { return {} }
      if (ts.isReturnStatement(statement)) {
        returnNode = statement.expression;
      }
    });

    return returnNode;
  }

  return undefined;
}

function isFunctionLikeDeclaration(node: ts.Node): node is ts.FunctionLikeDeclaration {
  return (node as Object).hasOwnProperty('body');
}

function createStyleReplacementNode(
  styleObj: NestedStyleObject,
  className: string,
  fileName: string,
  {styles}: TransformerContext
) {
  const serialized = serializeStyles(styleObj);
  const styleOutput = compileCSS(`.${className}{${serialized.styles}}`);
  styles[fileName] = styles[fileName] || [];
  styles[fileName].push(styleOutput);

  return createStyleObjectNode(serialized.styles, serialized.name);
}

function getClassName(node: ts.Node): string {
  return slugify(getVarName(node))
    .replace('-stencil', '')
    .replace('-base', '')
    .replace('-modifiers', '-')
    .replace('-true', '')
    .replace('-compound', '');
}
