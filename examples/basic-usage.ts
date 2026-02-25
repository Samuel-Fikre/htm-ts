/**
 * Basic Usage Example
 * 
 * This example demonstrates:
 * - Signal-based reactive state
 * - Surgical DOM updates (Solid.js style)
 * - Type-safe component props via p() helper
 * - Component functions that run ONCE, not on every update
 */

import { html, render, signal, p } from '../src/index.js';

// ==========================================
// 1. Reactive State with Signals
// ==========================================

// Create a reactive signal - returns [getter, setter]
const [count, setCount] = signal(0);
const [name, setName] = signal('World');

// ==========================================
// 2. Components (Run ONCE, update surgically)
// ==========================================

/**
 * CounterDisplay Component
 * 
 * IMPORTANT: This function runs ONCE during initial render.
 * The signal `value` is reactive - when it changes, only the
 * specific text nodes update, not the entire component.
 */
interface DisplayProps {
    label: string;
    value: () => number;
}

const CounterDisplay = ({ label, value }: DisplayProps) => {
    // This function body executes only once during setup
    console.log('CounterDisplay rendered (this logs ONCE)');

    return html`
        <div style="border: 2px solid #646cff; padding: 1rem; margin: 1rem 0; border-radius: 8px;">
            <h3 style="margin: 0 0 0.5rem 0; color: #646cff;">${label}</h3>
            <!-- 
                The ${value} expression creates a reactive binding.
                When the signal updates, ONLY this text node changes.
                No VDOM diff, no component re-render.
            -->
            <p style="font-size: 2rem; margin: 0; font-weight: bold;">
                Count: ${value}
            </p>
        </div>
    `;
};

/**
 * Greeting Component
 * Demonstrates reactive text updates
 */
interface GreetingProps {
    name: () => string;
}

const Greeting = ({ name }: GreetingProps) => html`
    <h1 style="color: #333; font-family: system-ui;">
        <!-- Only this text node updates when name() changes -->
        Hello, ${name}!
    </h1>
`;

// ==========================================
// 3. Main App Component
// ==========================================

const App = () => html`
    <div style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto;">
        
        <!-- Greeting with reactive name -->
        <${Greeting} ${p({ name })} />
        
        <!-- Counter Display with reactive count -->
        <${CounterDisplay} ${p({ 
            label: 'Current Count', 
            value: count 
        })} />
        
        <!-- Control buttons -->
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <button 
                onclick=${() => setCount(count() + 1)}
                style="padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer;"
            >
                + Increment
            </button>
            <button 
                onclick=${() => setCount(count() - 1)}
                style="padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer;"
            >
                - Decrement
            </button>
            <button 
                onclick=${() => setCount(0)}
                style="padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer;"
            >
                Reset
            </button>
        </div>
        
        <!-- Dynamic conditional message (reactive) -->
        <p style="margin-top: 1.5rem; color: #666; font-style: italic;">
            ${() => count() > 10 ? "🚀 That's a big number!" : count() < 0 ? "📉 Going negative!" : "Keep clicking..."}
        </p>
        
        <!-- Color indicator based on even/odd (reactive style) -->
        <div style=${() => `
            margin-top: 1rem;
            padding: 0.5rem;
            border-radius: 4px;
            background: ${count() % 2 === 0 ? '#e8f5e9' : '#ffebee'};
            color: ${count() % 2 === 0 ? '#2e7d32' : '#c62828'};
        `}>
            ${() => count() % 2 === 0 ? '✅ Even number' : '🔴 Odd number'}
        </div>
    </div>
`;

// ==========================================
// 4. Mount to DOM
// ==========================================

// Render the app to the document body
render(App(), document.body);

// Log to console to show the surgical update model
console.log('App mounted! Open the browser console and click buttons.');
console.log('Notice: Components only log "rendered" ONCE, but DOM updates continuously.');
