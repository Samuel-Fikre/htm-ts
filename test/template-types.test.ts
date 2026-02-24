import { describe, it, expect } from 'vitest';
import type { ValidateEach } from '../src/index.js';

type AssertTrue<T extends true> = T;

type IsTemplateError<T> = T extends `Error: <${string}> is not a valid HTML element` ? true : false;

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
  ? true
  : false;

// ── Valid templates must resolve to true ──────────────────────────────────────

type ValidSimple = ValidateEach<['<div>', '</div>']>;
export type _ValidSimple = AssertTrue<Equal<ValidSimple, true>>;

type ValidNested = ValidateEach<['<div><span>', '</span></div>']>;
export type _ValidNested = AssertTrue<Equal<ValidNested, true>>;

type ValidSelfClosing = ValidateEach<['<input>', '<br/>', '</input>']>;
export type _ValidSelfClosing = AssertTrue<Equal<ValidSelfClosing, true>>;

// ── Invalid templates must produce an error string ───────────────────────────

type InvalidTag = ValidateEach<['<divv>', '</div>']>;
export type _InvalidTag = AssertTrue<IsTemplateError<InvalidTag>>;

type InvalidNestedTag = ValidateEach<['<div><spna>', '</spna></div>']>;
export type _InvalidNestedTag = AssertTrue<IsTemplateError<InvalidNestedTag>>;

type InvalidMissingName = ValidateEach<['<>', '</>']>;
export type _InvalidMissingName = AssertTrue<IsTemplateError<InvalidMissingName>>;

// Minimal runtime test so Vitest treats this file as a proper suite.
// The real value of this file is in the compile-time checks above.
describe('template type safety (ValidateEach)', () => {
  it('compiles with valid and invalid templates wired to type-level checks', () => {
    // If any of the aliases above stop satisfying their constraints,
    // this file will fail to typecheck and the test run will fail.
    expect(true).toBe(true);
  });
});
