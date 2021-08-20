/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from 'react';
import {expectTypeOf, ExpectTypeOf} from 'expect-type';

import {
  createComponent,
  ElementComponent,
  TestElementComponent,
  ExtractProps,
  ExtractRef,
  AsProps,
  ExtractAsProps,
} from '../lib/utils/components';

// expect-type is a very cool library, but failures can be extremely difficult to understand. To
// combat the non-helpful failure messages, try to assign a value or type to a variable instead of
// inlining. This way the variable can be moused over for the tooltip to help determine what went
// wrong. When a test failed, observe the expected value vs the actual type or the Expected type vs
// actual type.

describe('ExtractRef', () => {
  it('should extract a ref from an element string', () => {
    type Expected = ExtractRef<'div'>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should extract a ref from an ElementComponent', () => {
    type Expected = ExtractRef<ElementComponent<'div', {}>>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should extract a ref from a React.ForwardExoticComponent', () => {
    const Component = React.forwardRef<HTMLDivElement, {foo: string}>(() => null);
    type Expected = ExtractRef<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });

  it('should return never for a React.FC', () => {
    type Expected = ExtractRef<React.FC>;

    expectTypeOf<Expected>().toEqualTypeOf<never>();
  });

  it('should return never for undefined', () => {
    type Expected = ExtractRef<undefined>;

    expectTypeOf<Expected>().toEqualTypeOf<never>();
  });

  it('should extract a ref for nested ElementComponents', () => {
    type Expected = ExtractRef<ElementComponent<ElementComponent<'div', {}>, {}>>;

    expectTypeOf<Expected>().toEqualTypeOf<React.Ref<HTMLDivElement>>();
  });
});

describe('ElementComponent', () => {
  it('should return the correct interface with no "as"', () => {
    type Props1 = {foo: string};
    const Component: TestElementComponent<'div', Props1> = null;

    expectTypeOf(Component({foo: 'bar', onClick: e => null})).toEqualTypeOf<
      Props1 & {ref?: React.Ref<HTMLDivElement>} & React.HTMLAttributes<HTMLDivElement>
    >();
  });

  it('should return the correct interface with an element "as"', () => {
    type Props1 = {foo: string};
    const Component: TestElementComponent<'div', Props1> = null;

    expectTypeOf(Component({foo: 'bar', as: 'button', onClick: e => null})).toEqualTypeOf<
      Props1 & {ref?: React.Ref<HTMLButtonElement>} & {as: 'button'} & React.ButtonHTMLAttributes<
          HTMLButtonElement
        >
    >();
  });

  it('should return the correct interface with a React.FC "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: TestElementComponent<'div', Props1> = null;
    const AsComponent: React.FC<Props1 & Props2> = null;
    type temp = React.ComponentProps<typeof AsComponent>;

    type Ref = ExtractRef<typeof AsComponent>;
    type asprops = AsProps<Props1, React.FC<Props1 & Props2>>;

    type props = ExtractAsProps<Props1, typeof AsComponent>;

    expectTypeOf(Component({foo: 'bar', bar: 'baz', as: AsComponent})).toEqualTypeOf<
      Props1 & {ref?: never} & {as: typeof AsComponent} & Props2 & {children?: React.ReactNode}
    >();
  });

  it('should return the correct interface with a ElementComponent "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: TestElementComponent<'div', Props1> = null;
    const AsComponent: ElementComponent<'button', Props2> = null;
    type temp = React.ComponentProps<typeof AsComponent>;
    type temp2 = ElementTagNameMap['button'];

    expectTypeOf(
      Component({foo: 'bar', bar: 'baz', as: AsComponent, onClick: e => null})
    ).toEqualTypeOf<
      Props1 &
        Props2 & {ref?: React.Ref<HTMLButtonElement>} & {
          as: typeof AsComponent;
        } & React.ButtonHTMLAttributes<HTMLButtonElement>
    >();
  });

  it('should return the correct interface with a React.ForwardComponent "as"', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: TestElementComponent<'div', Props1> = null;
    const AsComponent = React.forwardRef<HTMLButtonElement, Props1 & Props2>(() => null);

    type Ref = ExtractRef<typeof AsComponent>;
    type temp1 = React.ComponentProps<ElementComponent<'div', Props1>>;
    type temp2 = React.ComponentProps<React.FC<Props1>>;
    type temp3 = React.ComponentProps<typeof AsComponent>;

    type props = ExtractAsProps<Props1, typeof AsComponent>;

    expectTypeOf(Component({foo: 'bar', bar: 'baz', as: AsComponent})).toEqualTypeOf<
      Props1 & React.RefAttributes<HTMLButtonElement> & {as: typeof AsComponent} & Props2
    >();
  });

  it('should allow extra props to be spread to the prop interface of an "as" React.FC', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent: React.FC<Props1 & Props2 & React.ComponentProps<'button'>> = null;

    type temp = React.ComponentProps<typeof AsComponent>;

    <Component foobar="baz" />;
    // @ts-expect-error
    <Component as={AsComponent} foo="bar" />; // error, missing `bar` prop
    <Component as={AsComponent} foo="bar" bar="baz" />; // no error
    <Component as={AsComponent} onClick={e => null} foo="bar" bar="baz" />; // no error
  });

  it('should allow extra props to be spread to the prop interface of an "as" React.ForwardRefExoticComponent', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent = React.forwardRef<HTMLDivElement, Props2 & React.ComponentProps<'button'>>(
      () => null
    );

    type temp = React.ComponentProps<typeof AsComponent>;

    // @ts-expect-error
    <Component as={AsComponent} foo="bar" />; // error, missing `bar` props
    // @ts-expect-error
    <Component as={AsComponent} foo="bar" onClick={e => null} />; // error, missing `bar` props. `onClick` should be known
    <Component as={AsComponent} foo="bar" bar="baz" onClick={e => null} />; // no error
  });

  it('should allow extra props to be spread to the prop interface of an "as" ElementComponent', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent: ElementComponent<'button', Props2> = null;

    // @ts-expect-error
    <Component as={AsComponent} foo="bar" />; // error, missing `bar` props
    <Component as={AsComponent} foo="bar" bar="baz" />; // no error
    <Component as={AsComponent} key="foo" foo="bar" bar="baz" onClick={e => null} />; // no error, `onClick` should be known
  });

  it('should merge the props of an ElementComponent and the "as" React.FC', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent: React.FC<Props2> = null;

    // @ts-expect-error
    <Component as={AsComponent} foo="bar" />; // error, missing `bar`
    <Component as={AsComponent} foo="bar" />; // error, missing `bar`
  });

  it('should merge the props of an ElementComponent and the "as" React.ForwardRefExoticComponent', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent = React.forwardRef<HTMLDivElement, Props2>(() => null);

    <Component as={AsComponent} foo="bar" />;
  });

  it('should merge the props of an ElementComponent and the "as" ElementComponent', () => {
    type Props1 = {foo: string};
    type Props2 = {bar: string};
    const Component: ElementComponent<'div', Props1> = null;
    const AsComponent: ElementComponent<'div', Props2> = null;

    <Component as={AsComponent} foo="bar" />;
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
    return <Component ref={ref} />;
  });
});

describe('ExtractProps', () => {
  interface Props {
    foo: string;
  }
  const ElementComponent = createComponent('div')({
    Component: (props: Props) => null,
  });

  it('should return the props and HTMLDivElement interface when no element is provided on an `ElementComponent`', () => {
    type Expected = ExtractProps<typeof ElementComponent>;

    expectTypeOf<Expected>().toEqualTypeOf<Props & React.HTMLAttributes<HTMLDivElement>>();
  });

  it('should return the props and HTMLButtonElement when a `button` element is provided on an `ElementComponent`', () => {
    type Expected = ExtractProps<typeof ElementComponent, 'button'>;

    expectTypeOf<Expected>().toEqualTypeOf<Props & React.ButtonHTMLAttributes<HTMLButtonElement>>();
  });

  it('should return only the props when `never` is provided on an `ElementComponent', () => {
    type Expected = ExtractProps<typeof ElementComponent, never>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return only props on a `Component`', () => {
    const Component = createComponent()({Component: (props: Props) => null});
    type Expected = ExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return props of a class component', () => {
    class Component extends React.Component<Props> {}
    type Expected = ExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  it('should return props of a functional component', () => {
    const Component = (props: Props) => null;
    type Expected = ExtractProps<typeof Component>;

    expectTypeOf<Expected>().toEqualTypeOf<Props>();
  });

  describe('nested ElementComponent', () => {
    interface Props2 {
      bar: string;
    }

    it('should return the combined interface of all components and HTML attributes when no element override is provided to ExtractProps', () => {
      const Component1 = createComponent('button')({Component: (props: Props) => null});
      const Component2 = createComponent(Component1)({Component: (props: Props2) => null});
      type Expected = ExtractProps<typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<
        Props & Props2 & React.ButtonHTMLAttributes<HTMLButtonElement>
      >();
    });

    it('should return only the outer component props when `never` is supplied to ExtractProps', () => {
      const Component1 = createComponent('button')({Component: (props: Props) => null});
      const Component2 = createComponent(Component1)({Component: (props: Props2) => null});
      type Expected = ExtractProps<typeof Component2, never>;

      expectTypeOf<Expected>().toEqualTypeOf<Props2>();
    });

    it('should return the combined interface of all components when an ElementComponent override is provided to ExtractProps', () => {
      const Component1 = createComponent('aside')({Component: (props: Props) => null});
      const Component2 = createComponent('button')({Component: (props: Props2) => null});
      type Expected = ExtractProps<typeof Component1, typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<
        Props & Props2 & React.ButtonHTMLAttributes<HTMLButtonElement>
      >();
    });

    it('should return the combined interface of all components when a React.Component override is provided to ExtractProps', () => {
      const Component1 = createComponent('aside')({Component: (props: Props) => null});
      const Component2 = (props: Props2) => null;
      type Expected = ExtractProps<typeof Component1, typeof Component2>;

      expectTypeOf<Expected>().toEqualTypeOf<Props & Props2>();

      type Foo = ExtractProps<ElementComponent<'div', Props>>;
    });
  });
});
