import { RouteWidget } from '@fukict/router';
import { ExampleLayout, DemoCard } from '../../components/ExampleLayout';
import { Widget } from '@fukict/widget';

interface UserCardProps {
  name: string;
  role: string;
  avatar?: string;
}

class UserCard extends Widget<UserCardProps> {
  render() {
    const { name, role, avatar } = this.props;
    return (
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="flex items-center gap-4">
          <div class={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${avatar ? '' : 'bg-primary-100'}`}>
            {avatar ? <img src={avatar} alt={name} class="w-full h-full rounded-full" /> : name[0]}
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{name}</h3>
            <p class="text-gray-600">{role}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default class extends RouteWidget {
  render() {
    return (
      <ExampleLayout
      title="02. Props 传递"
      description="通过 props 向组件传递数据"
    >
      <DemoCard title="运行效果">
        <div class="space-y-4">
          <UserCard name="Alice" role="Administrator" />
          <UserCard name="Bob" role="Developer" />
          <UserCard name="Charlie" role="Designer" />
        </div>
      </DemoCard>
      </ExampleLayout>
    );
  }
}
