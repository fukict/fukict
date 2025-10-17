import { transformSync } from '@babel/core';

import { strict as assert } from 'node:assert';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Helper to transform code with babel-preset
 */
function transform(code, options = {}) {
  const result = transformSync(code, {
    presets: [[join(__dirname, '../dist/index.js'), options]],
    filename: 'test.tsx',
    configFile: false,
    babelrc: false,
  });
  return result.code;
}

describe('JSX Transform', () => {
  test('transforms simple element', () => {
    const input = `const el = <div>Hello</div>;`;
    const output = transform(input);

    assert.ok(output.includes('hyperscript'));
    assert.ok(output.includes('"div"'));
    assert.ok(output.includes('Hello'));
    // __type__ is now set at runtime by hyperscript, not at compile time
  });

  test('transforms element with props', () => {
    const input = `const el = <div class="container" id="main">Content</div>;`;
    const output = transform(input);

    assert.ok(output.includes('"class": "container"'));
    assert.ok(output.includes('"id": "main"'));
    assert.ok(output.includes('Content'));
  });

  test('transforms className to class', () => {
    const input = `const el = <div className="box">Test</div>;`;
    const output = transform(input);

    assert.ok(output.includes('class: "box"'));
    assert.ok(!output.includes('className'));
  });

  test('transforms event handlers', () => {
    const input = `const el = <button on:click={handleClick}>Click</button>;`;
    const output = transform(input);

    assert.ok(output.includes('"on:click": handleClick'));
  });

  test('transforms nested elements', () => {
    const input = `
      const el = (
        <div>
          <span>Nested</span>
        </div>
      );
    `;
    const output = transform(input);

    assert.ok(output.includes('hyperscript("div"'));
    assert.ok(output.includes('hyperscript("span"'));
  });

  test('transforms Fragment', () => {
    const input = `
      const el = (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      );
    `;
    const output = transform(input);

    assert.ok(output.includes('Fragment'));
    // __type__ is set at runtime
  });

  test('transforms children expressions', () => {
    const input = `const el = <div>{count}</div>;`;
    const output = transform(input);

    assert.ok(output.includes('count'));
  });

  test('transforms spread props', () => {
    const input = `const el = <div {...props}>Test</div>;`;
    const output = transform(input);

    assert.ok(output.includes('...props'));
  });
});

describe('Auto defineFukict', () => {
  test('wraps arrow function component', () => {
    const input = `const Greeting = ({ name }) => <div>Hello {name}</div>;`;
    const output = transform(input);

    assert.ok(output.includes('defineFukict'));
    assert.ok(output.includes('import { defineFukict'));
  });

  test('wraps function expression component', () => {
    const input = `const Button = function({ text }) { return <button>{text}</button>; };`;
    const output = transform(input);

    assert.ok(output.includes('defineFukict'));
  });

  test('does not wrap lowercase function', () => {
    const input = `const helper = () => <div>test</div>;`;
    const output = transform(input);

    assert.ok(!output.includes('defineFukict'));
  });

  test('does not wrap already wrapped component', () => {
    const input = `
      import { defineFukict } from '@fukict/basic';
      const Greeting = defineFukict(() => <div>Hello</div>);
    `;
    const output = transform(input);

    // Should only have one defineFukict call
    const matches = output.match(/defineFukict/g);
    assert.strictEqual(matches.length, 1);
  });

  test('wraps exported default component', () => {
    const input = `export default ({ name }) => <div>Hello {name}</div>;`;
    const output = transform(input);

    assert.ok(output.includes('defineFukict'));
    assert.ok(output.includes('export default'));
  });

  test('skips @nofukict marked function', () => {
    const input = `
      /** @nofukict */
      const Helper = () => <div>test</div>;
    `;
    const output = transform(input);

    assert.ok(!output.includes('defineFukict'));
  });
});

describe('Component __type__ optimization', () => {
  test('no compile-time __type__ for elements', () => {
    const input = `const el = <div>Test</div>;`;
    const output = transform(input);

    // __type__ is set at runtime by hyperscript
    assert.ok(output.includes('hyperscript'));
    assert.ok(!output.includes('__type__'));
  });

  test('no compile-time __type__ for Fragment', () => {
    const input = `const el = <><div>Test</div></>;`;
    const output = transform(input);

    // __type__ is set at runtime by hyperscript
    assert.ok(output.includes('hyperscript'));
    assert.ok(!output.includes('__type__'));
  });

  test('no compile-time __type__ for components', () => {
    const input = `
      const Greeting = ({ name }) => <div>Hello {name}</div>;
      const App = () => <Greeting name="World" />;
    `;
    const output = transform(input);

    // __type__ is set at runtime by hyperscript
    assert.ok(output.includes('hyperscript'));
    assert.ok(!output.includes('__type__'));
  });
});

describe('displayName injection (development mode)', () => {
  test('injects displayName in development mode', () => {
    const input = `const Greeting = ({ name }) => <div>Hello {name}</div>;`;
    const output = transform(input, { development: true });

    assert.ok(output.includes('displayName'));
    assert.ok(output.includes('"Greeting"'));
  });

  test('does not inject displayName in production mode', () => {
    const input = `const Greeting = ({ name }) => <div>Hello {name}</div>;`;
    const output = transform(input, { development: false });

    assert.ok(!output.includes('displayName'));
  });

  test('injects displayName for exported default', () => {
    const input = `export default ({ name }) => <div>Hello {name}</div>;`;
    const output = transform(input, { development: true });

    assert.ok(output.includes('displayName'));
  });
});

describe('Integration tests', () => {
  test('complete component transformation', () => {
    const input = `
      const Greeting = ({ name }) => (
        <div class="greeting">
          <h1>Hello {name}!</h1>
          <button on:click={handleClick}>Click me</button>
        </div>
      );
    `;
    const output = transform(input, { development: true });

    // Should have all features
    assert.ok(output.includes('defineFukict'));
    assert.ok(output.includes('displayName'));
    assert.ok(output.includes('hyperscript'));
    assert.ok(output.includes('"on:click"'));
    // __type__ is set at runtime
  });

  test('nested components', () => {
    const input = `
      const Button = ({ children }) => <button>{children}</button>;
      const App = () => (
        <div>
          <Button>Click</Button>
        </div>
      );
    `;
    const output = transform(input);

    // __type__ is set at runtime
    assert.ok(output.includes('hyperscript'));
  });
});
