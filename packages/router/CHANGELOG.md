# @fukict/router

## 0.1.9

### Patch Changes

- 9eb4b38: 组件根节点渲染添加 组件名/文件路径 属性, 方便开发者定位
- 84b4aff: 添加 agent 快速理解文档
- 65ba8c1: 更新 agent 文档
- ba27ff7: 更新 agent 文档
- Updated dependencies [9eb4b38]
- Updated dependencies [84b4aff]
- Updated dependencies [65ba8c1]
- Updated dependencies [ba27ff7]
  - @fukict/basic@0.1.9

## 0.1.8

### Patch Changes

- 3fbd68c: 修复 diff 对 webcomponent 的支持
- Updated dependencies [3fbd68c]
  - @fukict/basic@0.1.8

## 0.1.7

### Patch Changes

- d67c484: 修复 tag 脚本对子包打 tag
- 94f7f2f: 添加 web component 类型适配示例
- 2cabebc: 优化对 web component 支持
- Updated dependencies [d67c484]
- Updated dependencies [94f7f2f]
- Updated dependencies [2cabebc]
  - @fukict/basic@0.1.7

## 0.1.6

### Patch Changes

- f82ce56: 修复 refs 过继包裹组件问题, 优化 refs/slot 命名 $refs/$slotss
- Updated dependencies [f82ce56]
  - @fukict/basic@0.1.6

## 0.1.5

### Patch Changes

- 0468890: 优化 changeset 检查
- Updated dependencies [0468890]
  - @fukict/basic@0.1.5

## 0.1.4

### Patch Changes

- 76e829a: 优化发布流程
- a025702: 优化提交检查流程
- c65380c: 新增 defineStore API，支持同步/异步 actions 分离，简化状态管理写法
- a985227: 生命周期钩子 mounted/beforeUnmount/updated 支持 async 定义
- 6c87126: 添加 params/query 泛型类型支持，支持相对路径和 index 路由
- cc87357: 修复发布脚本登录检查
- Updated dependencies [76e829a]
- Updated dependencies [a025702]
- Updated dependencies [c65380c]
- Updated dependencies [a985227]
- Updated dependencies [6c87126]
- Updated dependencies [cc87357]
  - @fukict/basic@0.1.4

## 0.1.3

### Patch Changes

- dom event support async function
- Updated dependencies
  - @fukict/basic@0.1.3

## 0.1.2

### Patch Changes

- b96873c: refactor refs to use plain object instead of Map
- 7a57283: resolve conditional rendering order issues with PrimitiveVNode
- f7cbbd3: support render() returning null/undefined via PrimitiveVNode wrapping
- Updated dependencies [b96873c]
- Updated dependencies [7a57283]
- Updated dependencies [f7cbbd3]
  - @fukict/basic@0.1.2

## 0.1.1

### Patch Changes

- 4e7fa17: class component refs/slots not updating during diff + i18n method binding
- 184016d: remove compile-time **type** detection and **COMPONENT_TYPE** field
- Updated dependencies [4e7fa17]
- Updated dependencies [184016d]
  - @fukict/basic@0.1.1

## 0.1.0

### Minor Changes

- Initial release with core packages

### Patch Changes

- Updated dependencies
  - @fukict/basic@0.1.0
