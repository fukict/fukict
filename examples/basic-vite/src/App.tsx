import { Fukict } from '@fukict/basic';

import { Sidebar } from './components/Sidebar';
import { ClassComponentDemo } from './demos/ClassComponentDemo';
import { CompositionDemo } from './demos/CompositionDemo';
import { ContextDemo } from './demos/ContextDemo';
import { EventHandlingDemo } from './demos/EventHandlingDemo';
import { FragmentDemo } from './demos/FragmentDemo';
import { FunctionComponentDemo } from './demos/FunctionComponentDemo';
import { JSXSyntaxDemo } from './demos/JSXSyntaxDemo';
import { LifecycleDemo } from './demos/LifecycleDemo';
import { RefsDemo } from './demos/RefsDemo';
import { SlotsDemo } from './demos/SlotsDemo';
import { SvgElementDemo } from './demos/SvgElement';

export class App extends Fukict {
  state = {
    currentDemo: 'function-component',
  };

  demos = {
    'function-component': FunctionComponentDemo,
    'class-component': ClassComponentDemo,
    'jsx-syntax': JSXSyntaxDemo,
    'event-handling': EventHandlingDemo,
    svg: SvgElementDemo,
    lifecycle: LifecycleDemo,
    refs: RefsDemo,
    slots: SlotsDemo,
    fragment: FragmentDemo,
    composition: CompositionDemo,
    context: ContextDemo,
  };

  handleDemoChange = (demo: string) => {
    this.state = { currentDemo: demo };
    this.update(this.props);
  };

  render() {
    const { currentDemo } = this.state;
    const DemoComponent =
      this.demos[currentDemo as keyof typeof this.demos] ||
      FunctionComponentDemo;

    return (
      <div class="min-h-screen bg-gray-100">
        <Sidebar currentDemo={currentDemo} onSelect={this.handleDemoChange} />

        <main class="ml-64 p-8">
          <div class="mx-auto max-w-4xl">
            <div class="rounded-lg bg-white p-8 shadow-lg">
              <DemoComponent />
            </div>
          </div>
        </main>
      </div>
    );
  }
}
