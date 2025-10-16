import { RouteComponent } from '@fukict/router';

import { CodeBlock } from '../../components/CodeBlock';
import { DemoBox } from '../../components/DemoBox';
import { SplitView } from '../../components/SplitView';

/**
 * 安装配置页面
 */
export class InstallationPage extends RouteComponent {
  render() {
    return (
      <div class="space-y-12">
        {/* TypeScript 配置 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">
              TypeScript 配置
            </h3>
            <p class="text-sm leading-relaxed text-gray-600">
              配置 tsconfig.json 以支持 JSX
            </p>
          </div>

          <SplitView leftTitle="tsconfig.json" rightTitle="配置说明">
            <CodeBlock
              fukict:slot="code"
              code={`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "@fukict/basic",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p>
                  <strong class="text-gray-900">jsx: "preserve"</strong>
                </p>
                <p class="ml-3">保持 JSX 语法,让 Vite 插件处理</p>
                <p>
                  <strong class="mt-2 text-gray-900">jsxImportSource</strong>
                </p>
                <p class="ml-3">指定 JSX 运行时来源为 @fukict/basic</p>
                <p>
                  <strong class="mt-2 text-gray-900">strict: true</strong>
                </p>
                <p class="ml-3">启用严格类型检查(推荐)</p>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* Babel 配置 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">Babel 配置</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              如果不使用 Vite,可以配置 Babel 来编译 JSX
            </p>
          </div>

          <SplitView leftTitle="babel.config.js" rightTitle="配置说明">
            <CodeBlock
              fukict:slot="code"
              code={`// babel.config.js
module.exports = {
  presets: [
    '@fukict/babel-preset'
  ]
};

// 或者使用选项
module.exports = {
  presets: [
    ['@fukict/babel-preset', {
      // 配置选项
    }]
  ]
};`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p>@fukict/babel-preset 提供:</p>
                <ul class="ml-2 list-inside list-disc space-y-1">
                  <li>JSX 到 hyperscript 转换</li>
                  <li>事件处理器分离 (on: 前缀)</li>
                  <li>Children 数组化</li>
                  <li>自动导入优化</li>
                </ul>
                <p class="mt-3 text-gray-600">适用于 Webpack 或其他构建工具</p>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 环境要求 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">环境要求</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              运行 Fukict 所需的最低环境要求
            </p>
          </div>

          <SplitView leftTitle="最低要求" rightTitle="推荐配置">
            <CodeBlock
              fukict:slot="code"
              code={`# Node.js
Node.js >= 16.0

# 浏览器
支持 ES2020 的现代浏览器:
- Chrome 80+
- Firefox 72+
- Safari 13.1+
- Edge 80+

# TypeScript (可选)
TypeScript >= 5.0`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p>
                  <strong class="text-gray-900">推荐使用:</strong>
                </p>
                <ul class="ml-2 list-inside list-disc space-y-1">
                  <li>Node.js 18+ (LTS)</li>
                  <li>TypeScript 5.3+</li>
                  <li>Vite 5+</li>
                  <li>pnpm 作为包管理器</li>
                </ul>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* 包管理器 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">包管理器</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              Fukict 支持所有主流包管理器
            </p>
          </div>

          <SplitView leftTitle="安装命令" rightTitle="包管理器说明">
            <CodeBlock
              fukict:slot="code"
              code={`# npm
npm install @fukict/basic

# pnpm (推荐)
pnpm add @fukict/basic

# yarn
yarn add @fukict/basic

# bun
bun add @fukict/basic`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p>
                  <strong class="text-gray-900">pnpm</strong> - 推荐使用
                </p>
                <p class="ml-3">快速、节省磁盘空间</p>
                <p>
                  <strong class="mt-2 text-gray-900">npm</strong> - 默认选择
                </p>
                <p class="ml-3">Node.js 自带,兼容性好</p>
                <p>
                  <strong class="mt-2 text-gray-900">yarn</strong> - 备选方案
                </p>
                <p class="ml-3">稳定可靠</p>
                <p>
                  <strong class="mt-2 text-gray-900">bun</strong> - 实验性
                </p>
                <p class="ml-3">极速安装,新兴工具</p>
              </div>
            </DemoBox>
          </SplitView>
        </div>

        {/* CDN 使用 */}
        <div class="space-y-4">
          <div>
            <h3 class="mb-1 text-base font-medium text-gray-800">CDN 使用</h3>
            <p class="text-sm leading-relaxed text-gray-600">
              也可以通过 CDN 直接使用(不推荐生产环境)
            </p>
          </div>

          <SplitView leftTitle="CDN 示例" rightTitle="使用说明">
            <CodeBlock
              fukict:slot="code"
              code={`<!-- 使用 unpkg -->
<script type="module">
  import { attach, Fukict } from 'https://unpkg.com/@fukict/basic';

  // 你的代码
</script>

<!-- 使用 esm.sh -->
<script type="module">
  import { attach, Fukict } from 'https://esm.sh/@fukict/basic';
</script>`}
            />
            <DemoBox fukict:slot="demo">
              <div class="space-y-2 text-sm text-gray-700">
                <p>
                  <strong class="text-yellow-700">注意事项:</strong>
                </p>
                <ul class="ml-2 list-inside list-disc space-y-1">
                  <li>仅适用于原型开发或演示</li>
                  <li>生产环境应使用构建工具</li>
                  <li>CDN 方式无法使用 JSX</li>
                  <li>需要手动管理版本</li>
                </ul>
                <p class="mt-3 text-gray-600">推荐使用 npm + Vite 进行开发</p>
              </div>
            </DemoBox>
          </SplitView>
        </div>
      </div>
    );
  }
}
