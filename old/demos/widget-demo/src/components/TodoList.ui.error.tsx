import { defineWidget } from '@fukict/widget';

export interface ErrorProps {
  error?: string;
  onClear: () => void;
}

export const ErrorComponent = defineWidget<ErrorProps>(props => {
  if (!props.error) {
    return <div class="error-message" style="display: none;"></div>;
  }

  return (
    <div class="error-message" style="display: block;">
      {props.error}
      <button
        class="error-close"
        on:click={() => props.onClear()}
        style="margin-left: 8px; background: none; border: none; color: inherit; cursor: pointer;"
      >
        ✕
      </button>
    </div>
  );
});
