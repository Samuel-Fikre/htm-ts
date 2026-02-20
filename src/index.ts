import { VNode, Child, Component } from './types.js';

/**
 * HyperScript function to create a VNode POJO.
 */

export function h(
    type: string | Component<any>,
    props: Record<string, any> | null,
    ...children: any[]
): VNode {
    const results: Child[] = [];
    const stack = children.length > 0 ? children.slice().reverse() : [];

    while (stack.length > 0) {
        const item = stack.pop();

        if (Array.isArray(item)) {
            for (let i = item.length - 1; i >= 0; i--) {
                stack.push(item[i]);
            }
        } else if (item !== false && item !== true && item != null) {
            // Keep 0, strings, VNodes, Signals
            results.push(item);
        } else if (item === null || item === undefined) {
            // Standard VDOM behavior: keep placeholders for null/undefined
            results.push(null);
        }
        // Booleans (true/false) are ignored
    }

    const vnode: VNode = {
        type,
        props,
        children: results,
    };

    if (props && props.key !== undefined) {
        vnode.key = props.key;
        // Optimization: Create a new props object without the key to keep it clean
        const { key, ...rest } = props;
        vnode.props = Object.keys(rest).length > 0 ? rest : null;
    }

    return vnode;
}

/**
 * Placeholder html tagged template function.
 */
export function html(strings: TemplateStringsArray, ...values: any[]): VNode {
    return h('div', null, 'Skeleton Active');
}

