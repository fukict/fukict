export function Counter() {
  const showAlert = (message: string) => {
    alert(`计数器: ${message}`);
  };

  return (
    <div className="demo-section">
      <h3 className="demo-title">按钮组件演示</h3>
      <p>这个组件展示了事件处理和参数传递:</p>
      <div>
        <button className="btn" on:click={() => showAlert('增加按钮被点击')}>
          增加
        </button>
        <button className="btn" on:click={() => showAlert('减少按钮被点击')}>
          减少
        </button>
        <button className="btn" on:click={() => showAlert('重置按钮被点击')}>
          重置
        </button>
      </div>
    </div>
  );
}

console.log('Counter', <div on:click={() => alert('123')}>123</div>);
