import React from 'react';
import {renderToString} from 'react-dom/server';
import {screen, render, fireEvent, renderHook} from '@testing-library/react';
import {Combobox, useComboboxModel} from '@workday/canvas-kit-react/combobox';

describe('Combobox', () => {
  it('should render on a server without crashing', () => {
    const ssrRender = () =>
      renderToString(
        <Combobox>
          <Combobox.Input />
          <Combobox.Menu.Popper>
            <Combobox.Menu.Card>
              <Combobox.Menu.List maxHeight={200}>
                <Combobox.Menu.Item>Option 1</Combobox.Menu.Item>
              </Combobox.Menu.List>
            </Combobox.Menu.Card>
          </Combobox.Menu.Popper>
        </Combobox>
      );
    expect(ssrRender).not.toThrow();
  });

  it('should show items when interacted with', async () => {
    render(
      <Combobox>
        <Combobox.Input />
        <Combobox.Menu.Popper>
          <Combobox.Menu.Card>
            <Combobox.Menu.List>
              <Combobox.Menu.Item>Option 1</Combobox.Menu.Item>
            </Combobox.Menu.List>
          </Combobox.Menu.Card>
        </Combobox.Menu.Popper>
      </Combobox>
    );

    fireEvent.click(screen.getByRole('combobox'));
    screen.debug(); //?

    await screen.findByRole('option');
    screen.debug(); //?
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('should show items when interacted with', async () => {
    render(
      <Combobox items={['Option 1']}>
        <Combobox.Input />
        <Combobox.Menu.Popper>
          <Combobox.Menu.Card>
            <Combobox.Menu.List>
              {item => <Combobox.Menu.Item>{item}</Combobox.Menu.Item>}
            </Combobox.Menu.List>
          </Combobox.Menu.Card>
        </Combobox.Menu.Popper>
      </Combobox>
    );

    fireEvent.click(screen.getByRole('combobox'));
    screen.debug(); //?

    await screen.findByRole('option');
    screen.debug(); //?
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('should show items when interacted with', async () => {
    const {result: itemsStateRef} = renderHook(() => React.useState<string[]>(['Option 1']));
    // const {result} = renderHook(() => useComboboxModel({items: itemsStateRef.current[0]}));
    const {result} = renderHook(() => useComboboxModel({items: ['Option 1']}));
    render(
      <Combobox model={result.current}>
        <Combobox.Input />
        <Combobox.Menu.Popper>
          <Combobox.Menu.Card>
            <Combobox.Menu.List>
              {item => <Combobox.Menu.Item>{item}</Combobox.Menu.Item>}
            </Combobox.Menu.List>
          </Combobox.Menu.Card>
        </Combobox.Menu.Popper>
      </Combobox>
    );

    itemsStateRef.current[1](['Option 1']);

    fireEvent.click(screen.getByRole('combobox'));
    screen.debug(); //?

    result.current.state.items; //?

    await screen.findByRole('option');
    screen.debug(); //?
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });
});

it('should show items when interacted with 2', async () => {
  const MyComponent = () => {
    const [items, setItems] = React.useState<string[]>(['Option 1']);
    const model = useComboboxModel({items});

    React.useEffect(() => {
      setTimeout(() => {
        setItems(['Option 1', 'Option 2']);
      }, 400);
    }, []);

    return (
      <Combobox model={model}>
        <Combobox.Input />
        <Combobox.Menu.Popper>
          <Combobox.Menu.Card>
            <Combobox.Menu.List>
              {item => <Combobox.Menu.Item>{item}</Combobox.Menu.Item>}
            </Combobox.Menu.List>
          </Combobox.Menu.Card>
        </Combobox.Menu.Popper>
      </Combobox>
    );
  };

  render(<MyComponent />);

  fireEvent.click(screen.getByRole('combobox'));
  screen.debug(); //?

  await screen.findByRole('option');
  screen.debug(); //?
  expect(screen.getAllByRole('option')).toHaveLength(1);
});
