import * as React from 'react';
import {PaginationModel} from '../types';
import {Subtext} from '@workday/canvas-kit-react/text';
import {createComponent} from '@workday/canvas-kit-react/common';
import {PaginationContext} from '../usePaginationModel';

export interface GoToLabelProps {
  /**
   * Accepts child elements or a render prop.
   */
  children?: (model: PaginationModel) => React.ReactNode | React.ReactNode;
}

export const GoToLabel = createComponent('label')({
  displayName: 'Pagination.GoToLabel',
  Component({children, ...elemProps}: GoToLabelProps, ref, Element) {
    const model = React.useContext(PaginationContext);
    return (
      <Subtext
        ref={ref}
        as={Element}
        size="medium"
        variant="hint"
        whiteSpace="nowrap"
        {...elemProps}
      >
        {typeof children === 'function' ? children(model) : children}
      </Subtext>
    );
  },
});
