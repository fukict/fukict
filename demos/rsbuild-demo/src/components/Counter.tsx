import { hyperscript } from '@vanilla-dom/core';

export function Counter() {
  let count = 0;

  const handleDecrement = (event: Event) => {
    count--;
    const button = event.target as HTMLButtonElement;
    const counterDiv = button.parentElement
      ?.previousElementSibling as HTMLDivElement;
    if (counterDiv) {
      counterDiv.textContent = count.toString();
    }
  };

  const handleIncrement = (event: Event) => {
    count++;
    const button = event.target as HTMLButtonElement;
    const counterDiv = button.parentElement
      ?.previousElementSibling as HTMLDivElement;
    if (counterDiv) {
      counterDiv.textContent = count.toString();
    }
  };

  const handleReset = (event: Event) => {
    count = 0;
    const button = event.target as HTMLButtonElement;
    const counterDiv = button.parentElement
      ?.previousElementSibling as HTMLDivElement;
    if (counterDiv) {
      counterDiv.textContent = count.toString();
    }
  };

  return (
    <div>
      <div className="counter">0</div>
      <div>
        <button className="btn" on:click={handleDecrement}>
          -1
        </button>
        <button className="btn" on:click={handleIncrement}>
          +1
        </button>
        <button className="btn" on:click={handleReset}>
          重置
        </button>
      </div>
    </div>
  );
}
