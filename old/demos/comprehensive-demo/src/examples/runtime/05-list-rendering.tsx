import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';

const items = ['React', 'Vue', 'Angular', 'Svelte', 'Fukict'];
const users = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'User' },
  { id: 3, name: 'Charlie', role: 'User' },
];

export default class extends RouteWidget {
  render() {
  return (
    <ExampleLayout
      title="05. 列表渲染"
      description="使用 map 方法渲染动态列表"
    >
      <DemoCard title="简单列表">
        <ul class="space-y-2">
          {items.map(item => (
            <li key={item} class="p-3 bg-gray-100 rounded">
              {item}
            </li>
          ))}
        </ul>
      </DemoCard>

      <DemoCard title="对象列表">
        <div class="space-y-2">
          {users.map(user => (
            <div key={user.id} class="p-4 bg-white border border-gray-200 rounded-lg flex justify-between">
              <div>
                <p class="font-semibold">{user.name}</p>
                <p class="text-sm text-gray-600">ID: {user.id}</p>
              </div>
              <span class={`px-3 py-1 rounded text-sm ${user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </DemoCard>
    </ExampleLayout>
  );
  }
}
