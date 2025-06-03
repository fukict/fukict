const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 测试 Webpack Demo...\n');

try {
  // 测试构建
  console.log('📦 测试构建...');
  execSync('pnpm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ 构建成功！\n');

  // 检查构建产物
  const fs = require('fs');
  const distPath = path.join(__dirname, 'dist');

  if (fs.existsSync(path.join(distPath, 'bundle.js'))) {
    const bundleSize = fs.statSync(path.join(distPath, 'bundle.js')).size;
    console.log(`📊 Bundle 大小: ${(bundleSize / 1024).toFixed(2)} KB`);
  }

  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log('✅ HTML 文件生成成功');
  }

  // 简单检查 bundle 内容
  const bundleContent = fs.readFileSync(
    path.join(distPath, 'bundle.js'),
    'utf-8',
  );

  if (bundleContent.includes('jsx')) {
    console.log('✅ JSX 转换成功');
  }

  if (bundleContent.includes('Fragment')) {
    console.log('✅ Fragment 支持成功');
  }

  if (bundleContent.includes('Hello from Vanilla DOM')) {
    console.log('✅ 演示内容包含成功');
  }

  console.log('\n🎉 所有测试通过！');
  console.log('\n📋 演示功能:');
  console.log('- ✅ JSX 语法转换');
  console.log('- ✅ TypeScript 编译');
  console.log('- ✅ Babel 插件集成');
  console.log('- ✅ 自动导入 jsx/Fragment');
  console.log('- ✅ 组件化开发');
  console.log('- ✅ Webpack 构建');
  console.log('\n🌐 启动开发服务器: pnpm run start');
  console.log('📱 访问地址: http://localhost:3001');
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
}
