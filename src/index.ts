import { VNode, Child, Component } from './types.js';

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
 * Optimizations:
 * - Iterative flattening (zero recursion) to reduce GC.
 * - Key extraction from props to VNode top level.
 * - Explicitly preserves `0` as a valid child.
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
 * Zero-recursion, strictly typed, and supports the new VNode interface.
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
                const nodeState = current;
                current = current[0];
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
