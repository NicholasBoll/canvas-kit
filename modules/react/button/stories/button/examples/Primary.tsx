import React from 'react';

import {PrimaryButton} from '@workday/canvas-kit-react/button';
import {Flex} from '@workday/canvas-kit-react/layout';
import {
  plusIcon,
  relatedActionsVerticalIcon,
  caretDownIcon,
} from '@workday/canvas-system-icons-web';

export const Primary = () => (
  <Flex gap="s" padding="s">
    <PrimaryButton>Primary</PrimaryButton>
    <PrimaryButton icon={plusIcon} iconPosition="start">
      Primary
    </PrimaryButton>
    <PrimaryButton icon={caretDownIcon} iconPosition="end">
      Primary
    </PrimaryButton>
    <PrimaryButton icon={relatedActionsVerticalIcon} />

    <br />
    <br />
    <button type="button" className="cnvs-base-button cnvs-button---size-medium cnvs-primary">
      <span className="css-1q3aben">Primary</span>
    </button>
  </Flex>
);
