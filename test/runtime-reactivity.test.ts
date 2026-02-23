import { describe, it, expect } from 'vitest';
import { html, render, signal } from '../src/index.js';

// Basic runtime test that mirrors the README example
// and validates the "surgical" reactivity story at a high level.

describe('htm-ts runtime reactivity', () => {
  it('binds signals to text and style and updates surgically', () => {
    const [count, setCount] = signal(0);

    const App = () => html`
      <div class="app">
        <h1 style=${() => ({ color: count() % 2 ? 'red' : 'blue' })}>
          Count is: ${count}
        </h1>
        <button onclick=${() => setCount(count() + 1)}>
          Increment
        </button>
      </div>
    `;

    const root = document.createElement('div');
    render(App(), root);

    const h1 = root.querySelector('h1') as HTMLElement | null;
    const button = root.querySelector('button') as HTMLButtonElement | null;

    expect(h1).not.toBeNull();
    expect(button).not.toBeNull();

    // Initial render assertions
    expect(h1!.textContent).toContain('Count is: 0');
    expect(h1!.style.color).toBe('blue');

    // Trigger the click handler, which should increment the signal
    button!.click();

    // After one increment, only the bound parts should change
    expect(h1!.textContent).toContain('Count is: 1');
    expect(h1!.style.color).toBe('red');
  });
});
