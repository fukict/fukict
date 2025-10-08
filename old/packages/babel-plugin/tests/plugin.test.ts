import { transform } from '@babel/core';

import { describe, expect, it } from 'vitest';

import fukictBabelPlugin from '../src/index.js';

function transformCode(code: string, options = {}) {
  const result = transform(code, {
    plugins: [['@babel/plugin-syntax-jsx'], [fukictBabelPlugin, options]],
    parserOpts: {
      plugins: ['jsx'],
    },
  });
  return result?.code || '';
}

describe('@fukict/babel-plugin', () => {
  it('should transform simple JSX element', () => {
    const input = '<div>Hello World</div>';
    const output = transformCode(input);

    expect(output).toContain('hyperscript("div", null, null, "Hello World")');
    expect(output).toContain(
      'import { hyperscript, Fragment } from "@fukict/runtime"',
    );
  });

  it('should transform JSX element with props', () => {
    const input = '<div className="test" id="myDiv">Content</div>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", {\n  "className": "test",\n  "id": "myDiv"\n}, null, "Content")',
    );
  });

  it('should transform JSX element with boolean props', () => {
    const input = '<input disabled required />';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("input", {\n  "disabled": true,\n  "required": true\n}, null)',
    );
  });

  it('should transform JSX element with expression props', () => {
    const input = '<div onClick={handleClick} count={count}>Text</div>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", {\n  "onClick": handleClick,\n  "count": count\n}, null, "Text")',
    );
  });

  it('should transform custom component', () => {
    const input = '<MyComponent prop="value">Child</MyComponent>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript(MyComponent, {\n  "prop": "value"\n}, null, "Child")',
    );
  });

  it('should transform nested JSX elements', () => {
    const input = `
      <div>
        <span>Child 1</span>
        <span>Child 2</span>
      </div>
    `;
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", null, null, hyperscript("span", null, null, "Child 1"), hyperscript("span", null, null, "Child 2"))',
    );
  });

  it('should transform JSX Fragment', () => {
    const input = '<>Fragment content</>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript(Fragment, null, null, "Fragment content")',
    );
  });

  it('should transform JSX Fragment with multiple children', () => {
    const input = `
      <>
        <div>First</div>
        <div>Second</div>
      </>
    `;
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript(Fragment, null, null, hyperscript("div", null, null, "First"), hyperscript("div", null, null, "Second"))',
    );
  });

  it('should handle spread attributes', () => {
    const input = '<div {...props} className="extra">Content</div>';
    const output = transformCode(input);

    expect(output).toContain('...props');
    expect(output).toContain('"className": "extra"');
  });

  it('should use custom import source', () => {
    const input = '<div>Test</div>';
    const output = transformCode(input, { importSource: '@my/custom-jsx' });

    expect(output).toContain(
      'import { hyperscript, Fragment } from "@my/custom-jsx"',
    );
  });

  it('should handle mixed text and JSX children', () => {
    const input = '<div>Text <strong>bold</strong> more text</div>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", null, null, "Text", hyperscript("strong", null, null, "bold"), "more text")',
    );
  });

  it('should handle JSX expressions in children', () => {
    const input = '<div>{variable} and {expression + 1}</div>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", null, null, variable, "and", expression + 1)',
    );
  });

  // New tests for on: event syntax
  it('should transform on: event syntax', () => {
    const input =
      '<button on:click={handleClick} className="btn">Click me</button>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("button", {\n  "className": "btn"\n}, {\n  "click": handleClick\n}, "Click me")',
    );
  });

  it('should separate multiple events from props', () => {
    const input =
      '<input type="text" on:focus={handleFocus} on:blur={handleBlur} value={inputValue} />';
    const output = transformCode(input);

    expect(output).toContain('"type": "text"');
    expect(output).toContain('"value": inputValue');
    expect(output).toContain('"focus": handleFocus');
    expect(output).toContain('"blur": handleBlur');
  });

  it('should handle elements with only events', () => {
    const input = '<button on:click={handleClick}>Click only</button>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("button", null, {\n  "click": handleClick\n}, "Click only")',
    );
  });

  it('should handle elements without events', () => {
    const input = '<div className="no-events">Just a div</div>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript("div", {\n  "className": "no-events"\n}, null, "Just a div")',
    );
  });

  it('should handle custom components with events', () => {
    const input =
      '<MyComponent prop1="value1" on:customEvent={handleCustom}>Children</MyComponent>';
    const output = transformCode(input);

    expect(output).toContain(
      'hyperscript(MyComponent, {\n  "prop1": "value1"\n}, {\n  "customEvent": handleCustom\n}, "Children")',
    );
  });
});
