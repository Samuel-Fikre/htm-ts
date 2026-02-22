import { html, render, signal } from './src/index.js';

const [count, setCount] = signal(0);

const App = () => html`
  <div style="padding: 2rem; font-family: sans-serif;">
    <h1 style="color: #646cff;">Count: ${count}</h1>
    <button 
      style="padding: 0.6em 1.2em; font-size: 1em; cursor: pointer; border-radius: 8px; border: 1px solid transparent; background-color: #f9f9f9;"
      onclick="${() => setCount(count() + 1)}"
    >
      Increment
    </button>
  </div>
`;

render(App(), document.body);