import { Fukict } from '@fukict/basic';
import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * Hello World 示例组件
 */
class HelloFukict extends Fukict {
  render() {
    return <div class="text-gray-700 text-lg font-medium">Hello Fukict!</div>;
  }
}

/**
 * 快速开始页面
 */
export class QuickStartPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* 安装 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">安装</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              使用 npm、pnpm 或 yarn 安装 Fukict 相关包
            </p>
          </div>

          <SplitView leftTitle="安装命令" rightTitle="包说明">
            <CodeBlock
              fukict:slot="code"
              code={`# 安装核心包
npm install @fukict/basic

# 安装路由
npm install @fukict/router

# 安装状态管理
npm install @fukict/flux

# 安装国际化
npm install @fukict/i18n

# 安装 Vite 插件
npm install -D @fukict/vite-plugin`}
            />
            <DemoBox fukict:slot="demo">
              <div class="text-sm text-gray-700 space-y-2">
                <p>
                  <strong class="text-gray-900">@fukict/basic</strong> -
                  核心渲染引擎
                </p>
                <p>
                  <strong class="text-gray-900">@fukict/router</strong> - SPA
                  路由
                </p>
                <p>
                  <strong class="text-gray-900">@fukict/flux</strong> - 状态管理
                </p>
                <p>
                  <strong class="text-gray-900">@fukict/i18n</strong> - 国际化
                </p>
                <p>
                  <strong class="text-gray-900">@fukict/vite-plugin</strong> -
                  Vite 集成
                </p>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* Hello World */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">
              Hello World
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              创建你的第一个 Fukict 应用
            </p>
          </div>

          <SplitView leftTitle="代码示例" rightTitle="运行效果">
            <CodeBlock
              fukict:slot="code"
              code={`import { attach, Fukict } from '@fukict/basic';

class App extends Fukict {
  render() {
    return <div>Hello Fukict!</div>;
  }
}

const root = document.getElementById('app');
if (root) {
  attach(<App />, root);
}`}
            />
            <DemoBox fukict:slot="demo">
              <HelloFukict />
            </DemoBox>
          </SplitView>
        </div>

        {/* 使用 Vite */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">使用 Vite</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              配置 Vite 以支持 JSX 编译
            </p>
          </div>

          <SplitView leftTitle="Vite 配置" rightTitle="配置说明">
            <CodeBlock
              fukict:slot="code"
              code={`// vite.config.ts
import { defineConfig } from 'vite';
import fukict from '@fukict/vite-plugin';

export default defineConfig({
  plugins: [fukict()],
});`}
            />
            <DemoBox fukict:slot="demo">
              <div class="text-sm text-gray-700 space-y-2">
                <p>Vite 插件会自动处理:</p>
                <ul class="list-disc list-inside space-y-1 ml-2">
                  <li>JSX 到 hyperscript 的转换</li>
                  <li>事件处理器优化 (on: 前缀)</li>
                  <li>Children 数组规范化</li>
                  <li>自动导入 hyperscript</li>
                </ul>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 项目结构 */}
        <div class="space-y-4">
          <div>
            <h3 class="text-base font-medium text-gray-800 mb-1">项目结构</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              推荐的项目目录结构
            </p>
          </div>

          <SplitView leftTitle="目录结构" rightTitle="目录说明">
            <CodeBlock
              fukict:slot="code"
              code={`my-fukict-app/
├── src/
│   ├── components/     # 组件目录
│   ├── pages/          # 页面目录
│   ├── routes/         # 路由配置
│   ├── store/          # 状态管理
│   ├── App.tsx         # 根组件
│   └── main.tsx        # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts`}
            />
            <DemoBox fukict:slot="demo">
              <div class="text-sm text-gray-700 space-y-2">
                <p>
                  <strong class="text-gray-900">components/</strong> -
                  可复用组件
                </p>
                <p>
                  <strong class="text-gray-900">pages/</strong> - 页面级组件
                </p>
                <p>
                  <strong class="text-gray-900">routes/</strong> - 路由配置文件
                </p>
                <p>
                  <strong class="text-gray-900">store/</strong> - Flux store
                  定义
                </p>
                <p>
                  <strong class="text-gray-900">App.tsx</strong> - 应用根组件
                </p>
                <p>
                  <strong class="text-gray-900">main.tsx</strong> - 应用入口
                </p>
              </div>
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
