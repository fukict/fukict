/**
 * Widget 渲染调度器
 * 提供性能优化的异步渲染调度，使用 requestIdleCallback
 */

// 类型定义
interface IdleDeadline {
  timeRemaining(): number;
  didTimeout: boolean;
}

type IdleRequestCallback = (deadline: IdleDeadline) => void;

interface IdleRequestOptions {
  timeout?: number;
}

// 调度配置
interface SchedulerConfig {
  enableScheduling: boolean;
  timeout: number; // 强制执行超时时间
}

// 默认配置
let config: SchedulerConfig = {
  enableScheduling: true,
  timeout: 5000, // 5秒超时
};

// 待调度的任务队列
const scheduledTasks: Array<() => void | Promise<void>> = [];
let isScheduling = false;

/**
 * 配置调度器
 */
export function configureScheduler(newConfig: Partial<SchedulerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 获取当前调度器配置
 */
export function getSchedulerConfig(): SchedulerConfig {
  return { ...config };
}

/**
 * 调度渲染任务
 */
export function scheduleRender(task: () => void | Promise<void>): void {
  if (!config.enableScheduling) {
    // 禁用调度时同步执行
    task();
    return;
  }

  scheduledTasks.push(task);

  if (!isScheduling) {
    isScheduling = true;
    scheduleWork();
  }
}

/**
 * 立即执行渲染任务（跳过调度）
 */
export function immediateRender(task: () => void | Promise<void>): void {
  task();
}

/**
 * 使用 requestIdleCallback 调度工作
 */
function scheduleWork(): void {
  const scheduler = getScheduler();

  scheduler(
    deadline => {
      // 执行任务直到时间片用完或队列为空
      while (
        scheduledTasks.length > 0 &&
        (deadline.timeRemaining() > 0 || deadline.didTimeout)
      ) {
        const task = scheduledTasks.shift();
        if (task) {
          try {
            const result = task();
            // 如果是 Promise，不阻塞其他任务
            if (result instanceof Promise) {
              result.catch(console.error);
            }
          } catch (error) {
            console.error('[@fukict/widget] Scheduled task error:', error);
          }
        }
      }

      // 如果还有任务，继续调度
      if (scheduledTasks.length > 0) {
        scheduleWork();
      } else {
        isScheduling = false;
      }
    },
    { timeout: config.timeout },
  );
}

/**
 * 获取调度器函数，优雅降级
 */
function getScheduler(): (
  callback: IdleRequestCallback,
  options?: IdleRequestOptions,
) => void {
  // 优先使用 requestIdleCallback
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback.bind(window);
  }

  // 降级到 requestAnimationFrame
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return (callback: IdleRequestCallback, _options?: IdleRequestOptions) => {
      window.requestAnimationFrame(() => {
        const start = Date.now();
        callback({
          timeRemaining: () => Math.max(0, 16 - (Date.now() - start)),
          didTimeout: false,
        });
      });
    };
  }

  // 最终降级到 setTimeout
  return (callback: IdleRequestCallback, _options?: IdleRequestOptions) => {
    setTimeout(() => {
      callback({
        timeRemaining: () => Math.max(0, 5),
        didTimeout: false,
      });
    }, 0);
  };
}

/**
 * 清空调度队列（用于测试或重置）
 */
export function clearScheduledTasks(): void {
  scheduledTasks.length = 0;
  isScheduling = false;
}
