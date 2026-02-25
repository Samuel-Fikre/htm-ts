// A reactive signal function that returns T when called
// This is distinct from components which take props as arguments
export type Signal<T = unknown> = () => T;

// Type guard to identify signals at runtime
export const isSignal = (value: unknown): value is Signal<unknown> => 
    typeof value === 'function' && 
    value.length === 0; // Signals take no arguments

export type SignalValue<T> = T extends Signal<infer V> ? V : T;

export type Bindable<T> = T | Signal<T>;

export type Component<P = {}> = (props: P) => VNode;

// Child type includes Signal but we distinguish it by arity
// Signals are () => T, while components are (props) => VNode
export type Child =
    | string
    | number
    | VNode
    | Signal<any>
    | boolean
    | null
    | undefined;

export interface VNode {
    type: string | Component<any>;
    props: Record<string, any> | null;
    children: Child[];
    key?: string | number;
}

// Precise attribute types for IntelliSense support
export type HTMLElements = keyof HTMLElementTagNameMap;

export type HTMLProps<Tag extends HTMLElements> = {
    [K in keyof HTMLElementTagNameMap[Tag]]?: Bindable<HTMLElementTagNameMap[Tag][K]>;
} & {
    style?: Bindable<string | Partial<CSSStyleDeclaration>>;
    class?: Bindable<string>;
    [key: string]: any;
};