interface SidebarProps {
  currentDemo: string;
  onSelect: (demo: string) => void;
}

const demos = [
  { id: 'function-component', label: '函数组件 (defineFukict)' },
  { id: 'class-component', label: '类组件 (Fukict)' },
  { id: 'jsx-syntax', label: 'JSX 语法' },
  { id: 'event-handling', label: '事件处理 (on:)' },
  { id: 'lifecycle', label: '生命周期' },
  { id: 'svg', label: 'SVG' },
  { id: 'refs', label: 'Refs (fukict:ref)' },
  { id: 'slots', label: 'Slots' },
  { id: 'fragment', label: 'Fragment' },
  { id: 'composition', label: '组件组合' },
];

export const Sidebar = ({ currentDemo, onSelect }: SidebarProps) => {
  return (
    <aside class="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-6 overflow-y-auto">
      <h1 class="text-2xl font-bold mb-2">Fukict</h1>
      <p class="text-gray-400 text-sm mb-8">基础功能演示</p>

      <nav>
        <ul class="space-y-2">
          {demos.map(demo => (
            <li key={demo.id}>
              <button
                on:click={() => onSelect(demo.id)}
                class={`w-full text-left px-4 py-2 rounded transition-colors ${
                  currentDemo === demo.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                {demo.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div class="mt-8 pt-8 border-t border-gray-700">
        <h3 class="text-sm font-semibold text-gray-400 mb-2">关于</h3>
        <p class="text-xs text-gray-500">
          这个演示展示了 Fukict 框架的核心功能和设计理念。
        </p>
      </div>
    </aside>
  );
};
