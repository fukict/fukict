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

  render() {
    return (
      <div className="counter-example">
        <h3>计数器示例</h3>
        <div className="counter-display">
          <span className="count-value">{this.count.toString()}</span>
        </div>
        <div className="counter-actions">
          <button 
            className="btn btn-decrement" 
            disabled={this.count <= 0}
            on:click={this.handleDecrement.bind(this)}
          >
            -
          </button>
          <button className="btn btn-reset" on:click={this.handleReset.bind(this)}>
            重置
          </button>
          <button className="btn btn-increment" on:click={this.handleIncrement.bind(this)}>
            +
          </button>
        </div>
      </div>
    );
  }

  private handleIncrement() {
    this.count += 1;
    console.log('Increment clicked, count:', this.count);
    
    // 精确更新显示值
    const countDisplay = this.$('.count-value');
    if (countDisplay) {
      countDisplay.set('textContent', this.count.toString());
    }
    
    // 更新按钮状态
    this.updateButtonStates();
  }

  private handleDecrement() {
    if (this.count > 0) {
      this.count -= 1;
      console.log('Decrement clicked, count:', this.count);
      
      // 精确更新显示值
      const countDisplay = this.$('.count-value');
      if (countDisplay) {
        countDisplay.set('textContent', this.count.toString());
      }
      
      // 更新按钮状态
      this.updateButtonStates();
    }
  }

  private handleReset() {
    this.count = 0;
    console.log('Reset clicked');
    
    // 精确更新显示值
    const countDisplay = this.$('.count-value');
    if (countDisplay) {
      countDisplay.set('textContent', this.count.toString());
    }
    
    // 更新按钮状态
    this.updateButtonStates();
  }

  private updateButtonStates() {
    const decrementBtn = this.$('.btn-decrement');
    if (decrementBtn) {
      decrementBtn.set('disabled', this.count <= 0);
    }
  }
} 