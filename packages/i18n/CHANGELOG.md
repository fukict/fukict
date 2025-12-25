# @fukict/i18n

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
