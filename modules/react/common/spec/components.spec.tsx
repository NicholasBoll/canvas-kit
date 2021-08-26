import React from 'react';
import {screen, render} from '@testing-library/react';
import {expectTypeOf} from 'expect-type';

import {
  composeHooks,
  createComponent,
  useForkRef,
  useLocalRef,
  ElementComponent,
  NewElementComponent,
  mergeProps,
  createHook,
  BehaviorHook,
  ExtractRef,
  NewExtractRef,
  Props,
  AsProps,
  TestElementComponent,
  NewTestElementComponent,
  ExtractProps,
  NewExtractProps,
} from '@workday/canvas-kit-react/common';
import {NewAsProps} from '../lib/utils';

// expect-type is a very cool library, but failures can be extremely difficult to understand. To
// combat the non-helpful failure messages, try to assign a value or type to a variable instead of
// inlining. This way the variable can be moused over for the tooltip to help determine what went
// wrong. When a test failed, observe the expected value vs the actual type or the Expected type vs
// actual type.

describe('ExtractRef', () => {
  it('should extract a ref from an element string', () => {
    type Expected = NewExtractRef<'div'>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should extract a ref from an ElementComponent', () => {
    type Expected = NewExtractRef<NewElementComponent<'div', {}>>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should extract a ref from a React.ForwardExoticComponent', () => {
    const Component = React.forwardRef<HTMLDivElement, {foo: string}>(() => null);
    type Expected = NewExtractRef<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should return never for a React.FC', () => {
    type Expected = NewExtractRef<React.FC>;

    expectTypeOf<Expected>().toEqualTypeOf<never>();
  });

  it('should return never for undefined', () => {
    type Expected = NewExtractRef<undefined>;

    expectTypeOf<Expected>().toEqualTypeOf<never>();
  });

  it('should extract a ref for nested ElementComponents', () => {
    type Expected = NewExtractRef<NewElementComponent<NewElementComponent<'div', {}>, {}>>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });
});

describe('ExtractProps', () => {
  interface Props {
    foo: string;
  }
  const ElementComponent: NewElementComponent<'div', Props> = createComponent('div')({
    Component: (props: Props) => null,
  });

  it('should return the props and HTMLDivElement interface when no element is provided on an `ElementComponent`', () => {
    type Expected = NewExtractProps<typeof ElementComponent>;

    expectTypeOf<Expected>().toEqualTypeOf<Props & React.HTMLAttributes<HTMLDivElement>>();
  });

  it('should return the props and HTMLButtonElement when a `button` element is provided on an `ElementComponent`', () => {
    type Expected = NewExtractProps<typeof ElementComponent, 'button'>;

    expectTypeOf<Expected>().toEqualTypeOf<Props & React.ButtonHTMLAttributes<HTMLButtonElement>>();
  });

  it('should return only the props when `never` is provided on an `ElementComponent', () => {
    type Expected = NewExtractProps<typeof ElementComponent, never>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return only props on a `Component`', () => {
    const Component = createComponent()({Component: (props: Props) => null});
    type Expected = NewExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return props of a class component', () => {
    class Component extends React.Component<Props> {}
    type Expected = NewExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return props of a functional component', () => {
    const Component = (props: Props) => null;
    type Expected = NewExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  describe('nested ElementComponent', () => {
    interface Props2 {
      bar: string;
    }

    it('should return the combined interface of all components and HTML attributes when no element override is provided to ExtractProps', () => {
      const Component1: NewElementComponent<'button', Props> = createComponent('button')({
        Component: (props: Props) => null,
      });
      const Component2: NewElementComponent<typeof Component1, Props2> = createComponent(
        Component1
      )({Component: (props: Props2) => null});
      type Expected = NewExtractProps<typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<
        Props & Props2 & React.ButtonHTMLAttributes<HTMLButtonElement>
      >();
    });

    it('should return only the outer component props when `never` is supplied to ExtractProps', () => {
      const Component1: NewElementComponent<'button', Props> = createComponent('button')({
        Component: (props: Props) => null,
      });
      const Component2: NewElementComponent<typeof Component1, Props2> = createComponent(
        Component1
      )({Component: (props: Props2) => null});
      type Expected = NewExtractProps<typeof Component2, never>;

      expectTypeOf<Expected>().toEqualTypeOf<Props2>();
    });

    it('should return the combined interface of all components when an ElementComponent override is provided to ExtractProps', () => {
      const Component1: NewElementComponent<'aside', Props> = createComponent('aside')({
        Component: (props: Props) => null,
      });
      const Component2: NewElementComponent<'button', Props2> = createComponent('button')({
        Component: (props: Props2) => null,
      });
      type Expected = NewExtractProps<typeof Component1, typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<
        Props & Props2 & React.ButtonHTMLAttributes<HTMLButtonElement>
      >();
    });

    it('should return the combined interface of all components when a React.Component override is provided to ExtractProps', () => {
      const Component1: NewElementComponent<'aside', Props> = createComponent('aside')({
        Component: (props: Props) => null,
      });
      const Component2 = (props: Props2) => null;
      type Expected = NewExtractProps<typeof Component1, typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<Props & Props2>();
    });
  });
});

// `Props` is an internal interface used by the overloaded `ElementComponent` interface. `Props` is
// used when no `as` is passed: `<MyComponent />`. The general idea is it should merge props from
// the passed `TProps` interface and any interface from the element (an HTMLElement or
// `ElementComponent`)
describe('Props', () => {
  it('should return an interface of props merged with the HTML attributes when passed an element', () => {
    type Props1 = {foo: string};

    // This happens with a `createComponent('div)`
    type Expected = Props<Props1, 'div'>;
    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 & {ref?: React.Ref<HTMLDivElement>} & React.HTMLAttributes<HTMLDivElement>
    >();
  });

  it('should return the merged interface of props from parent and child component when passed an ElementComponent', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};

    // This happens with a `createComponent(ElementComponent)`
    type Expected = Props<Props1, ElementComponent<'div', Props2>>;
    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 & Props2 & {ref?: React.Ref<HTMLDivElement>} & React.HTMLAttributes<HTMLDivElement>
    >();
  });
});

// `AsProps` is an internal interface used by the overloaded `ElementComponent` interface
describe('AsProps', () => {
  it('should return an interface of props merged with the HTML attributes when passed an element', () => {
    type Props1 = {foo: string};

    type Expected = NewAsProps<Props1, 'div'>;

    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 & {ref?: React.Ref<HTMLDivElement>; as?: 'div'} & React.HTMLAttributes<HTMLDivElement>
    >();
  });

  it('should return an interface of props merged with the props of a `React.FC`', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};

    type Expected = NewAsProps<Props1, React.FC<Props2>>;
    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 & Props2 & {ref?: never; as?: React.FC<Props2>} & {children?: React.ReactNode}
    >();
  });

  it('should return an interface of props merged with the props of a `React.ForwardExoticRefComponent`', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};

    // use const instead of type - Using `React.forwardRef` is about intent and the type contains a
    // lot of implementation detail
    const AsComponent = React.forwardRef<HTMLDivElement, Props2>(p => null);

    type Expected = NewAsProps<Props1, typeof AsComponent>;

    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 & Props2 & {as?: typeof AsComponent} & React.RefAttributes<HTMLDivElement>
    >();
  });

  it('should return an interface of props merged with the props of an `ElementComponent`', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    type AsComponent = NewElementComponent<'div', Props2>;

    type Expected = NewAsProps<Props1, AsComponent>;

    expectTypeOf<Expected>().toEqualTypeOf<
      Props1 &
        Props2 & {ref?: React.Ref<HTMLDivElement>; as?: AsComponent} & React.HTMLAttributes<
          HTMLDivElement
        >
    >();
  });
});

// ElementComponent type is odd to test. We use `TestElementComponent` which is the same as
// `ElementComponent` except in return type. While `ElementComponent` as a function always returns
// `JSX.Element`, `TestElementComponent` returns the `props` parameter of the function for testing.
describe('ElementComponent', () => {
  const emptyComponent = (() => null) as any;
  it('should return the correct interface with no "as"', () => {
    type Props1 = {foo: string};
    const Component: NewTestElementComponent<'div', Props1> = emptyComponent;
    const expected = Component({foo: 'bar', onClick: e => null});

    expectTypeOf(expected).toEqualTypeOf<NewAsProps<Props1, 'div'>>();
  });

  // interface ElementComponent<E extends React.ElementType, P> {
  //   __type: 'ElementComponent'; // used internally to distinguish between `ElementComponent` and `Component`
  //   <TComponent extends React.ElementType>(props: AsProps<P, TComponent>): JSX.Element;
  //   displayName?: string;
  // }

  it('should return the correct interface with an element "as"', () => {
    type Props1 = {foo: string};
    const Component: NewTestElementComponent<'div', Props1> = emptyComponent;
    const expected = Component({foo: 'bar', as: 'button', onClick: e => null});

    expectTypeOf(expected).toEqualTypeOf<NewAsProps<Props1, 'button'>>();
  });

  it('should return the correct interface with a React.FC "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: NewTestElementComponent<'div', Props1> = emptyComponent;
    const AsComponent: React.FC<Props2> = emptyComponent;

    const expected = Component({foo: 'bar', bar: 'baz', as: AsComponent});

    expectTypeOf(expected).toEqualTypeOf<NewAsProps<Props1, typeof AsComponent>>();
  });

  it('should return the correct interface with a React.ForwardComponent "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: NewTestElementComponent<'div', Props1> = emptyComponent;
    const AsComponent = React.forwardRef<HTMLButtonElement, Props2>(() => null);

    const expected = Component({foo: 'bar', bar: 'baz', as: AsComponent});

    expectTypeOf(expected).toEqualTypeOf<NewAsProps<Props1, typeof AsComponent>>();
  });

  it('should return the correct interface with a ElementComponent "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: NewTestElementComponent<'div', Props1> = emptyComponent;
    const AsComponent: NewElementComponent<'button', Props2> = emptyComponent;

    const expected = Component({foo: 'bar', bar: 'baz', as: AsComponent, onClick: e => null});

    expectTypeOf(expected).toEqualTypeOf<NewAsProps<Props1, typeof AsComponent>>();
  });
});

describe('createComponent', () => {
  it('should assign an element-base component as an ElementComponent', () => {
    const component = createComponent('div')({Component: (props: {foo: 'bar'}) => null});
    expectTypeOf(component).toEqualTypeOf<ElementComponent<'div', {foo: 'bar'}>>();
  });

  it('should add sub-components to the signature', () => {
    const component = createComponent('div')({
      Component: (props: {foo: 'bar'}) => null,
      subComponents: {
        Foo: 'bar',
      },
    });
    expectTypeOf(component).toEqualTypeOf<ElementComponent<'div', {foo: 'bar'}> & {Foo: string}>();
  });

  it('should assign ref and Element correctly for element components', () => {
    createComponent('div')({
      Component: (props: {}, ref, Element) => {
        expectTypeOf(ref).toEqualTypeOf<React.Ref<HTMLDivElement>>();
        expectTypeOf(Element).toEqualTypeOf<'div'>();
        return null;
      },
    });
  });

  it('should assign ref and Element correctly for createComponent components', () => {
    const component = createComponent('article')({Component: (props: {}) => null});

    createComponent(component)({
      Component: (props: {}, ref, Element) => {
        expectTypeOf(ref).toEqualTypeOf<React.Ref<HTMLElement>>();
        expectTypeOf(Element).toEqualTypeOf<ElementComponent<'article', {}>>();
        return null;
      },
    });
  });

  it('should allow a valid ref when wrapping components', () => {
    const Component = createComponent('button')({Component: (props: {}) => null});
    const ref: React.RefObject<HTMLButtonElement> = {current: null};

    // No expectation, but the next line will fail if the ref signature isn't valid and it should be
    const temp = <Component ref={ref} />;
  });

  it('create assign a displayName', () => {
    const Component = createComponent('div')({
      displayName: 'Test',
      Component: () => null,
    });

    expect(Component).toHaveProperty('displayName', 'Test');
  });

  it('should assign sub components', () => {
    const SubComponent = () => null;
    const Component = createComponent('div')({
      Component: () => null,
      subComponents: {
        SubComponent,
      },
    });

    expect(Component).toHaveProperty('SubComponent', SubComponent);
  });

  it('should forward the ref', () => {
    const ref = {current: null};

    const Component = createComponent('div')({
      displayName: 'Test',
      Component: (props, ref) => <div id="test" ref={ref} />,
    });

    render(<Component ref={ref} />);

    expect(ref.current).toHaveAttribute('id', 'test');
  });

  it('should render whatever element is passed through the "as" prop', () => {
    const Component = createComponent('div')({
      displayName: 'Test',
      Component: (props, ref, Element) => <Element data-testid="test" />,
    });

    render(<Component as="button" />);

    expect(screen.getByTestId('test')).toHaveProperty('tagName', 'BUTTON');
  });
});

describe('createHook', () => {
  const env = process.env.NODE_ENV;
  beforeEach(() => {
    process.env.NODE_ENV = 'production';
  });
  afterEach(() => {
    process.env.NODE_ENV = env;
  });

  const emptyModel = {state: {}, events: {}};
  it('should return a BehaviorHook type', () => {
    const useMyHook = createHook((model: typeof emptyModel) => {
      return {
        foo: 'bar',
      };
    });

    expectTypeOf(useMyHook).toEqualTypeOf<BehaviorHook<typeof emptyModel, {foo: string}>>();
  });

  it('should return props that are merged together correctly when no ref is given', () => {
    const props = createHook((model: any) => ({foo: 'bar'}))(emptyModel, {bar: 'baz'});

    expectTypeOf(props).toEqualTypeOf<{foo: string} & {bar: string}>();
    expect(props).toEqual({foo: 'bar', bar: 'baz'});
  });

  it('should return props that are merged together correctly when a ref is given', () => {
    const divElement = document.createElement('div');
    const props = createHook((model: any) => ({foo: 'bar'}))(
      emptyModel,
      {bar: 'baz'},
      {current: divElement}
    );

    expectTypeOf(props).toEqualTypeOf<
      {foo: string} & {bar: string} & {ref: React.Ref<HTMLDivElement>}
    >();
    expect(props).toEqual({foo: 'bar', bar: 'baz', ref: {current: divElement}});
  });

  it('should merge provided props over hook props', () => {
    const props = createHook((model: any) => ({foo: 'bar'}))(emptyModel, {foo: 'baz'});

    expect(props).toEqual({foo: 'baz'});
  });
});

describe('useForkRef', () => {
  it('should set the current value of the second ref if the first ref is undefined', () => {
    const ref1 = undefined;
    const ref2 = {current: ''};

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref2).toHaveProperty('current', 'bar');
  });

  it('should set the current value of the first ref if the second ref is undefined', () => {
    const ref1 = {current: ''};
    const ref2 = undefined;

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref1).toHaveProperty('current', 'bar');
  });

  it('should set the current value of both refs if both refs are RefObjects', () => {
    const ref1 = {current: ''};
    const ref2 = {current: ''};

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref1).toHaveProperty('current', 'bar');
    expect(ref2).toHaveProperty('current', 'bar');
  });

  it('should call the ref function of the second ref if the first ref is undefined', () => {
    const ref1 = undefined;
    const ref2 = jest.fn();

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref2).toHaveBeenCalledWith('bar');
  });

  it('should call the ref function of the first ref if the second ref is undefined', () => {
    const ref1 = jest.fn();
    const ref2 = undefined;

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref1).toHaveBeenCalledWith('bar');
  });

  it('should call the ref function of both refs if both refs are ref functions', () => {
    const ref1 = jest.fn();
    const ref2 = jest.fn();

    const ref = useForkRef(ref1, ref2);

    ref('bar');

    expect(ref1).toHaveBeenCalledWith('bar');
    expect(ref2).toHaveBeenCalledWith('bar');
  });
});

describe('useLocalRef', () => {
  it('should return a localRef and an elementRef', () => {
    let localRefTest, elementRefTest;
    const CustomComponent = React.forwardRef<HTMLDivElement>((_, ref) => {
      const {localRef, elementRef} = useLocalRef(ref);

      localRefTest = localRef;
      elementRefTest = elementRef;

      return <div ref={ref} />;
    });

    render(<CustomComponent />);

    expect(localRefTest).toHaveProperty('current');
    expect(elementRefTest).toEqual(expect.any(Function));
  });
});

describe('composeHooks', () => {
  let spy1, spy2;
  const myModel = {state: {first: 'first', second: 'second'}, events: {}};

  const hook1 = function<P extends {}>(model: typeof myModel, props: P) {
    return mergeProps(
      {
        id: 'hook1',
        hook1: 'hook1',
        first: model.state.first,
        onClick: spy1,
      },
      props
    );
  };

  const hook2 = function<P extends {}>(model: typeof myModel, props: P) {
    return mergeProps(
      {
        id: 'hook2',
        hook2: 'hook2',
        second: model.state.second,
        onClick: spy2,
      },
      props
    );
  };
  beforeEach(() => {
    spy1 = jest.fn();
    spy2 = jest.fn();
  });

  it('should merge properties from both hooks', () => {
    const props = composeHooks(hook1, hook2)(myModel, {}, null);
    expect(props).toHaveProperty('hook1', 'hook1');
    expect(props).toHaveProperty('hook2', 'hook2');
  });

  it('should overwrite props of the first hook with props from the second hook', () => {
    const props = composeHooks(hook1, hook2)(myModel, {}, null);
    expect(props).toHaveProperty('id', 'hook2');
  });

  it('should overwrite hook props with props passed in', () => {
    const props = composeHooks(hook1, hook2)(myModel, {id: 'foo'}, null);
    expect(props).toHaveProperty('id', 'foo');
  });

  it('should set props that are derived from the model on both hooks', () => {
    const props = composeHooks(hook1, hook2)(myModel, {}, null);
    expect(props).toHaveProperty('first', 'first');
    expect(props).toHaveProperty('second', 'second');
  });

  it('should call hook both callbacks', () => {
    const props = composeHooks(hook1, hook2)(myModel, {}, null) as {onClick: Function};
    props.onClick({event: 'foo'});
    expect(spy1).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalledWith({event: 'foo'});
    expect(spy2).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith({event: 'foo'});
  });

  it('should call both hook callbacks and passed in callback', () => {
    const spy3 = jest.fn();
    const props = composeHooks(hook1, hook2)(myModel, {onClick: spy3}, null) as {onClick: Function};
    props.onClick({event: 'foo'});
    expect(spy1).toHaveBeenCalled();
    expect(spy1).toHaveBeenCalledWith({event: 'foo'});
    expect(spy2).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith({event: 'foo'});
    expect(spy3).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalledWith({event: 'foo'});
  });

  it('should handle any number of hooks with the correct merging', () => {
    // This test is covering all previous tests, but with more hooks.
    // This test should only fail if the implementation doesn't handle more than 2 hooks
    const model = {state: {foo: 'bar'}, events: {}};
    const hooks = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (myModel, props) =>
      mergeProps({id: number, foo: number, [`hook${number}`]: model.state.foo}, props)
    );

    const props = composeHooks.apply(null, hooks as any)(myModel, {foo: 'baz'}, null);
    expect(props).toHaveProperty('id', 9);
    expect(props).toHaveProperty('hook1', 'bar');
    expect(props).toHaveProperty('foo', 'baz');
  });
});
