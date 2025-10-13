/**
 * Context System Demo
 * Demonstrates the pure, side-effect-free context system in Fukict
 */
import { Fukict } from '@fukict/basic';

import {
  THEME_CONTEXT,
  ThemeContext,
  USER_CONTEXT,
  UserContext,
} from '../contexts';

/**
 * Button component that consumes theme and user contexts
 */
class ThemedButton extends Fukict {
  render() {
    // Get contexts with default values
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
      backgroundColor: '#fff',
    })!;

    const user = this.getContext<UserContext>(USER_CONTEXT, {
      name: 'Guest',
      role: 'viewer',
      email: '',
    })!;

    const isDisabled = user.role === 'viewer';

    return (
      <button
        style={`
          background: ${theme.primaryColor};
          color: ${theme.mode === 'dark' ? '#fff' : '#000'};
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
          opacity: ${isDisabled ? 0.6 : 1};
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          box-shadow: 0 2px 4px #dedede;
        `}
        disabled={isDisabled}
        on:click={() => alert('Button clicked!')}
      >
        {user.role === 'viewer' ? '🔒 Read-only for ' : '✨ Click me, '}
        {user.name}!
      </button>
    );
  }
}

/**
 * Card component that shows current theme
 */
class ThemeCard extends Fukict {
  render() {
    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
      backgroundColor: '#fff',
    })!;

    return (
      <div
        style={`
          background: ${theme.backgroundColor};
          color: ${theme.mode === 'dark' ? '#e0e0e0' : '#333'};
          padding: 24px;
          border: 2px solid ${theme.mode === 'dark' ? '#444' : '#e0e0e0'};
          border-radius: 12px;
          margin: 16px 0;
          box-shadow: 0 4px 6px #dedede;
          transition: all 0.3s;
        `}
      >
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          🎨 Current Theme
        </h3>
        <div style="display: grid; gap: 8px; font-size: 14px;">
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 120px; font-weight: 500;">Mode:</span>
            <span style="padding: 4px 12px; background: ${theme.mode === 'dark' ? '#444' : '#f0f0f0'}; border-radius: 4px;">
              {theme.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </span>
          </p>
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 120px; font-weight: 500;">Primary Color:</span>
            <span style="display: flex; align-items: center;">
              <span
                style={`width: 24px; height: 24px; background: ${theme.primaryColor}; border-radius: 4px; margin-right: 8px; border: 1px solid #dedede;`}
              ></span>
              {theme.primaryColor}
            </span>
          </p>
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 120px; font-weight: 500;">Background:</span>
            <span style="display: flex; align-items: center;">
              <span
                style={`width: 24px; height: 24px; background: ${theme.backgroundColor}; border-radius: 4px; margin-right: 8px; border: 1px solid #dedede;`}
              ></span>
              {theme.backgroundColor}
            </span>
          </p>
        </div>
      </div>
    );
  }
}

/**
 * User info component
 */
class UserInfo extends Fukict {
  render() {
    const user = this.getContext<UserContext>(USER_CONTEXT, {
      name: 'Guest',
      role: 'viewer',
      email: '',
    })!;

    const theme = this.getContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#007bff',
      backgroundColor: '#fff',
    })!;

    const roleIcons = {
      admin: '👑',
      editor: '✏️',
      viewer: '👀',
    };

    return (
      <div
        style={`
          background: ${theme.backgroundColor};
          color: ${theme.mode === 'dark' ? '#e0e0e0' : '#333'};
          padding: 24px;
          border: 2px solid ${theme.mode === 'dark' ? '#444' : '#e0e0e0'};
          border-radius: 12px;
          margin: 16px 0;
          box-shadow: 0 4px 6px #dedede;
          transition: all 0.3s;
        `}
      >
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          👤 Current User
        </h3>
        <div style="display: grid; gap: 8px; font-size: 14px;">
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 80px; font-weight: 500;">Name:</span>
            <span>{user.name}</span>
          </p>
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 80px; font-weight: 500;">Role:</span>
            <span
              style={`padding: 4px 12px; background: ${
                user.role === 'admin'
                  ? '#dc3545'
                  : user.role === 'editor'
                    ? '#ffc107'
                    : '#6c757d'
              }; color: white; border-radius: 4px; font-weight: 500;`}
            >
              {roleIcons[user.role]} {user.role}
            </span>
          </p>
          <p style="margin: 0; display: flex; align-items: center;">
            <span style="width: 80px; font-weight: 500;">Email:</span>
            <span>{user.email}</span>
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Nested component that overrides theme context
 */
class NestedSection extends Fukict {
  mounted() {
    // Override parent theme with different values
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: 'light',
      primaryColor: '#28a745',
      backgroundColor: '#d4edda',
    });
  }

  render() {
    return (
      <div
        style={`
          margin: 24px 0;
          padding: 24px;
          border: 3px dashed #28a745;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(40,167,69,0.05) 0%, rgba(40,167,69,0.1) 100%);
        `}
      >
        <h3 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #28a745;">
          🔄 Nested Section (Context Override)
        </h3>
        <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
          This section provides its own theme context, demonstrating how
          lower-level contexts override parent contexts with higher priority.
        </p>
        <ThemeCard />
        <div style="margin-top: 16px;">
          <ThemedButton />
        </div>
      </div>
    );
  }
}

/**
 * Main Context Demo
 */
export class ContextDemo extends Fukict {
  state = {
    darkMode: false,
    userRole: 'editor' as 'admin' | 'editor' | 'viewer',
  };

  mounted() {
    this.updateContexts();
  }

  updateContexts() {
    // Provide theme context
    this.provideContext<ThemeContext>(THEME_CONTEXT, {
      mode: this.state.darkMode ? 'dark' : 'light',
      primaryColor: this.state.darkMode ? '#6c757d' : '#007bff',
      backgroundColor: this.state.darkMode ? '#1a1a1a' : '#ffffff',
    });

    // Provide user context
    this.provideContext<UserContext>(USER_CONTEXT, {
      name: 'Alice',
      role: this.state.userRole,
      email: 'alice@example.com',
    });
  }

  toggleTheme = () => {
    this.state.darkMode = !this.state.darkMode;
    // 更新 context 值
    this.updateContexts();
    // 调用 update 触发自顶向下的更新，子组件会通过 getContext 获取新值
    this.update(this.props);
  };

  changeRole = () => {
    const roles: Array<'admin' | 'editor' | 'viewer'> = [
      'admin',
      'editor',
      'viewer',
    ];
    const currentIndex = roles.indexOf(this.state.userRole);
    this.state.userRole = roles[(currentIndex + 1) % roles.length];
    // 更新 context 值
    this.updateContexts();
    // 调用 update 触发自顶向下的更新
    this.update(this.props);
  };

  render() {
    const isDark = this.state.darkMode;

    return (
      <div
        style={`
          padding: 32px;
          min-height: 100vh;
          background: ${isDark ? '#0d1117' : '#f6f8fa'};
          color: ${isDark ? '#e0e0e0' : '#24292f'};
          transition: all 0.3s;
        `}
      >
        <div style="max-width: 900px; margin: 0 auto;">
          <h2 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700;">
            Context System Demo
          </h2>
          <p style="margin: 0 0 32px 0; font-size: 16px; color: #666;">
            Demonstrates pure, side-effect-free context system with no global
            state.
          </p>

          {/* Control Panel */}
          <div
            style={`
              display: flex;
              gap: 12px;
              margin-bottom: 32px;
              padding: 20px;
              background: ${isDark ? '#161b22' : '#ffffff'};
              border-radius: 12px;
              border: 2px solid ${isDark ? '#30363d' : '#e1e4e8'};
              box-shadow: 0 4px 6px #dedede;
            `}
          >
            <button
              on:click={this.toggleTheme}
              style={`
                flex: 1;
                padding: 14px 24px;
                border: 2px solid ${isDark ? '#444' : '#ddd'};
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                background: ${isDark ? '#21262d' : '#ffffff'};
                color: ${isDark ? '#e0e0e0' : '#24292f'};
                transition: all 0.2s;
                box-shadow: 0 2px 4px #dedede;
              `}
            >
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <button
              on:click={this.changeRole}
              style={`
                flex: 1;
                padding: 14px 24px;
                border: 2px solid ${isDark ? '#444' : '#ddd'};
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                background: ${isDark ? '#21262d' : '#ffffff'};
                color: ${isDark ? '#e0e0e0' : '#24292f'};
                transition: all 0.2s;
                box-shadow: 0 2px 4px #dedede;
              `}
            >
              👤 Role: {this.state.userRole}
            </button>
          </div>

          {/* Context Consumers */}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <ThemeCard />
            <UserInfo />
          </div>

          <div style="margin-bottom: 24px;">
            <ThemedButton />
          </div>

          {/* Nested Section */}
          <NestedSection />

          {/* Feature List */}
          <div
            style={`
              margin-top: 32px;
              padding: 24px;
              background: linear-gradient(135deg, ${isDark ? 'rgba(33,136,255,0.1)' : 'rgba(33,136,255,0.05)'} 0%, ${isDark ? 'rgba(33,136,255,0.05)' : 'rgba(33,136,255,0.1)'} 100%);
              border-radius: 12px;
              border: 2px solid ${isDark ? '#1f6feb' : '#0969da'};
            `}
          >
            <h4 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: ${isDark ? '#58a6ff' : '#0969da'};">
              ✨ Key Features
            </h4>
            <ul style="margin: 0; padding-left: 24px; line-height: 2; font-size: 14px;">
              <li>
                <strong>No global state</strong> - context stored on VNode tree
              </li>
              <li>
                <strong>Immutable values</strong> - Proxy prevents mutations
              </li>
              <li>
                <strong>Priority system</strong> - lower levels override parents
              </li>
              <li>
                <strong>Type-safe</strong> - full TypeScript support
              </li>
              <li>
                <strong>Symbol keys</strong> - no naming collisions
              </li>
              <li>
                <strong>Class Component only</strong> - aligned with update
                capabilities
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
