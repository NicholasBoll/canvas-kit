import Adapter from 'enzyme-adapter-react-16';
import {configure} from 'enzyme';
import {toHaveNoViolations} from 'jest-axe';
import serializer, {matchers} from 'jest-emotion';
import '@testing-library/jest-dom/extend-expect';
import {verifyComponent} from './verifyComponent';
import {jest} from '@jest/globals';

import {setUniqueSeed, resetUniqueIdCount} from '@workday/canvas-kit-react/common';

expect.addSnapshotSerializer(serializer);
expect.extend(toHaveNoViolations);
expect.extend(matchers);
configure({adapter: new Adapter()});

// add convenience variables to the global context
(global as any).verifyComponent = verifyComponent;
(global as any).jest = jest;

// Not necessary for our tests, but demonstrate how to have stable ids for jest snapshots
beforeEach(() => {
  setUniqueSeed('a');
  resetUniqueIdCount();
});
