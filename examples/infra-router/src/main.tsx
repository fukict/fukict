import { attach } from '@fukict/basic';

import { App } from './App';

import './index.css';

// Render the app
const appElement = document.getElementById('app');
if (appElement) {
  attach(<App />, appElement);
}
