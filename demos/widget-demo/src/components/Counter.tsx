import { Widget } from '@vanilla-dom/widget';

interface CounterProps {
  initialCount?: number;
}

export class Counter extends Widget<CounterProps> {
  private count: number;

  constructor(props: CounterProps) {
    super(props);
    this.count = props.initialCount || 0;
  }

  private increment = () => {
    this.count++;
    this.updateDisplay();
  };

  private decrement = () => {
    this.count--;
    this.updateDisplay();
  };

  private updateDisplay() {
    const display = this.$('.count-display');
    if (display && display.element) {
      display.element.textContent = this.count.toString();
    }
  }

  protected onMounted(): void {
    const incrementBtn = this.$('.increment-btn');
    const decrementBtn = this.$('.decrement-btn');

    if (incrementBtn && incrementBtn.element) {
      incrementBtn.element.addEventListener('click', this.increment);
    }

    if (decrementBtn && decrementBtn.element) {
      decrementBtn.element.addEventListener('click', this.decrement);
    }
  }

  protected onUnmounting(): void {
    const incrementBtn = this.$('.increment-btn');
    const decrementBtn = this.$('.decrement-btn');

    if (incrementBtn && incrementBtn.element) {
      incrementBtn.element.removeEventListener('click', this.increment);
    }

    if (decrementBtn && decrementBtn.element) {
      decrementBtn.element.removeEventListener('click', this.decrement);
    }
  }

  render() {
    return (
      <div className="counter-widget">
        <h3>🔢 计数器组件</h3>
        <div className="counter-controls">
          <button className="decrement-btn">-</button>
          <span className="count-display">{this.count}</span>
          <button className="increment-btn">+</button>
        </div>
        <style>{`
          .counter-widget {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
          }
          
          .counter-widget h3 {
            margin: 0 0 15px 0;
            color: #495057;
          }
          
          .counter-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
          }
          
          .counter-controls button {
            width: 40px;
            height: 40px;
            border: 2px solid #007bff;
            background: #007bff;
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
  }

          .counter-controls button:hover {
            background: #0056b3;
            border-color: #0056b3;
            transform: scale(1.1);
          }
          
          .count-display {
            font-size: 1.5rem;
            font-weight: bold;
            color: #007bff;
            min-width: 60px;
            text-align: center;
    }
        `}</style>
      </div>
    );
  }
}
