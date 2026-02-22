import { VNode, Child, Component } from './types.js';

// Core Reactivity System
let context: (() => void) | null = null;

export function signal<T>(value: T): [() => T, (v: T) => void] {
    const subscriptions = new Set<() => void>();
    return [
        () => {
            if (context) subscriptions.add(context);
            return value;
        },
        (newValue: T) => {
            value = newValue;
            subscriptions.forEach(fn => fn());
        }
    ];
}

export function effect(fn: () => void) {
    context = fn;
    fn();
    context = null;
}


const enum Mode {
    Slash = 0,
    Text = 1,
    Whitespace = 2,
    TagName = 3,
    Comment = 4,
    PropSet = 5,
    PropAppend = 6,
}

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
            results.push(item);
        } else if (item === null || item === undefined) {
            results.push(null);
        }
    }

    const vnode: VNode = {
        type,
        props,
        children: results,
    };

    if (props && props.key !== undefined) {
        vnode.key = props.key;
        const { key, ...rest } = props;
        vnode.props = Object.keys(rest).length > 0 ? rest : null;
    }

    return vnode;
}

/**
 * Modernized htm parser logic.
 * Zero-recursion, strictly typed, and corrected for nested/self-closing tags.
 */
export function html(statics: TemplateStringsArray, ...fields: any[]): VNode | Child[] | Child {
    let mode: Mode = Mode.Text;
    let buffer = '';
    let quote = '';
    let current: any[] = [0];
    let char: string;
    let propName: string = '';

    const commit = (fieldIndex?: number): void => {
        if (mode === Mode.Text && (fieldIndex !== undefined || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
            current.push(fieldIndex !== undefined ? fields[fieldIndex - 1] : buffer);
        } else if (mode === Mode.TagName && (fieldIndex !== undefined || buffer)) {
            current[1] = fieldIndex !== undefined ? fields[fieldIndex - 1] : buffer;
            mode = Mode.Whitespace;
        } else if (mode === Mode.Whitespace && buffer === '...' && fieldIndex !== undefined) {
            current[2] = Object.assign(current[2] || {}, fields[fieldIndex - 1]);
        } else if (mode === Mode.Whitespace && buffer && fieldIndex === undefined) {
            (current[2] = current[2] || {})[buffer] = true;
        } else if (mode >= Mode.PropSet) {
            if (mode === Mode.PropSet) {
                (current[2] = current[2] || {})[propName] = fieldIndex !== undefined ?
                    (buffer ? (buffer + fields[fieldIndex - 1]) : fields[fieldIndex - 1]) : buffer;
                mode = Mode.PropAppend;
            } else if (fieldIndex !== undefined || buffer) {
                current[2][propName] += fieldIndex !== undefined ? buffer + fields[fieldIndex - 1] : buffer;
            }
        }
        buffer = '';
    };

    for (let i = 0; i < statics.length; i++) {
        if (i) {
            if (mode === Mode.Text) commit();
            commit(i);
        }

        for (let j = 0; j < statics[i].length; j++) {
            char = statics[i][j];

            if (mode === Mode.Text) {
                if (char === '<') {
                    commit();
                    current = [current, '', null];
                    mode = Mode.TagName;
                } else {
                    buffer += char;
                }
            } else if (mode === Mode.Comment) {
                if (buffer === '--' && char === '>') {
                    mode = Mode.Text;
                    buffer = '';
                } else {
                    buffer = char + buffer[0];
                }
            } else if (quote) {
                if (char === quote) {
                    quote = '';
                } else {
                    buffer += char;
                }
            } else if (char === '"' || char === "'") {
                quote = char;
            } else if (char === '>') {
                commit();
                mode = Mode.Text;
            } else if (char === '=') {
                mode = Mode.PropSet;
                propName = buffer;
                buffer = '';
            } else if (char === '/' && (mode < Mode.PropSet || statics[i][j + 1] === '>')) {
                commit();
                // htm mini closing tag logic:
                // 1. If we are in TagName, we are closing a tag (e.g. </div)
                if (mode === Mode.TagName) {
                    current = current[0]; // Pop the empty TagName array
                }
                const nodeState = current;
                current = current[0]; // Pop back to parent
                current.push(h(nodeState[1], nodeState[2], ...nodeState.slice(3)));
                mode = Mode.Slash;
            } else if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                commit();
                mode = Mode.Whitespace;
            } else {
                buffer += char;
            }

            if (mode === Mode.TagName && buffer === '!--') {
                mode = Mode.Comment;
                current = current[0];
            }
        }
    }
    commit();

    return current.length > 2 ? current.slice(1) : current[1];
}

/**
 * Render a VNode or Child into a DOM parent.
 */
export function render(vnode: VNode | Child | Child[], parent: Node): void {
    if (parent instanceof Element && parent.childNodes.length > 0) {
        parent.textContent = '';
    }

    const children = Array.isArray(vnode) ? vnode : [vnode];

    for (const child of children) {
        renderChild(child, parent);
    }
}

function renderChild(child: Child, parent: Node): void {
    if (child == null || child === false || child === true) {
        return;
    }

    if (typeof child === 'function') {
        // Create a stable marker in the DOM for this signal
        const textNode = document.createTextNode("");
        parent.appendChild(textNode);

        // Subscribe to changes
        effect(() => {
            const value = (child as Function)();
            textNode.textContent = value == null ? "" : String(value);
        });
        return;
    }

    if (typeof child === 'string' || typeof child === 'number') {
        parent.appendChild(document.createTextNode(String(child)));
        return;
    }

    const { type, props, children } = child as VNode;

    // Safety Guard for Fragments / empty tags
    if (!type) {
        if (children) {
            for (const vchild of children) {
                renderChild(vchild, parent);
            }
        }
        return;
    }

    if (typeof type === 'function') {
        const componentVNode = type(props || {});
        renderChild(componentVNode, parent);
        return;
    }

    const dom = document.createElement(type);

    if (props) {
        for (const prop in props) {
            const value = props[prop];
            if (prop === 'key') continue;

            // DOM Property Heuristics & Boolean Attribute Handling
            if (prop in dom && prop !== 'style' && prop !== 'list' && prop !== 'form' && prop !== 'type') {
                (dom as any)[prop] = value === null ? '' : value;
            } else {
                if (value === false || value == null) {
                    dom.removeAttribute(prop);
                } else {
                    dom.setAttribute(prop, String(value));
                }
            }
        }
    }

    if (children) {
        for (const vchild of children) {
            renderChild(vchild, dom);
        }
    }

    parent.appendChild(dom);
}
