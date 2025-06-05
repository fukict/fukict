import { Widget, createWidget } from '@vanilla-dom/widget';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  initialTodos?: TodoItem[];
}

// 单个 Todo 项 - 简易函数组件（UI 略微复杂但需要重复渲染）
const TodoItemWidget = createWidget((props: {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onHighlight: (id: string) => void;
}) => (
  <li 
    className={`todo-item ${props.item.completed ? 'completed' : ''}`}
    data-id={props.item.id}
  >
    <div className="todo-content">
      <input
        type="checkbox"
        className="todo-checkbox"
        checked={props.item.completed}
        on:change={() => props.onToggle(props.item.id)}
      />
      <span className="todo-text">{props.item.text}</span>
    </div>
    <div className="todo-actions">
      <button 
        className="btn btn-highlight"
        on:click={() => props.onHighlight(props.item.id)}
      >
        高亮
      </button>
      <button 
        className="btn btn-delete"
        on:click={() => props.onDelete(props.item.id)}
      >
        删除
      </button>
    </div>
  </li>
));

// TodoList 主组件 - 高阶基类（单个复杂组件封装）
export class TodoList extends Widget<TodoListProps> {
  private todos: TodoItem[];

  constructor(props: TodoListProps) {
    super(props);
    this.todos = props.initialTodos || [
      { id: '1', text: '学习 Vanilla DOM', completed: true },
      { id: '2', text: '构建 Widget Demo', completed: false },
      { id: '3', text: '编写文档', completed: false }
    ];
  }

  render() {
    return (
      <div className="todo-example">
        <h3>📝 Todo List</h3>
        <div className="todo-stats">
          <span>
            总计: <span className="todo-total">{this.todos.length.toString()}</span>
          </span>
          <span>
            已完成: <span className="todo-completed">{this.todos.filter(item => item.completed).length.toString()}</span>
          </span>
        </div>
        <div className="todo-add">
          <input 
            type="text" 
            className="todo-input" 
            placeholder="添加新任务..."
            on:keypress={this.handleKeyPress.bind(this)}
          />
          <button className="btn btn-add" on:click={this.handleAddTodo.bind(this)}>
            添加
          </button>
        </div>
        <ul className="todo-items" id="todo-items-container">
          {/* Todo 项将通过 DOM 操作动态渲染 */}
        </ul>
      </div>
    );
  }

  // 组件挂载后，初始化 Todo 项
  mount(container: Element): void {
    super.mount(container);
    this.renderTodoItems();
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleAddTodo();
    }
  }

  private handleAddTodo() {
    const input = this.$('.todo-input');
    if (input) {
      const value = input.get('value') as string;
      if (value && value.trim()) {
        const newTodo: TodoItem = {
          id: Date.now().toString(),
          text: value.trim(),
          completed: false
        };
        this.todos.push(newTodo);
        input.set('value', '');
        console.log('Added todo:', newTodo);
        
        this.updateStats();
        this.renderTodoItems();
      }
    }
  }

  private handleToggleTodo(id: string) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      console.log('Toggled todo:', id);
      
      this.updateStats();
      this.renderTodoItems();
    }
  }

  private handleDeleteTodo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    console.log('Deleted todo:', id);
    
    this.updateStats();
    this.renderTodoItems();
  }

  private handleHighlightTodo(id: string) {
    console.log('高亮:', id);
    
    // 使用 Widget 的 DOM 查询 API 进行高亮操作
    const todoItem = this.$(`[data-id="${id}"]`);
    if (todoItem) {
      const currentClass = todoItem.get('className') as string;
      todoItem.set('className', currentClass + ' highlight');
      
      // 2秒后移除高亮
      setTimeout(() => {
        todoItem.set('className', currentClass);
      }, 2000);
    }
  }

  private updateStats() {
    const totalSpan = this.$('.todo-total');
    const completedSpan = this.$('.todo-completed');
    
    if (totalSpan) {
      totalSpan.set('textContent', this.todos.length.toString());
    }
    if (completedSpan) {
      completedSpan.set('textContent', this.todos.filter(item => item.completed).length.toString());
    }
  }

  private renderTodoItems() {
    const container = this.$('#todo-items-container');
    if (container) {
      // 清空容器
      container.set('innerHTML', '');
      
      // 为每个 todo 创建简易函数组件实例
      this.todos.forEach(todo => {
        const todoWidget = TodoItemWidget({
          item: todo,
          onToggle: this.handleToggleTodo.bind(this),
          onDelete: this.handleDeleteTodo.bind(this),
          onHighlight: this.handleHighlightTodo.bind(this)
        });
        
        // 挂载到容器中
        const tempDiv = document.createElement('div');
        todoWidget.mount(tempDiv);
        if (tempDiv.firstElementChild) {
          container.element?.appendChild(tempDiv.firstElementChild);
        }
      });
    }
  }

  // 添加高亮所有完成项的方法
  highlightCompletedItems() {
    const completedItems = this.$$('.todo-item.completed');
    completedItems.batchSet('className', (el, attr, value) => 
      value + ' highlight'
    );
  }

  // 清除所有高亮
  clearAllHighlights() {
    const items = this.$$('.todo-item');
    items.batchSet('className', (el, attr, value) => 
      value.replace(' highlight', '')
    );
  }
} 