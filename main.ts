import { html, render, signal, p } from './src/index.js';

// 1. Define a Signal
const [count, setCount] = signal(0);

// 2. Define a Typed Component
interface DisplayProps {
  value: () => number;
  label: string;
}

const CounterDisplay = ({ value, label }: DisplayProps) => {
  const color = () => value() % 2 === 0 ? '#646cff' : '#ff4646';
  return html`
    <div style=${() => `border: 2px solid ${color()}; padding: 1rem; border-radius: 12px; transition: border 0.3s;`}>
      <h2 style=${() => `margin: 0; color: ${color()};`}>${label}: ${() => value()}</h2>
    </div>
  `;
};

// 3. Main App using "Expression Anchoring"
const App = () => html`
  <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 400px;">
    
    <${CounterDisplay} ${p({ 
      label: "Current Count", 
      value: count 
    })} />

    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <button onclick=${() => setCount(count() + 1)}>Increment</button>
      <button onclick=${() => setCount(count() - 1)}>Decrement</button>
    </div>

    <p>${() => count() > 5 ? "🚀 We're flying now!" : "Keep going..."}</p>
  </div>
`;

render(App(), document.body);