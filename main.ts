import { html, render } from './src/index.js';

const App = () => html`
  <div id="root">
    <h1 style="color: blue;">htype is ALIVE!</h1>
    <p>This was rendered by my custom framework.</p>
    <button onclick="${() => alert('It works!')}">Click Me</button>
  </div>
`;

render(App(), document.body);