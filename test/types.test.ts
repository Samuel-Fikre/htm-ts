import { describe, it, expectTypeOf } from 'vitest';
import { html, p } from '../src/index.js';

describe('Component Prop Validation', () => {
  interface UserProps {
    name: string;
    age: number;
  }
  
  const UserProfile = (props: UserProps) => html`<div>${props.name}</div>`;

  it('enforces props via the p() helper', () => {
    const result = html`<${UserProfile} ${p({ name: "Samuel", age: 23 })} />`;
    
    expectTypeOf(result).not.toBeAny();
  });
});