/**
 * 自定义 Web Component 示例：my-counter
 *
 * 一个简单的计数器组件，展示如何创建 Web Component
 */

export class MyCounter extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'step', 'min', 'max', 'disabled'];
  }

  private _value = 0;
  private _step = 1;
  private _min = -Infinity;
  private _max = Infinity;
  private _disabled = false;

  private shadow: ShadowRoot;
  private valueDisplay: HTMLSpanElement | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'value':
        this._value = Number(newValue) || 0;
        this.updateDisplay();
        break;
      case 'step':
        this._step = Number(newValue) || 1;
        break;
      case 'min':
        this._min = newValue !== null ? Number(newValue) : -Infinity;
        break;
      case 'max':
        this._max = newValue !== null ? Number(newValue) : Infinity;
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        this.updateDisabledState();
        break;
    }
  }

  get value() {
    return this._value;
  }

  set value(val: number) {
    this._value = Math.min(Math.max(val, this._min), this._max);
    this.updateDisplay();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this._value },
        bubbles: true,
      }),
    );
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: system-ui, sans-serif;
        }

        button {
          width: 32px;
          height: 32px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .value {
          min-width: 48px;
          text-align: center;
          font-size: 16px;
          font-weight: 500;
          padding: 4px 8px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background: #f9fafb;
        }
      </style>

      <button class="decrement" aria-label="Decrease">-</button>
      <span class="value">0</span>
      <button class="increment" aria-label="Increase">+</button>
    `;

    this.valueDisplay = this.shadow.querySelector('.value');
  }

  private setupEventListeners() {
    const decrementBtn = this.shadow.querySelector('.decrement');
    const incrementBtn = this.shadow.querySelector('.increment');

    decrementBtn?.addEventListener('click', () => {
      if (!this._disabled) {
        this.value = this._value - this._step;
      }
    });

    incrementBtn?.addEventListener('click', () => {
      if (!this._disabled) {
        this.value = this._value + this._step;
      }
    });
  }

  private updateDisplay() {
    if (this.valueDisplay) {
      this.valueDisplay.textContent = String(this._value);
    }
  }

  private updateDisabledState() {
    const buttons = this.shadow.querySelectorAll('button');
    buttons.forEach(btn => {
      if (this._disabled) {
        btn.setAttribute('disabled', '');
      } else {
        btn.removeAttribute('disabled');
      }
    });
  }
}

// 注册 Web Component
if (!customElements.get('my-counter')) {
  customElements.define('my-counter', MyCounter);
}
