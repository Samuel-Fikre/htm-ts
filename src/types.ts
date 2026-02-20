export type Signal<T = unknown> = () => T;

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