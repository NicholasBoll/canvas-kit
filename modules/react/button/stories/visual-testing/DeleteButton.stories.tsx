import React from 'react';

import {DeleteButton} from '@workday/canvas-kit-react/button';
import {PartialEmotionCanvasTheme} from '@workday/canvas-kit-react/common';
import {
  ComponentStatesTable,
  StaticStates,
  permutateProps,
} from '@workday/canvas-kit-react/testing';
import {trashIcon} from '@workday/canvas-system-icons-web';

import {customColorTheme} from '../../../../../utils/storybook';
import {Container, stateTableColumnProps} from './utils';

export default {
  title: 'Testing/Buttons/Button/Delete Button',
  parameters: {
    chromatic: {
      disable: false,
    },
  },
};

const DeleteButtonTest = (props: {theme?: PartialEmotionCanvasTheme}) => (
  <StaticStates theme={props.theme}>
    <ComponentStatesTable
      rowProps={permutateProps(
        {
          size: [
            {value: 'extraSmall', label: 'Extra Small'},
            {value: 'small', label: 'Small'},
            {value: 'medium', label: 'Medium'},
            {value: 'large', label: 'Large'},
          ],
          icon: [
            {value: undefined, label: ''},
            {value: trashIcon, label: ''},
          ],
          iconPosition: [
            {value: undefined, label: ''},
            {value: 'start', label: '& Left Icon'},
            {value: 'end', label: '& Right Icon'},
          ],
        },
        // Filter out permutations where `iconPosition` is provided and not `icon`, and vice versa
        props => (props.iconPosition && props.icon) || (!props.icon && !props.iconPosition)
      )}
      columnProps={stateTableColumnProps}
    >
      {props => (
        <Container>
          <DeleteButton {...props}>Test</DeleteButton>
        </Container>
      )}
    </ComponentStatesTable>
  </StaticStates>
);

export const DeleteButtonStates = {
  render: () => <DeleteButtonTest />,
};

export const DeleteButtonThemedStates = {
  render: () => <DeleteButtonTest theme={{canvas: customColorTheme}} />,
};
