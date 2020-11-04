/// <reference path="../../../../../typings.d.ts" />
/** @jsx jsx */
import {jsx} from '@emotion/core';
import {spacing} from '@workday/canvas-kit-react-core';

import {Tabs} from '@workday/canvas-kit-labs-react-tabs';

export default {
  title: 'Testing/React/Labs/Tabs',
  component: Tabs,
};

export const Simple = () => (
  <Tabs>
    <Tabs.List>
      <Tabs.Item>First Tab</Tabs.Item>
      <Tabs.Item name="second">Second Tab</Tabs.Item>
      <Tabs.Item>Third Tab</Tabs.Item>
      <Tabs.Item>Fourth Tab</Tabs.Item>
      <Tabs.Item>Fifth Tab</Tabs.Item>
    </Tabs.List>
    <div css={{marginTop: spacing.m}}>
      <Tabs.Panel>Contents of First Tab</Tabs.Panel>
      <Tabs.Panel>Contents of Second Tab</Tabs.Panel>
      <Tabs.Panel>Contents of Third Tab</Tabs.Panel>
      <Tabs.Panel>Contents of Fourth Tab</Tabs.Panel>
      <Tabs.Panel>Contents of Fifth Tab</Tabs.Panel>
    </div>
  </Tabs>
);
