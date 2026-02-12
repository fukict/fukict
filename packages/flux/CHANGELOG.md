# @fukict/flux

## 0.1.11

### Patch Changes

- 0393641: 重构 diff
- b2361a4: 更新 传统/手动 列表渲染性能对比示例
- 8074aa1: 优化 format import 排序, vite-plugin 添加 @types/babel\_\_core 依赖
- f13869d: diff 性能优化
- 8289767: 添加 fetch 包
- 1c514d5: 忽略对 .changeset 目录文件的格式化
- Updated dependencies [0393641]
- Updated dependencies [b2361a4]
- Updated dependencies [8074aa1]
- Updated dependencies [f13869d]
- Updated dependencies [8289767]
- Updated dependencies [1c514d5]
  - @fukict/basic@0.1.11

## 0.1.10

### Patch Changes

- ed2780a: fukict basic vnode 重构完成
- 6c7743f: 优化对 devtools 的支持
- Updated dependencies [ed2780a]
- Updated dependencies [6c7743f]
  - @fukict/basic@0.1.10

## 0.1.9

### Patch Changes

- 9eb4b38: 组件根节点渲染添加 组件名/文件路径 属性, 方便开发者定位
- 84b4aff: 添加 agent 快速理解文档
- 65ba8c1: 更新 agent 文档
- ba27ff7: 更新 agent 文档

## 0.1.8

### Patch Changes

- 3fbd68c: 修复 diff 对 webcomponent 的支持

## 0.1.7

### Patch Changes

- d67c484: 修复 tag 脚本对子包打 tag
- 94f7f2f: 添加 web component 类型适配示例
- 2cabebc: 优化对 web component 支持

## 0.1.6

### Patch Changes

- f82ce56: 修复 refs 过继包裹组件问题, 优化 refs/slot 命名 $refs/$slotss

## 0.1.5

### Patch Changes

- 0468890: 优化 changeset 检查

## 0.1.4

### Patch Changes

- 76e829a: 优化发布流程
- a025702: 优化提交检查流程
- c65380c: 新增 defineStore API，支持同步/异步 actions 分离，简化状态管理写法
- a985227: 生命周期钩子 mounted/beforeUnmount/updated 支持 async 定义
- 6c87126: 添加 params/query 泛型类型支持，支持相对路径和 index 路由
- cc87357: 修复发布脚本登录检查

## 0.1.3

### Patch Changes

- dom event support async function

## 0.1.2

### Patch Changes

- b96873c: refactor refs to use plain object instead of Map
- 7a57283: resolve conditional rendering order issues with PrimitiveVNode
- f7cbbd3: support render() returning null/undefined via PrimitiveVNode wrapping

## 0.1.1

### Patch Changes

- 4e7fa17: class component refs/slots not updating during diff + i18n method binding
- 184016d: remove compile-time **type** detection and **COMPONENT_TYPE** field

## 0.1.0

### Minor Changes

- Initial release with core packages
