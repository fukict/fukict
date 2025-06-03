// 测试TypeScript + JSX的转换

interface ButtonProps {
  onClick: () => void;
  children: any;
}

function handleClick() {
  console.log('TypeScript button clicked');
}

// 1. TypeScript + 事件处理
const tsButton = (
  <button on:click={handleClick} className="ts-btn">
    TypeScript Button
  </button>
);

// 2. 带类型的组件
const TypedComponent = (props: ButtonProps) => {
  return <div on:click={props.onClick}>Typed Component: {props.children}</div>;
};

const tsComponent = (
  <TypedComponent onClick={() => console.log('Typed component clicked')}>
    <span>TypeScript Content</span>
  </TypedComponent>
);

// 3. 复杂TypeScript结构
interface FormData {
  value: string;
}

const tsForm = (
  <form on:submit={(e: Event) => e.preventDefault()}>
    <input
      type="text"
      on:change={(e: Event) =>
        console.log((e.target as HTMLInputElement).value)
      }
      placeholder="TypeScript input"
    />
    <button type="submit" on:click={handleClick}>
      Submit TS
    </button>
  </form>
);

export { tsButton, tsComponent, tsForm };
