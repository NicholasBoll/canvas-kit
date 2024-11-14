import * as React from 'react';
import {renderToString} from 'react-dom/server';
import {screen, render, fireEvent} from '@testing-library/react';

import {Tabs} from '../lib/Tabs';

describe('Tabs', () => {
  it('should render on a server without crashing', () => {
    const ssrRender = () =>
      renderToString(
        <Tabs>
          <Tabs.List>
            <Tabs.Item data-id="first">First Tab</Tabs.Item>
            <Tabs.Item data-id="second">Second Tab</Tabs.Item>
          </Tabs.List>
          <Tabs.Panel>First Tab contents</Tabs.Panel>
        </Tabs>
      );

    expect(ssrRender).not.toThrow();
  });

  // intent tab is covered by visual and Cypress tests

  it('should call "onSelect" when tab is selected', () => {
    const cb = jest.fn();
    render(
      <Tabs onSelect={cb} initialSelectedIds={['first']}>
        <Tabs.List>
          <Tabs.Item data-id="first">First Tab</Tabs.Item>
          <Tabs.Item data-id="second">Second Tab</Tabs.Item>
        </Tabs.List>
        <Tabs.Panel>First Tab contents</Tabs.Panel>
      </Tabs>
    );

    fireEvent.click(screen.getByRole('tab', {name: 'Second Tab'}));
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({id: 'second'}), expect.anything());
  });

  it('should render with the first tab selected in React Strict Mode', () => {
    render(
      <React.StrictMode>
        <Tabs>
          <Tabs.List>
            <Tabs.Item>First Tab</Tabs.Item>
            <Tabs.Item>Second Tab</Tabs.Item>
          </Tabs.List>
          <Tabs.Panel>First Tab contents</Tabs.Panel>
        </Tabs>
      </React.StrictMode>
    );

    expect(screen.getByRole('tab', {name: 'First Tab'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: 'First Tab'})).toHaveAttribute('tabindex', '0');
  });
});
