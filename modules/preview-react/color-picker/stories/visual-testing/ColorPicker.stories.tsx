import * as React from 'react';

import {ColorPicker} from '@workday/canvas-kit-preview-react/color-picker';
import {ComponentStatesTable, StaticStates} from '@workday/canvas-kit-react/testing';
import {colors} from '@workday/canvas-kit-react/tokens';

export {InputInteraction} from '../examples/InputInteraction';

export default {
  title: 'Testing/Preview/Color Picker',
  parameters: {
    chromatic: {
      disable: false,
      pauseAnimationAtEnd: true,
    },
  },
};

// eslint-disable-next-line no-empty-function
const noop = () => {};

export const ColorPickerStates = () => (
  <StaticStates>
    <ComponentStatesTable
      rowProps={[
        {label: 'Default', props: {}},
        {label: 'with Hex Input', props: {showCustomHexInput: true}},
        {
          label: 'With Reset',
          props: {
            resetColor: colors.blueberry400,
            resetLabel: 'Reset',
            onColorReset: noop,
          },
        },
        {
          label: 'With Reset and Hex Input',
          props: {
            showCustomHexInput: true,
            resetColor: colors.blueberry400,
            resetLabel: 'Reset',
            onColorReset: noop,
          },
        },
      ]}
      columnProps={[{label: 'Default', props: {}}]}
    >
      {props => <ColorPicker {...props} onColorChange={noop} />}
    </ComponentStatesTable>
  </StaticStates>
);
