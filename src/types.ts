export type Signal<T = unknown> = () => T;

export type SignalValue<T> = T extends Signal<infer V> ? V : T;

export type Bindable<T> = T | Signal<T>;

export type Component<P = {}> = (props: P) => VNode;

export type Child =
    | string
    | number
    | VNode
    | Signal
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