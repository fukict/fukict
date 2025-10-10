interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: any;
  onClick?: () => void;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      on:click={onClick}
      class={`rounded transition-colors ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </button>
  );
};

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title: string;
  children?: any;
}

const Alert = ({ type = 'info', title, children }: AlertProps) => {
  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-700',
      icon: 'ℹ️',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-700',
      icon: '✅',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      text: 'text-yellow-700',
      icon: '⚠️',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-700',
      icon: '❌',
    },
  };

  const style = typeStyles[type];

  return (
    <div class={`${style.bg} border-l-4 ${style.border} p-4 rounded`}>
      <div class="flex items-start gap-3">
        <span class="text-2xl">{style.icon}</span>
        <div class="flex-1">
          <h4 class={`font-semibold ${style.text} mb-1`}>{title}</h4>
          {children && <div class="text-sm text-gray-700">{children}</div>}
        </div>
      </div>
    </div>
  );
};

export const CompositionDemo = () => {
  const handleButtonClick = (action: string) => {
    alert(`执行了: ${action}`);
  };

  return (
    <div>
      <h2 class="text-3xl font-bold mb-4">组件组合</h2>

      <div class="bg-violet-50 border-l-4 border-violet-500 p-4 mb-6">
        <p class="text-sm text-gray-700">
          <strong>组件组合：</strong>
          通过组合小的、专注的组件来构建复杂的用户界面
        </p>
      </div>

      <div class="space-y-6">
        {/* Button 组件 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">1. Button 组件</h3>
          <div class="space-y-3">
            <div class="flex gap-2">
              <Button onClick={() => handleButtonClick('主要按钮')}>
                主要按钮
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleButtonClick('次要按钮')}
              >
                次要按钮
              </Button>
              <Button
                variant="danger"
                onClick={() => handleButtonClick('危险按钮')}
              >
                危险按钮
              </Button>
            </div>
            <div class="flex gap-2 items-center">
              <Button size="sm" onClick={() => handleButtonClick('小按钮')}>
                小按钮
              </Button>
              <Button size="md" onClick={() => handleButtonClick('中按钮')}>
                中按钮
              </Button>
              <Button size="lg" onClick={() => handleButtonClick('大按钮')}>
                大按钮
              </Button>
            </div>
          </div>
          <pre class="mt-4 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<Button variant="primary" size="md">
  主要按钮
</Button>`}</code>
          </pre>
        </div>

        {/* Alert 组件 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">2. Alert 组件</h3>
          <div class="space-y-3">
            <Alert type="info" title="提示信息">
              这是一条普通的提示信息，用于向用户展示一般性的内容。
            </Alert>
            <Alert type="success" title="操作成功">
              你的操作已成功完成！数据已保存。
            </Alert>
            <Alert type="warning" title="警告">
              请注意，此操作可能会影响其他功能。
            </Alert>
            <Alert type="error" title="错误">
              操作失败，请检查输入并重试。
            </Alert>
          </div>
          <pre class="mt-4 bg-gray-900 text-gray-100 p-3 rounded text-sm overflow-x-auto">
            <code>{`<Alert type="success" title="操作成功">
  你的操作已成功完成！
</Alert>`}</code>
          </pre>
        </div>

        {/* 组合使用 */}
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-semibold mb-4">3. 组合使用</h3>
          <Alert type="info" title="确认操作">
            <p class="mb-3">你确定要执行此操作吗？此操作不可撤销。</p>
            <div class="flex gap-2">
              <Button size="sm" onClick={() => handleButtonClick('确认')}>
                确认
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleButtonClick('取消')}
              >
                取消
              </Button>
            </div>
          </Alert>
        </div>
      </div>

      <div class="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <pre class="text-sm">
          <code>{`// 定义小组件
const Button = ({ variant, children, onClick }) => {
  return (
    <button on:click={onClick} class={getClass(variant)}>
      {children}
    </button>
  );
};

const Alert = ({ type, title, children }) => {
  return (
    <div class={getStyle(type)}>
      <h4>{title}</h4>
      {children}
    </div>
  );
};

// 组合使用
<Alert type="info" title="确认">
  <p>确定要删除吗？</p>
  <Button onClick={handleDelete}>确认</Button>
  <Button variant="secondary">取消</Button>
</Alert>`}</code>
        </pre>
      </div>
    </div>
  );
};
