# htm-ts


`htm-ts` is a **Surgically Reactive UI Runtime** that brings JSX-like ergonomics to plain JavaScript using Tagged Templates.

It is a modern, strongly-typed fork of [developit/htm](https://github.com/developit/htm), replacing the Virtual DOM approach with a **Fine-Grained Reactive Engine** powered by Signals.

---

## ⚖️ How it Compares: `htm` vs. `htm-ts`

| Feature | Original `htm` | **htm-ts** |
| :--- | :--- | :--- |
| **Primary Output** | Static VNode Objects | Reactive DOM Instructions |
| **Reactivity** | External (React/Preact) | **Built-in Signals & Effects** |
| **Update Strategy** | VDOM Diffing (Top-down) | **Surgical (Direct DOM updates)** |
| **Performance** | O(VNodes) | **O(Changes)** |
| **Build Step** | Optional | **Zero (Native ESM)** |
| **Size** | ~600b (Parser only) | **~2.6KB (Full Runtime)** |

---

## ✅ What Accomplished

1. **Surgical Reactivity**  
    Built a runtime where a Signal change bypasses the "Component Function." If a `count` signal updates, `htm-ts` targets the exact text node or attribute in the DOM. No reconciliation, no diffing.

2. **The 2.6KB Runtime**  
    Packed a full HTML parser, a Signal system, an Effect tracker, and a DOM renderer into a package

3. **The Type-Safe Chassis**  
    Implemented a tail-recursive type-level parser. It ensures that your template structure is valid and that your Signal-to-Attribute bindings are typed.

4. **Zero-Tooling DX**  
    No Babel, no Vite plugins, no decorators. It runs natively in any modern browser using standard ES Modules.

---

## ⚠️ What it is NOT 

* **It is NOT a Compiler:** `htm-ts` parses templates at runtime. This allows for zero-build usage but means we don't have a "pre-compile" step to optimize the strings.
* **It is NOT an IDE Plugin:** due to TypeScript's current limitation with Tagged Template hole-inference, your IDE will not show red squiggles for a typo like `<divv>` *inside* a template that contains variables.
* **It is NOT a Framework:** `htm-ts` is just a focused, high-performance UI primitive.

---

## 🛠 Usage

```javascript
import { html, render, signal } from 'htm-ts';

const [count, setCount] = signal(0);

// The component runs ONCE. The signals update the DOM surgically.
const App = () => html`
  <div class="app">
    <h1 style=${() => ({ color: count() % 2 ? 'red' : 'blue' })}>
      Count: ${count}
    </h1>
    <button onclick=${() => setCount(count() + 1)}>Increment</button>
  </div>
`;

render(App(), document.body);
```

---


## 🏁 Installation

```bash
pnpm add htm-ts
```

Or using npm:

```bash
npm install htm-ts
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Samuel-Fikre/htm-ts?file=index.html,main.ts)