import { defineWidget, type VNode } from '@fukict/widget';

export const Greeting = defineWidget<{ name: string; color?: string }>(
  ({ name, color = '#646cff' }) => (
    <div class="greeting-example">
      <h2>函数组件: Greeting</h2>
      <p style={`color: ${color}; font-size: 1.2rem;`}>Hello, {name}!</p>
    </div>
  ),
);
