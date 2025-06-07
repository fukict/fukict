// Counter 组件 - 使用直接 DOM 操作进行状态更新

export function Counter() {
  // 状态存储在模块作用域，跨渲染保持
  let count = (window as any).__counterState__ || 0;
  
  const updateState = (newCount: number) => {
    count = newCount;
    (window as any).__counterState__ = count;
    
    // 直接更新 DOM 元素
    const countDisplay = document.querySelector('.count-value');
    const statusEl = document.querySelector('.counter-info small');
    
    if (countDisplay) {
      countDisplay.textContent = count.toString();
    }
    
    if (statusEl) {
      let statusMessage = "";
      if (count === 0) {
        statusMessage = "计数器已重置";
      } else if (count > 0) {
        statusMessage = `已增加 ${count} 次`;
      } else {
        statusMessage = `已减少 ${Math.abs(count)} 次`;
      }
      statusEl.textContent = statusMessage;
    }
  };

  const increment = () => updateState(count + 1);
  const decrement = () => updateState(count - 1);
  const reset = () => updateState(0);

  // 生成状态信息
  let statusMessage = "";
  if (count === 0) {
    statusMessage = "计数器已重置";
  } else if (count > 0) {
    statusMessage = `已增加 ${count} 次`;
  } else {
    statusMessage = `已减少 ${Math.abs(count)} 次`;
  }

  return (
    <div className="demo-section">
      <h3 className="demo-title">计数器组件演示</h3>
      <p>这个组件展示了状态管理和事件处理:</p>
      
      <div className="counter-display">
        <span className="count-label">当前计数: </span>
        <span className="count-value">{count}</span>
      </div>
      
      <div className="counter-buttons">
        <button className="btn btn-primary" on:click={increment}>
          增加 (+1)
        </button>
        <button className="btn btn-secondary" on:click={decrement}>
          减少 (-1)
        </button>
        <button className="btn btn-tertiary" on:click={reset}>
          重置 (0)
        </button>
      </div>
      
      <div className="counter-info">
        <small>{statusMessage}</small>
      </div>
    </div>
  );
}
