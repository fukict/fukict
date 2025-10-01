import fs from 'fs';

console.log('=== TypeScript + @fukict/babel-plugin 转换测试 ===\n');

// 读取转换后的代码
const transformedCode = fs.readFileSync('./dist/test-ts.js', 'utf8');

console.log('📄 TypeScript JSX 转换后的代码:');
console.log('─'.repeat(60));
console.log(transformedCode);
console.log('─'.repeat(60));

// 分析转换结果
console.log('\n🔍 TypeScript 转换分析:');

// 检查是否包含jsx调用
const jsxCallCount = (transformedCode.match(/jsx\(/g) || []).length;
console.log(`✅ jsx() 调用次数: ${jsxCallCount}`);

// 检查是否包含事件分离
const eventPatterns = ['on:click', 'on:submit', 'on:change'];

console.log('\n📦 TypeScript 事件转换检查:');
eventPatterns.forEach(pattern => {
  if (transformedCode.includes(`"${pattern.replace('on:', '')}"`)) {
    console.log(`✅ ${pattern} -> 已转换为事件对象`);
  } else if (transformedCode.includes(pattern)) {
    console.log(`❌ ${pattern} -> 未正确转换`);
  }
});

// 检查4参数jsx调用格式
const fourParamPattern = /jsx\([^,]+,\s*[^,]*,\s*\{[^}]*\},/;
if (fourParamPattern.test(transformedCode)) {
  console.log('✅ 检测到4参数jsx调用格式 (包含events参数)');
} else {
  console.log('❌ 未检测到4参数jsx调用格式');
}

// 检查TypeScript特定问题
if (
  transformedCode.includes('React.FC') ||
  transformedCode.includes('React.ReactNode')
) {
  console.log('❌ 发现未处理的React类型');
} else {
  console.log('✅ TypeScript类型已正确处理');
}

// 检查是否包含runtime导入
if (transformedCode.includes('import { jsx, Fragment }')) {
  console.log('✅ 自动添加runtime导入');
} else {
  console.log('❌ 未找到runtime导入');
}

console.log('\n✨ TypeScript 测试完成!');
