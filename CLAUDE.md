# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fukict is a lightweight DOM rendering library focused on performance-critical scenarios. The architecture emphasizes:

- Compile-time JSX optimization to reduce runtime overhead
- Direct DOM manipulation with minimal abstraction
- Modular design with clear separation of concerns

## Package Architecture

The monorepo contains four core packages:

### @fukict/basic

The foundational rendering engine with no dependencies. Provides:

- VNode creation via `hyperscript()` / `h()` / JSX runtime
- Core rendering functions (`attach()`, `diff()`, `unmount()`)
- Class components (`Fukict`) and function components (`defineFukict`)
- DOM utilities and lifecycle management
- Ref system and slots mechanism

### @fukict/babel-preset

JSX transformation preset for compile-time optimization:

- Transforms JSX to hyperscript calls with event separation (`on:` prefix)
- Ensures children are always arrays (critical for runtime)
- Automatically imports hyperscript from `@fukict/basic`
- Handles both class and function components

### @fukict/router

Single-page application routing built on @fukict/basic:

- Hash and history mode support
- Nested routes with layout pattern
- Navigation guards (beforeEach, afterEach, beforeEnter)
- `Router`, `RouterView`, `Link`, and `RouteComponent` classes
- Subscription-based reactivity for route changes

### @fukict/vite-plugin

Vite integration plugin that applies babel-preset transformation to JSX/TSX files.

## Key Architectural Patterns

### Component Model

Two component types exist:

1. **Class components** extend `Fukict` with lifecycle methods (mounted, beforeUnmount, etc.)
2. **Function components** use `defineFukict()` for simpler stateless components

Both support:

- `fukict:ref` - Component instance references
- `fukict:detach` - Skip re-rendering (for persistent components)
- `this.slots.default` - Children passed to component

### Router Architecture

Uses a subscription-based pattern where:

- `Router` maintains `currentRoute` and notifies subscribers on changes
- `RouterView` subscribes to router and re-renders matched components
- Components extending `RouteComponent` have access to `this.router` and `this.route`
- **Layout Pattern**: Parent route components (like LayoutPage) contain Header/Footer, making them reactive to route changes

Critical: Router components should use `h()` function directly instead of JSX to avoid children array issues.

### JSX Compilation

The babel-preset ensures:

- JSX children are ALWAYS arrays (runtime expects this)
- Events with `on:` prefix are separated from attributes
- Type-only imports (`import type`) are skipped when adding hyperscript imports
- Both class and function components get proper transformation

## Development Commands

### Building Packages

```bash
# Build all packages (required before running examples)
pnpm build

# Watch mode for development (all packages)
pnpm build:watch

# Build specific package
tsx scripts/build-package.ts --pkg-name basic --no-watch

# Watch specific packages
tsx scripts/build-package.ts --pkg-name basic router --watch
```

### Running Examples

```bash
# Router example
cd examples/infra-router && pnpm dev

# Basic Vite example
cd examples/basic-vite && pnpm dev

# No-build example (uses pre-built dist files)
pnpm dev:no-build
# Then open http://localhost:8080/examples/no-build/
```

### Linting and Formatting

```bash
# Lint
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

### Release Management

```bash
# Extract metadata (version info)
pnpm extract-metadata

# Changesets workflow
pnpm changeset              # Create changeset
pnpm changeset:version      # Bump versions
pnpm changeset:release      # Build and publish

# Alpha/Beta releases
pnpm version:alpha
pnpm version:beta
```

## Critical Rules

### Forbidden Operations

1. Never start dev servers (`pnpm dev`) - user starts these manually
2. Never execute git write operations (`git add`, `git commit`, `git push`)
3. Never auto-install dependencies (`pnpm install`)

Read-only git commands (`git status`, `git diff`, `git log`) are allowed.

### Code Modification Rules

1. When modifying router package components, use `h()` function instead of JSX
2. Ensure all JSX children are arrays in components
3. Type-only imports must use `import type` syntax
4. Router subscription cleanup must be handled to prevent infinite loops

### Build Process

The build system:

- Uses TypeScript compiler (tsc) for transpilation
- Extracts metadata from package.json into metadata.ts files
- Supports parallel watch mode for multiple packages
- Available packages are read from tsdown.config.yml (legacy, now using tsc)

## Common Issues and Solutions

### Router Infinite Loop

**Symptom**: "Maximum call stack size exceeded" when navigating
**Cause**: `handleRouteChange()` calling `notify()`, triggering itself recursively
**Fix**: Remove `notify()` calls from `handleRouteChange()`, use `unsubscribeRouteChange` to prevent duplicate subscriptions

### Link Active State Not Updating

**Symptom**: Header/Footer links don't highlight when route changes
**Cause**: Components outside RouterView scope don't respond to route changes
**Solution**: Use Layout Pattern - make Header/Footer part of a RouteComponent that wraps all pages

### Hyperscript Not Defined

**Symptom**: Runtime error "hyperscript is not defined" in JSX files
**Cause**: babel-preset trying to add hyperscript to type-only imports
**Fix**: Check `node.importKind !== 'type'` before adding to existing import

### Children Not Array Warning

**Symptom**: Console warns "Element vnode children is not an array"
**Cause**: JSX not being transformed by babel-preset (using TypeScript's react-jsx mode instead)
**Solution**: Convert to h() function calls OR ensure babel-preset is being used

## File Structure Notes

- `packages/*/src/` - Source code (TypeScript)
- `packages/*/dist/` - Compiled output (generated, gitignored)
- `scripts/build-package.ts` - Build orchestration
- `scripts/extract-metadata.ts` - Version metadata extraction
- `examples/` - Working examples of package usage
- `old/` - Legacy code from previous architecture (reference only)

## TypeScript Configuration

All packages use:

- `moduleResolution: "nodeNext"` (not "node" or "node10")
- `module: "NodeNext"`
- Composite projects are disabled (`composite: false`)
- Router package does NOT use JSX config (uses h() directly)
