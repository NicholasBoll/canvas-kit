import ts from 'typescript';

import {cssVar} from '@workday/canvas-kit-styling';
import {createPropertyTransform} from '../createPropertyTransform';
import {parseNodeToStaticValue} from './parseNodeToStaticValue';

export const handleCssVar = createPropertyTransform((node, context) => {
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'cssVar'
  ) {
    const args = node.arguments.map(arg => parseNodeToStaticValue(arg, context));

    const args0 = args[0] as string;
    return cssVar(args0, (args[1] as string) || context.names[args0]);
  }

  return;
});
