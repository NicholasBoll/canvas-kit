import React from 'react';
import {mergeProps} from './mergeProps';
import {Model} from './models';

/**
 * Adds the `as` to the style interface to support `as` in styled components
 * This type and usage should be removed with Emotion 11
 */
export type StyledType = {
  as?: React.ElementType;
};

/**
 * Extract a Ref from T if it exists
 * This will return the following:
 *
 * - `undefined` => `never`
 * - `'button'` => `React.Ref<HTMLButtonElement>`
 * - `ElementComponent<'button', ButtonProps>` => `React.Ref<HTMLButtonElement>`
 * - `React.forwardRef<HTMLButtonElement, {}>(..)` => `React.Ref<HTMLButtonElement>`
 */
export type ExtractRef<TComponent> = TComponent extends undefined // test if `TComponent` is `undefined`. Without this check, `undefined` matches `React.JSXElementConstructor` for some reason and the return is `unknown` (failed infer of `R`)
  ? never // if yes, return `never` // : TComponent extends BaseElementComponent<infer E, any> // ? {1: E} // React.Ref<ExtractHTMLElement<E>>
  : TComponent extends React.JSXElementConstructor<infer Props> // test if `TComponent` is a `JSXElementConstructor` (anything matching `(props: P) => React.ReactElement | null`) while inferring `Props`
  ? Props extends {ref?: infer R} // test if `Props` has a `ref` while inferring the ref
    ? R // if yes, return the inferred ref `R`
    : never // if no, there should be no ref, return `never`
  : TComponent extends keyof ElementTagNameMap // test if `TComponent` is an element string like 'button' or 'div'
  ? React.Ref<ElementTagNameMap[TComponent]> // if yes, the ref should be the element interface. `'button' => HTMLButtonElement`
  : never; // nothing matched, return `never`

type BaseElementComponent<E extends React.ElementType, P> = {
  __type: 'ElementComponent'; // used internally to distinguish between `ElementComponent` and `Component`
  (props: Props<P, E>): JSX.Element;
  // <ElementType extends React.ElementType>(props: AsProps<P, ElementType>): JSX.Element;
  displayName?: string;
};

type ExtractHTMLElement<E> = E extends keyof JSX.IntrinsicElements
  ? ExtractHTMLAttributes<JSX.IntrinsicElements[E]>
  : never;

export type ExtractAsProps<
  P,
  TComponent extends keyof JSX.IntrinsicElements | React.ComponentType
> = TComponent extends keyof JSX.IntrinsicElements // test if `TComponent` extends `keyof JSX.IntrinsicElements`
  ? P & ExtractHTMLAttributes<JSX.IntrinsicElements[TComponent]> // if yes, return original props `P` and the HTML attribute interface of element `E`
  : TComponent extends BaseElementComponent<infer E, infer P2> // if no, test if `TComponent` is another `ElementComponent`
  ? P & P2 & ExtractHTMLElement<E> // if `TComponent` is a `ElementComponent`, return props a merge of parent component props, `ElementComponent` props, and the child `ElementComponent` element HTML attribute interface
  : TComponent extends (props: infer P2) => React.ReactElement | null
  ? Omit<P2, 'as'> //{element: P2}
  : Omit<ExtractHTMLAttributes<React.ComponentProps<TComponent>>, keyof P>; // Trying to figure out a better way than with `Omit` since `Omit` complicates type errors, but extracting information using `ElementComponent` causes circular references
// : Omit<ExtractHTMLAttributes<React.ComponentProps<E>>, keyof P> & { // : E extends ElementComponent<any, any> // ? ExtractProps<E>

export type AsProps<
  P,
  ElementType extends keyof JSX.IntrinsicElements | React.ComponentType
> = ExtractAsProps<P, ElementType> & {
  /**
   * Optional ref. If the component represents an element, this ref will be a reference to the
   * real DOM element of the component. If `as` is set to an element, it will be that element.
   * If `as` is a component, the reference will be to that component (or element if the component
   * uses `React.forwardRef`).
   */
  ref?: ExtractRef<ElementType>;
} & As<ElementType>;

/**
 * Generic component props with "as" prop
 * @template P Additional props
 * @template ElementType React component or string element
 */
export type Props<P, ElementType extends React.ElementType> = P &
  ExtractHTMLAttributes<React.ComponentProps<ElementType>> & {
    /**
     * Optional ref. If the component represents an element, this ref will be a reference to the
     * real DOM element of the component. If `as` is set to an element, it will be that element.
     * If `as` is a component, the reference will be to that component (or element if the component
     * uses `React.forwardRef`).
     */
    ref?: ExtractRef<ElementType>;
  };

/**
 * Extracts only the HTML attribute interface from `JSX.IntrinsicElements[E]`. This effectively removes `ref` and `key`
 * without using `Omit` which makes the returned type more difficult to understand.
 *
 * For example:
 * JSX.IntrinsicElements['button'] // React.ClassAttributes<HTMLButtonElement> & React.ButtonHTMLAttributes<HTMLButtonElement>
 * ExtractHTMLAttributes<JSX.IntrinsicElements['button']> // React.HTMLButtonAttributes<HTMLButtonElement>
 */
export type ExtractHTMLAttributes<
  T extends React.DetailedHTMLProps<any, any>
> = T extends React.DetailedHTMLProps<infer P, any> ? P : T;

/**
 * Extract props from any component that was created using `createComponent`. It will return the
 * HTML attribute interface of the default element used with `createComponent`. If you use `as`, the
 * HTML attribute interface can change, so you can use an override to the element you wish to use.
 * You can also disable the HTML attribute by passing `never`:
 *
 * - `ExtractProps<typeof Card>`: `CardProps & React.HTMLAttributes<HTMLDivElement>`
 * - `ExtractProps<typeof Card, 'aside'>`: `CardProps & React.HTMLAttributes<HTMLElement>`
 * - `ExtractProps<typeof Card, never>`: `CardProps`
 *
 * @template TComponent The component you wish to extract props from. Needs 'typeof` in front:
 * `typeof Card`
 * @template TElement An optional override of the element that will be used. Define this if you use
 * an `as` on the component
 *
 * @example
 * interface MyProps extends ExtractProps<typeof Card.Body> {}
 *
 * ExtractProps<typeof Card>; // CardProps & React.HTMLAttributes<HTMLDivElement>
 * ExtractProps<typeof Card, 'aside'>; // CardProps & React.HTMLAttributes<HTMLElement>
 * ExtractProps<typeof Card, never>; // CardProps
 */
export type ExtractProps<
  TComponent,
  TElement extends
    | keyof JSX.IntrinsicElements
    | ElementComponent<any, any>
    | Component<any>
    | React.ComponentType<any>
    | undefined
    | never = undefined
> = TComponent extends ElementComponent<infer E, infer P> // test if `TComponent` is an `ElementComponent`, while inferring both default element and props associated
  ? [TElement] extends [never] // test if user passed `never` for the `TElement` override. We have to test `never` first, otherwise TS gets confused and `ExtractProps` will return `never`. https://github.com/microsoft/TypeScript/issues/23182
    ? P // if `TElement` was `never`, return only the inferred props `P`
    : TElement extends undefined // else test if TElement was defined
    ? E extends keyof JSX.IntrinsicElements // test if the inferred element `E` is in `JSX.IntrinsicElements`
      ? P & ExtractHTMLAttributes<JSX.IntrinsicElements[E]> // `TElement` wasn't explicitly defined, so let's fall back to the inferred element's HTML attribute interface + props `P`
      : P & ExtractPropsFromComponent<E> // E isn't in `JSX.IntrinsicElements`, return inferred props `P` + props extracted from component `E`. It would be nice to use `ExtractProps` again here, but that creates a circular dependency
    : TElement extends keyof JSX.IntrinsicElements // `TElement` was defined, test if it is in `JSX.IntrinsicElements`
    ? P & ExtractHTMLAttributes<JSX.IntrinsicElements[TElement]> // `TElement` is in `JSX.IntrinsicElements`, return inferred props `P` + HTML attributes of `TElement`
    : P & ExtractPropsFromComponent<TElement> // `TElement` is not in `JSX.IntrinsicElements`, return inferred props `P` + props extracted from component `TElement`. It would be nice to use `ExtractProps` again here, but that creates a circular dependency
  : ExtractPropsFromComponent<TComponent>; // `TComponent` does not extend `ElementComponent`. Return props extracted from component `TComponent`

// Extract props from a component. This type is only necessary because `ExtractProps` cannot
// reference itself, creating a circular dependency. Instead, we define this type to allow for at
// least 1 level of nesting.
type ExtractPropsFromComponent<TComponent> = TComponent extends ElementComponent<infer E, infer P> // test if `TComponent` is an `ElementComponent`, while inferring both default element and props associated
  ? E extends keyof JSX.IntrinsicElements // test if the inferred element `E` is in `JSX.IntrinsicElements`
    ? P & ExtractHTMLAttributes<JSX.IntrinsicElements[E]> // return inferred props `P` + HTML attributes of inferred element `E`
    : P // `E` wasn't a key of `JSX.IntrinsicElements`, so just return the inferred props `P`
  : TComponent extends Component<infer P> // test if `TComponent` is a `Component`, while inferring props `P`
  ? P // it was a `Component`, return inferred props `P`
  : TComponent extends React.ComponentType<infer P> // test if `TComponent` is a `React.ComponentType` (class or functional component)
  ? P // it was a `React.ComponentType`, return inferred props `P`
  : {}; // We don't know what `TComponent` was, return an empty object

type As<E> = {
  /**
   * Optional override of the default element used by the component. Any valid tag or Component.
   * If you provided a Component, this component should forward the ref using `React.forwardRef`
   * and spread extra props to a root element.
   */
  as: E;
};

/**
 * Component type that allows for `as` to change the element or component type.
 * Passing `as` will correctly change the allowed interface of the JSX element
 */
export interface ElementComponent<E extends React.ElementType, P> {
  __type: 'ElementComponent'; // used internally to distinguish between `ElementComponent` and `Component`
  <ElementType extends React.ElementType>(props: AsProps<P, ElementType>): JSX.Element;
  (props: Props<P, E>): JSX.Element;
  displayName?: string;
}

/**
 * Type for testing purposes. It should be kept the same as `ElementComponent`, except the return
 * type is the same as the accepted props to verify the type output.
 */
export type TestElementComponent<E extends React.ElementType, P> = {
  <ElementType extends React.ElementType>(props: AsProps<P, ElementType>): AsProps<P, ElementType>;
  (props: Props<P, E>): Props<P, E>;
};

export type Component<P> = {
  __type: 'Component'; // used internally to distinguish between `ElementComponent` and `Component`
  (props: P): JSX.Element;
  displayName?: string;
};

interface RefForwardingComponent<T, P = {}> {
  (
    props: React.PropsWithChildren<P> & {as?: React.ReactElement<any>},
    /**
     * A ref to be forwarded. Pass it along to the root element. If no element was passed, this
     * will result in a `never`
     */
    ref: ExtractRef<T>,
    /**
     * An element - either a JSX element or a `ElementComponent`. This should be passed as an `as`
     * to a root element or be the root element. If no element was passed, this will result in a
     * `never`
     */
    Element: T extends undefined ? never : T
  ): React.ReactElement | null;
}

/**
 * Factory function that creates components to be exported. It enforces React ref forwarding, `as`
 * prop, display name, and sub-components, and handles proper typing without much boiler plate. The
 * return type is `Component<element, Props>` which looks like `Component<'div', Props>` which is a
 * clean interface that tells you the default element that is used.
 */
export const createComponent = <
  E extends
    | keyof JSX.IntrinsicElements
    | React.ComponentType
    | ElementComponent<any, any>
    | undefined = undefined
>(
  as?: E
) => <P, SubComponents = {}>({
  displayName,
  Component,
  subComponents,
}: {
  /** This is what the component will look like in the React dev tools. Encouraged to more easily
   * understand the component tree */
  displayName?: string;
  /** The component function. The function looks like:
   * @example
   * Component: ({children}, ref, Element) {
   *   // `Element` is what's passed to the `as` of your component. If no `as` was defined, it
   *   // will be the default element. It will be 'div' or even a another Component!
   *   return (
   *     <Element ref={ref}>{children}</Element>
   *   )
   * }
   *
   * @example
   * Component: ({children}, ref, Element) {
   *   // `Element` can be passed via `as` to the next component
   *   return (
   *     <AnotherElement as={Element} ref={ref}>{children}</AnotherElement>
   *   )
   * }
   */
  Component: RefForwardingComponent<E, P>;
  /**
   * Used in container components
   */
  subComponents?: SubComponents;
}): (E extends undefined
  ? Component<P>
  : ElementComponent<
      // E is not `undefined` here, but Typescript thinks it could be, so we add another `undefined`
      // check and cast to a `React.FC` to match a valid signature for `ElementComponent`.
      // `React.FC` was chosen as the simplest valid interface.
      E extends undefined ? React.FC : E,
      P
    >) &
  SubComponents => {
  const ReturnedComponent = React.forwardRef<E, P & {as?: React.ElementType}>(
    ({as: asOverride, ...props}, ref) => {
      return Component(
        props as P,
        ref as ExtractRef<E>,
        // Cast to `any` to avoid: "ts(2345): Type 'undefined' is not assignable to type 'E extends
        // undefined ? never : E'" I'm not sure I can actually cast to this conditional type and it
        // doesn't actually matter, so cast to `any` it is.
        (asOverride || as) as any
      );
    }
  );

  Object.keys(subComponents || {}).forEach(key => {
    // `ReturnedComponent` is a `React.ForwardRefExoticComponent` which has no additional keys so
    // we'll cast to `Record<string, any>` for assignment. Note the lack of type checking
    // properties. Take care when changing the runtime of this function.
    (ReturnedComponent as Record<string, any>)[key] = (subComponents as Record<string, any>)[key];
  });
  ReturnedComponent.displayName = displayName;

  // Cast as `any`. We have already specified the return type. Be careful making changes to this
  // file due to this `any` `ReturnedComponent` is a `React.ForwardRefExoticComponent`, but we want
  // it to be either an `Component` or `ElementComponent`
  return ReturnedComponent as any;
};

/**
 * Factory function to crate a behavior hook with correct generic types. It takes a function that
 * return props and returns a function that will also require `elemProps` and will call `mergeProps` for
 * you. If your hook makes use of the `ref`, you will have to also use `useLocalRef` to properly fork
 * the ref.
 *
 * @example
 * const useMyHook = createHook((model: MyModel, ref) => {
 *   const { localRef, elementRef } = useLocalRef(ref);
 *   // do whatever with `localRef` which is a RefObject
 *
 *   return {
 *     onClick: model.events.doSomething,
 *     ref: elementRef,
 *   };
 * });
 *
 * // Equivalent to:
 * const useMyHook = <P extends {}, R>(
 *   model: MyModel,
 *   elemProps: P,
 *   ref: React.Ref<R>
 * ) => {
 *   const { localRef, elementRef } = useLocalRef(ref);
 *   // do whatever with `localRef` which is a RefObject
 *
 *   return mergeProps({
 *     onClick: model.events.doSomething,
 *     ref: elementRef,
 *   }, elemProps);
 * };
 *
 * @param fn Function that takes a model and optional ref and returns props
 */
export const createHook = <M extends Model<any, any>, PO extends {}, PI extends {}>(
  fn: (model: M, ref?: React.Ref<any>, elemProps?: PI) => PO
): BehaviorHook<M, PO> => {
  return (model, elemProps, ref) => {
    const props = mergeProps(fn(model, ref, elemProps || ({} as any)), elemProps || ({} as any));
    // capture a ref to forward to the element, either one returned by the `fn` or by the passed in `ref`
    let elementRef = props.ref || ref;

    // Development only to test proper forwarding
    if (process.env.NODE_ENV !== 'production') {
      const testProp = '__test_prop_forwarding';
      props[testProp] = 'true';
      // fork ref to track it
      const refs = useLocalRef(elementRef);
      elementRef = refs.elementRef;
      React.useEffect(() => {
        console.log('ref', props.ref, ref, refs);
        const url =
          'https://workday.github.io/canvas-kit/?path=/story/welcome-dev-docs-compound-components--page#configuring-components';
        if (!refs.localRef.current) {
          console.warn(
            'Components passed via the `as` prop must forward a ref to an element. See ' + url
          );
        } else {
          if (!refs.localRef.current!.getAttribute(testProp)) {
            console.warn(
              'Components passed via the `as` prop must forward additional props to an element. See ' +
                url
            );
          } else {
            refs.localRef.current!.removeAttribute(testProp);
          }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    }

    // This is the weird "incoming ref isn't in props, but outgoing ref is in props" thing
    props.ref = elementRef;

    return props;
  };
};

export type BehaviorHook<M extends Model<any, any>, O extends {}> = <P extends {}, R>(
  model: M,
  elemProps?: P,
  ref?: React.Ref<R>
) => O & P & (R extends HTMLOrSVGElement ? {ref: React.Ref<R>} : {});

function setRef<T>(ref: React.Ref<T> | undefined, value: T): void {
  if (ref) {
    if (typeof ref === 'function') {
      ref(value);
    } else {
      // Refs are readonly, but we can technically write to it without issue
      (ref as React.MutableRefObject<T>).current = value;
    }
  }
}

/**
 * This function will create a new forked ref out of two input Refs. This is useful for components
 * that use `React.forwardRef`, but also need internal access to a Ref.
 *
 * This function is inspired by https://www.npmjs.com/package/@rooks/use-fork-ref
 *
 * @example
 * React.forwardRef((props, ref) => {
 *   // Returns a RefObject with a `current` property
 *   const myRef = React.useRef(ref)
 *
 *   // Returns a forked Ref function to pass to an element.
 *   // This forked ref will update both `myRef` and `ref` when React updates the element ref
 *   const elementRef = useForkRef(ref, myRef)
 *
 *   useEffect(() => {
 *     console.log(myRef.current) // `current` is the DOM instance
 *     // `ref` might be null since it depends on if someone passed a `ref` to your component
 *     // `elementRef` is a function and we cannot get a current value out of it
 *   })
 *
 *   return <div ref={elementRef}/>
 * })
 */
export function useForkRef<T>(ref1?: React.Ref<T>, ref2?: React.Ref<T>): (instance: T) => void {
  return (value: T) => {
    setRef(ref1, value);
    setRef(ref2, value);
  };
}

/**
 * This functions handles the common use case where a component needs a local ref and needs to
 * forward a ref to an element.
 * @param ref The React ref passed from the `createComponent` factory function
 *
 * @example
 * const MyComponent = ({children, ...elemProps}: MyProps, ref, Element) => {
 *   const { localRef, elementRef } = useLocalRef(ref);
 *
 *   // do something with `localRef` which is a `RefObject` with a `current` property
 *
 *   return <Element ref={elementRef} {...elemProps} />
 * }
 */
export function useLocalRef<T>(ref?: React.Ref<T>) {
  const localRef = React.useRef<T>(null);
  const elementRef = useForkRef(ref, localRef);

  return {localRef, elementRef};
}

/**
 * Returns a model, or calls the model hook with config. Clever way around the conditional React
 * hook ESLint rule.
 * @param model A model, if provided
 * @param config Config for a model
 * @param modelHook A model hook that takes valid config
 * @example
 * const ContainerComponent = ({children, model, ...config}: ContainerProps) => {
 *   const value = useDefaultModel(model, config, useContainerModel);
 *
 *   // ...
 * }
 */
export function useDefaultModel<T, C>(
  model: T | undefined,
  config: C,
  modelHook: (config: C) => T
) {
  return model || modelHook(config);
}

/**
 * Returns a model, or returns a model context. Clever way around the conditional React hook ESLint
 * rule
 * @param model A model, if provided
 * @param context The context of a model
 * @example
 * const SubComponent = ({children, model, ...elemProps}: SubComponentProps, ref, Element) => {
 *   const {state, events} = useModelContext(model, SubComponentModelContext);
 *
 *   // ...
 * }
 */
export function useModelContext<T>(context: React.Context<T>, model?: T): T {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return model || React.useContext(context);
}

/**
 * Compose many hooks together. Assumes hooks are using `mergeProps`. Returns a function that will
 * receive a model and return props to be applied to a component. These props should always be
 * applied last on the Component. The props will override as follows: rightmost hook props override
 * leftmost hook props which are overridden by props passed to the composeHooks function.
 *
 * A `ref` should be passed for hooks that require a ref. Each hook should fork the ref using
 * `useLocalRef`, passing the `elementRef` in the returned props object. This ref will be passed to
 * the next hook.
 *
 * @example
 * const MyComponent = React.forwardRef(({ children, model, ...elemProps }, ref) => {
 *   const props = composeHooks(useHook1, useHook2)(model, elemProps, ref)
 *
 *   return <div id="foo" {...props}>{children}</div>
 * })
 */
export function composeHooks<M extends Model<any, any>, O1 extends {}, P extends {}, O2 extends {}>(
  hook1: (model: M, props: P, ref: React.Ref<any>) => O1,
  hook2: (model: M, props: P, ref: React.Ref<any>) => O2
): BehaviorHook<M, O1 & O2>;

export function composeHooks<
  M extends Model<any, any>,
  R,
  P extends {},
  O1 extends {},
  O2 extends {},
  O3 extends {}
>(
  hook1: (model: M, props: P, ref: React.Ref<R>) => O1,
  hook2: (model: M, props: P, ref: React.Ref<R>) => O2,
  hook3: (model: M, props: P, ref: React.Ref<R>) => O3
): BehaviorHook<M, O1 & O2 & O3>;
export function composeHooks<
  M extends Model<any, any>,
  R,
  P extends {},
  O1 extends {},
  O2 extends {},
  O3 extends {},
  O4 extends {}
>(
  hook1: (model: M, props: P, ref: React.Ref<R>) => O1,
  hook2: (model: M, props: P, ref: React.Ref<R>) => O2,
  hook3: (model: M, props: P, ref: React.Ref<R>) => O3,
  hook4: (model: M, props: P, ref: React.Ref<R>) => O4
): BehaviorHook<M, O1 & O2 & O3 & O4>;
export function composeHooks<
  M extends Model<any, any>,
  R,
  P extends {},
  O1 extends {},
  O2 extends {},
  O3 extends {},
  O4 extends {},
  O5 extends {}
>(
  hook1: (model: M, props: P, ref: React.Ref<R>) => O1,
  hook2: (model: M, props: P, ref: React.Ref<R>) => O2,
  hook3: (model: M, props: P, ref: React.Ref<R>) => O3,
  hook4: (model: M, props: P, ref: React.Ref<R>) => O4,
  hook5: (model: M, props: P, ref: React.Ref<R>) => O5
): BehaviorHook<M, O1 & O2 & O3 & O4 & O5>;
export function composeHooks<M extends Model<any, any>, R, P extends {}, O extends {}>(
  ...hooks: ((model: M, props: P, ref: React.Ref<R>) => O)[]
): BehaviorHook<M, O> {
  return (model, props, ref) => {
    const returnProps = [...hooks].reverse().reduce((props: any, hook) => {
      return hook(model, props, props.ref || ref);
    }, props);

    if (!returnProps.hasOwnProperty('ref')) {
      // This is the weird "incoming ref isn't in props, but outgoing ref is in props" thing
      returnProps.ref = ref;
    }

    return returnProps;
  };
}
