# @fukict/router

SPA router for Fukict framework with nested routing, lazy loading, and navigation guards.

## Features

- **Nested Routes**: Multi-level route hierarchies with automatic depth management
- **Lazy Loading**: Dynamic component loading for code splitting
- **Navigation Guards**: `beforeEach`, `afterEach`, and route-level `beforeEnter` hooks
- **Route Parameters**: Dynamic segments with `:param` syntax
- **Query Parameters**: URL query string support
- **Hash & History Mode**: Choose between hash-based or HTML5 history routing
- **Type-Safe**: Full TypeScript support with route type inference
- **Link Component**: Declarative navigation with automatic active states
- **Programmatic Navigation**: `push()`, `replace()`, `back()`, `forward()` methods
- **Route Meta**: Attach custom metadata to routes

## Installation

```bash
pnpm add @fukict/router @fukict/basic
```

## Quick Start

### Basic Setup

```tsx
import { Fukict, attach } from '@fukict/basic';
import { Link, RouteComponent, RouterProvider } from '@fukict/router';

// Define page components
class HomePage extends RouteComponent {
  render() {
    return (
      <div>
        <h1>Home Page</h1>
        <Link to="/about">Go to About</Link>
      </div>
    );
  }
}

class AboutPage extends RouteComponent {
  render() {
    return <h1>About Page</h1>;
  }
}

// Configure routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
];

// Create app with RouterProvider
class App extends Fukict {
  render() {
    return (
      <div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
        <RouterProvider routes={routes} />
      </div>
    );
  }
}

attach(<App />, document.getElementById('app')!);
```

## Core Concepts

### Route Configuration

```typescript
import type { RouteConfig } from '@fukict/router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
    meta: { title: 'Home' },
  },
  {
    path: '/users/:id',
    component: UserPage,
    meta: { title: 'User Profile', requiresAuth: true },
    beforeEnter: (to, from, next) => {
      // Route-level guard
      if (isAuthenticated()) {
        next();
      } else {
        next('/login');
      }
    },
  },
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '/dashboard/overview',
        component: OverviewPage,
      },
      {
        path: '/dashboard/settings',
        component: SettingsPage,
      },
    ],
  },
  {
    path: '*',
    component: NotFoundPage,
  },
];
```

### RouterProvider Options

```tsx
import { RouterProvider } from '@fukict/router';

<RouterProvider
  routes={routes}
  mode="hash" // or "history"
  beforeEach={(to, from, next) => {
    // Global before guard
    console.log('Navigating:', from.path, '->', to.path);
    document.title = to.meta?.title || 'App';
    next();
  }}
  afterEach={(to, from) => {
    // Global after hook
    console.log('Navigation complete');
  }}
/>;
```

### RouteComponent Base Class

Extend `RouteComponent` for convenient access to routing APIs:

```tsx
import { RouteComponent } from '@fukict/router';

class UserPage extends RouteComponent {
  mounted() {
    // Access route information
    console.log('Route path:', this.route.path);
    console.log('Params:', this.params);
    console.log('Query:', this.query);
  }

  // Listen to parameter changes
  routeParamsChanged(newParams: any, oldParams: any) {
    console.log('Params changed:', oldParams, '->', newParams);
    // Re-fetch data based on new params
    this.loadUser(newParams.id);
  }

  // Listen to query changes
  routeQueryChanged(newQuery: any, oldQuery: any) {
    console.log('Query changed:', oldQuery, '->', newQuery);
  }

  loadUser(id: string) {
    // Load user data
  }

  goHome = () => {
    this.push('/');
  };

  render() {
    const { id } = this.params;
    const { page = '1' } = this.query;

    return (
      <div>
        <h1>User {id}</h1>
        <p>Page: {page}</p>
        <button on:click={this.goHome}>Go Home</button>
      </div>
    );
  }
}
```

### Link Component

```tsx
import { Link } from '@fukict/router';

// Basic link
<Link to="/about">About</Link>

// With query parameters
<Link to={{ path: '/search', query: { q: 'fukict', page: '1' } }}>
  Search
</Link>

// Replace mode (doesn't add history entry)
<Link to="/login" replace>Login</Link>

// Custom active class
<Link to="/" activeClass="nav-active" exactActiveClass="nav-exact">
  Home
</Link>

// Styled link
<Link to="/profile" className="nav-link">
  <span>Profile</span>
</Link>
```

### Programmatic Navigation

```tsx
class MyComponent extends RouteComponent {
  handleSubmit = () => {
    // Push new route
    this.push('/success');

    // Push with query
    this.push({ path: '/search', query: { q: 'test' } });

    // Replace current route
    this.replace('/login');

    // Update query only
    this.updateQuery({ page: '2', sort: 'date' });

    // Go back
    this.back();

    // Go forward
    this.forward();

    // Access router directly
    this.router.push('/custom');
  };

  render() {
    return <button on:click={this.handleSubmit}>Submit</button>;
  }
}
```

## Nested Routes

### Parent-Child Structure

```tsx
// Parent layout component
class DashboardLayout extends RouteComponent {
  render() {
    return (
      <div class="dashboard">
        <aside>
          <Link to="/dashboard/overview">Overview</Link>
          <Link to="/dashboard/analytics">Analytics</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </aside>
        <main>
          {/* Render child routes here */}
          <RouterView router={this.router} />
        </main>
      </div>
    );
  }
}

// Child components
class OverviewPage extends RouteComponent {
  render() {
    return <h2>Dashboard Overview</h2>;
  }
}

class AnalyticsPage extends RouteComponent {
  render() {
    return <h2>Analytics</h2>;
  }
}

// Route configuration
const routes = [
  {
    path: '/dashboard',
    component: DashboardLayout,
    children: [
      { path: '/dashboard/overview', component: OverviewPage },
      { path: '/dashboard/analytics', component: AnalyticsPage },
      { path: '/dashboard/settings', component: SettingsPage },
    ],
  },
];
```

## Navigation Guards

### Global Guards

```tsx
<RouterProvider
  routes={routes}
  beforeEach={(to, from, next) => {
    // Authentication check
    if (to.meta?.requiresAuth && !isLoggedIn()) {
      next('/login');
      return;
    }

    // Update page title
    document.title = to.meta?.title || 'App';

    // Proceed
    next();
  }}
  afterEach={(to, from) => {
    // Analytics tracking
    trackPageView(to.path);

    // Scroll to top
    window.scrollTo(0, 0);
  }}
/>
```

### Route-Level Guards

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      if (isAdmin()) {
        next();
      } else {
        next('/forbidden');
      }
    },
  },
];
```

### Guard Execution Order

```
Global beforeEach
    ↓
Route beforeEnter
    ↓
Component mount/update
    ↓
Global afterEach
```

## Route Parameters

### Dynamic Segments

```typescript
// Route config
{ path: '/users/:id', component: UserPage }
{ path: '/posts/:category/:id', component: PostPage }

// Access in component
class UserPage extends RouteComponent {
  render() {
    const { id } = this.params;
    return <h1>User {id}</h1>;
  }

  // React to param changes
  routeParamsChanged(newParams: any, oldParams: any) {
    console.log('User changed from', oldParams.id, 'to', newParams.id);
  }
}
```

### Query Parameters

```typescript
// Navigate with query
this.push({ path: '/search', query: { q: 'fukict', page: '1' } });

// Access in component
class SearchPage extends RouteComponent {
  render() {
    const { q, page = '1' } = this.query;
    return (
      <div>
        <h1>Search: {q}</h1>
        <p>Page: {page}</p>
      </div>
    );
  }

  // Update query
  nextPage = () => {
    const currentPage = parseInt(this.query.page || '1');
    this.updateQuery({ page: String(currentPage + 1) });
  };

  // React to query changes
  routeQueryChanged(newQuery: any, oldQuery: any) {
    this.performSearch(newQuery.q, newQuery.page);
  }
}
```

## Lazy Loading

```typescript
// Define lazy component loader
const LazyPage = () => import('./pages/LazyPage');

// Route configuration
const routes = [
  {
    path: '/lazy',
    component: LazyPage, // Will be loaded on demand
  },
];
```

## Route Metadata

```typescript
// Define custom route meta
interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  roles?: string[];
}

// Use in routes
const routes: RouteConfig[] = [
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      title: 'Admin Panel',
      requiresAuth: true,
      roles: ['admin'],
    } as RouteMeta,
  },
];

// Access in guards
beforeEach: (to, from, next) => {
  const meta = to.meta as RouteMeta;
  if (meta?.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
};
```

## Advanced Usage

### Router Instance

```tsx
import { Router } from '@fukict/router';

// Create router manually
const router = new Router({
  mode: 'history',
  routes,
  beforeEach: (to, from, next) => {
    // Guard logic
    next();
  },
});

// Use in app
class App extends Fukict {
  render() {
    return <RouterView router={router} />;
  }
}
```

### Custom Link Styling

```tsx
<Link
  to="/profile"
  activeClass="text-blue-500"
  exactActiveClass="font-bold text-blue-700"
>
  <span>Profile</span>
</Link>
```

### Redirect Routes

```typescript
const routes = [
  { path: '/', component: HomePage },
  {
    path: '/old-path',
    beforeEnter: (to, from, next) => {
      next('/new-path');
    },
  },
  { path: '/new-path', component: NewPage },
];
```

## Best Practices

### 1. Use RouteComponent Base Class

```tsx
// ✅ Good: Extend RouteComponent
class UserPage extends RouteComponent {
  render() {
    return <div>User {this.params.id}</div>;
  }
}

// ❌ Bad: Manual router access
class UserPage extends Fukict<{ router: Router }> {
  render() {
    const params = this.props.router.currentRoute.params;
    return <div>User {params.id}</div>;
  }
}
```

### 2. Handle Parameter Changes

```tsx
// ✅ Good: Implement routeParamsChanged
class ProductPage extends RouteComponent {
  routeParamsChanged(newParams: any, oldParams: any) {
    this.loadProduct(newParams.id);
  }
}

// ❌ Bad: No reaction to param changes
class ProductPage extends RouteComponent {
  mounted() {
    this.loadProduct(this.params.id);
    // Won't reload when navigating to different product
  }
}
```

### 3. Organize Routes

```typescript
// ✅ Good: Modular route structure
const userRoutes = [
  { path: '/users', component: UserList },
  { path: '/users/:id', component: UserDetail },
];

const adminRoutes = [
  { path: '/admin', component: AdminDashboard },
  { path: '/admin/users', component: AdminUsers },
];

const routes = [...userRoutes, ...adminRoutes, notFoundRoute];
```

## Examples

See the [examples/infra-router](../../examples/infra-router) for complete examples:

- Basic routing
- Nested routes
- Route parameters and query strings
- Navigation guards
- Lazy loading
- 404 handling

## API Reference

See [docs/README.md](./docs/README.md) for detailed API documentation.

## Related Packages

- [@fukict/basic](../basic) - Core rendering engine (required)
- [@fukict/babel-preset](../babel-preset) - JSX transformation
- [@fukict/vite-plugin](../vite-plugin) - Vite integration

## License

MIT
