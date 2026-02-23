import { html, render, signal } from './src/index.js';

const [count, setCount] = signal(0);

// Reactive Style Signal
const style = () => ({
  color: count() % 2 === 0 ? '#646cff' : '#ff4646',
  fontSize: `${2 + count() / 10}rem`,
  transition: 'all 0.3s ease',
  display: 'block',
  marginBottom: '1rem'
});

const App = () => html`
  <div style="padding: 2rem; font-family: system-ui, sans-serif;">
    <h1 style=${style}>Count: ${count}</h1>
    
    <div style="display: flex; gap: 1rem; align-items: center;">
      <button 
        style="padding: 0.6em 1.2em; font-size: 1em; cursor: pointer; border-radius: 8px; border: 1px solid #ccc;"
        disabled=${() => count() >= 10}
        onclick=${() => setCount(count() + 1)}
      >
        Increment
      </button>
      
      <button
        style="padding: 0.6em 1.2em; font-size: 1em; cursor: pointer; border-radius: 8px; border: 1px solid #ccc;"
        onclick=${() => setCount(count() - 1)}
      >
        Decrement
      </button>
    </div>

    <p style="margin-top: 1rem; color: #666;">
      ${() => count() >= 10 ? 'Maximum reached (10) - Button disabled' : 'Keep clicking!'}
    </p>
  </div>
`;

render(App(), document.body);