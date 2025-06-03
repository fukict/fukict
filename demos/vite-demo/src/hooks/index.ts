// 简单的状态管理 hook
export function useState<T>(
  initialValue: T,
): [() => T, (value: T | ((prev: T) => T)) => void] {
  let state = initialValue;
  const listeners: (() => void)[] = [];

  const getState = () => state;

  const setState = (value: T | ((prev: T) => T)) => {
    const newValue =
      typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
    if (newValue !== state) {
      state = newValue;
      // 通知所有监听器
      listeners.forEach(listener => listener());
    }
  };

  // 在实际应用中，这里会处理组件重新渲染
  // 为了演示目的，我们简化了处理
  return [getState, setState];
}
