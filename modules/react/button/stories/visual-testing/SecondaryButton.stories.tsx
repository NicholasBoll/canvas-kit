import React from 'react';

import {SecondaryButton} from '@workday/canvas-kit-react/button';
import {PartialEmotionCanvasTheme} from '@workday/canvas-kit-react/common';
import {
  ComponentStatesTable,
  StaticStates,
  permutateProps,
} from '@workday/canvas-kit-react/testing';
import {playCircleIcon, relatedActionsVerticalIcon} from '@workday/canvas-system-icons-web';

import {customColorTheme} from '../../../../../utils/storybook';
import {Container, stateTableColumnProps} from './utils';

export default {
  title: 'Testing/Buttons/Button/Secondary Button',
  parameters: {
    chromatic: {
      disable: false,
    },
  },
};

const SecondaryButtonTest = (props: {theme?: PartialEmotionCanvasTheme}) => (
  <StaticStates theme={props.theme}>
    <ComponentStatesTable
      rowProps={permutateProps(
        {
          variant: [
            {value: undefined, label: ''},
            {value: 'inverse', label: 'Inverse'},
          ],
          size: [
            {value: 'extraSmall', label: 'Extra Small'},
            {value: 'small', label: 'Small'},
            {value: 'medium', label: 'Medium'},
            {value: 'large', label: 'Large'},
          ],
          icon: [
            {value: undefined, label: ''},
            // We don't need a label here, because `iconPosition` provides it
            {value: playCircleIcon, label: ''},
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
        <Container blue={props.variant === 'inverse'}>
          <SecondaryButton {...props}>Test</SecondaryButton>
        </Container>
      )}
    </ComponentStatesTable>
  </StaticStates>
);

const SecondaryIconButtonTest = (props: {theme?: PartialEmotionCanvasTheme}) => (
  <StaticStates theme={props.theme}>
    <ComponentStatesTable
      rowProps={permutateProps({
        variant: [
          {value: undefined, label: ''},
          {value: 'inverse', label: 'Inverse'},
        ],
        size: [
          {value: 'extraSmall', label: 'Extra Small'},
          {value: 'small', label: 'Small'},
          {value: 'medium', label: 'Medium'},
          {value: 'large', label: 'Large'},
        ],
        icon: [{value: relatedActionsVerticalIcon, label: ''}],
      })}
      columnProps={stateTableColumnProps}
    >
      {props => (
        <Container blue={props.variant === 'inverse'}>
          <SecondaryButton {...props}></SecondaryButton>
        </Container>
      )}
    </ComponentStatesTable>
  </StaticStates>
);

export const SecondaryButtonStates = {
  render: () => <SecondaryButtonTest />,
};

export const SecondaryIconButtonStates = {
  render: () => <SecondaryIconButtonTest />,
};

export const SecondaryButtonThemedStates = {
  render: () => <SecondaryButtonTest theme={{canvas: customColorTheme}} />,
};

export const SecondaryIconButtonThemedStates = {
  render: () => <SecondaryIconButtonTest theme={{canvas: customColorTheme}} />,
};
