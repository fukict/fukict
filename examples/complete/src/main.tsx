import { attach } from '@fukict/basic';

import { App } from './App';

import './index.css';

const root = document.getElementById('app');
if (root) {
  attach(<App />, root);
}
