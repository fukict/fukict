// 测试不同类型的JSX元素和事件处理

// 1. 简单按钮，带事件处理
const button1 = (
  <button on:click={() => console.log('Button 1 clicked')}>点击我</button>
);

// 2. 带多个属性和事件的元素
const button2 = (
  <button
    className="btn primary"
    id="btn-2"
    on:click={handleClick}
    on:mouseover={() => console.log('hover')}
    disabled={false}
  >
    多事件按钮
  </button>
);

// 3. 复杂嵌套结构
const form = (
  <div className="form-container">
    <h1>表单测试</h1>
    <form on:submit={handleSubmit}>
      <input
        type="text"
        placeholder="输入文本"
        on:change={handleInputChange}
        on:focus={() => console.log('focused')}
      />
      <button type="submit" on:click={handleSubmit}>
        提交
      </button>
    </form>
  </div>
);

// 4. Fragment 测试
const fragment = (
  <>
    <span>Fragment item 1</span>
    <span on:click={() => alert('Fragment clicked')}>Fragment item 2</span>
  </>
);

// 5. 组件测试
function MyComponent(props) {
  return <div on:click={props.onClick}>组件内容: {props.children}</div>;
}

const component = (
  <MyComponent onClick={() => console.log('Component clicked')}>
    <span>子内容</span>
  </MyComponent>
);

// 导出所有测试用例
export { button1, button2, form, fragment, component };
