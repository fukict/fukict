/**
 * SVG 元素演示
 * 展示 @fukict/basic 对 SVG 元素的完整类型支持
 */
import { Fukict } from '@fukict/basic';

/**
 * SVG Icon 组件示例
 */
class IconComponent extends Fukict {
  render() {
    return (
      <div style="padding: 20px; border: 1px solid #ddd; margin: 10px;">
        <h3>SVG Icon - 时钟图标</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
    );
  }
}

/**
 * 复杂 SVG 组件示例（包含渐变和滤镜）
 */
class ComplexSVGComponent extends Fukict {
  render() {
    return (
      <div style="padding: 20px; border: 1px solid #ddd; margin: 10px;">
        <h3>SVG 渐变和滤镜效果</h3>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(255,255,0)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(255,0,0)" stopOpacity="1" />
            </linearGradient>

            <filter id="blur1">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>
          </defs>

          <g>
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              fill="url(#gradient1)"
              stroke="black"
              strokeWidth="2"
            />

            <circle cx="140" cy="50" r="40" fill="blue" filter="url(#blur1)" />

            <ellipse
              cx="100"
              cy="140"
              rx="60"
              ry="30"
              fill="green"
              opacity="0.5"
            />

            <line
              x1="10"
              y1="180"
              x2="190"
              y2="180"
              stroke="red"
              strokeWidth="3"
            />

            <polygon points="100,10 150,90 50,90" fill="purple" opacity="0.7" />

            <polyline
              points="10,100 40,80 70,100 100,80"
              fill="none"
              stroke="orange"
              strokeWidth="2"
            />

            <path
              d="M 150 150 Q 180 120 180 150 T 150 150"
              fill="none"
              stroke="cyan"
              strokeWidth="2"
            />

            <text x="50" y="50" fontSize="16" fill="white">
              Hello SVG!
            </text>
          </g>
        </svg>
      </div>
    );
  }
}

/**
 * 使用 use 元素复用的示例
 */
class ReusableSVGComponent extends Fukict {
  render() {
    return (
      <div style="padding: 20px; border: 1px solid #ddd; margin: 10px;">
        <h3>SVG 元素复用 - use 标签</h3>
        <svg width="300" height="80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <symbol id="star" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </symbol>
          </defs>

          <use href="#star" x="10" y="10" width="50" height="50" fill="gold" />
          <use
            href="#star"
            x="90"
            y="10"
            width="50"
            height="50"
            fill="silver"
          />
          <use
            href="#star"
            x="170"
            y="10"
            width="50"
            height="50"
            fill="#cd7f32"
          />
        </svg>
      </div>
    );
  }
}

/**
 * 动画 SVG 示例
 */
class AnimatedSVGComponent extends Fukict {
  render() {
    return (
      <div style="padding: 20px; border: 1px solid #ddd; margin: 10px;">
        <h3>SVG 动画</h3>
        <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="20" fill="orange">
            <animate
              attributeName="r"
              from="20"
              to="30"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="fill"
              from="orange"
              to="purple"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">
          圆形会自动缩放和变色
        </p>
      </div>
    );
  }
}

/**
 * 主演示组件
 */
export class SvgElementDemo extends Fukict {
  render() {
    return (
      <div style="padding: 20px;">
        <h2>SVG 元素演示</h2>
        <p>展示 Fukict 对 SVG 的完整支持，包括类型提示和所有 SVG 特性</p>

        <IconComponent />
        <ComplexSVGComponent />
        <ReusableSVGComponent />
        <AnimatedSVGComponent />

        <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
          <h4>✨ 特性说明</h4>
          <ul style="line-height: 1.8;">
            <li>✅ 完整的 SVG 元素类型支持（60+ 元素）</li>
            <li>
              ✅ SVG 属性使用驼峰命名（strokeWidth, viewBox, fillOpacity 等）
            </li>
            <li>✅ 完整的 TypeScript 智能提示</li>
            <li>✅ 支持所有 SVG 特性：渐变、滤镜、动画、路径等</li>
            <li>✅ 类型安全，编译时错误检查</li>
          </ul>
        </div>
      </div>
    );
  }
}

export {
  IconComponent,
  ComplexSVGComponent,
  ReusableSVGComponent,
  AnimatedSVGComponent,
};
