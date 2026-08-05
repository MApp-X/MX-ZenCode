//index.tsx
import { render } from 'levelojs';
import Mind from './Mind.js';
import './index.css';
import './themes/app-thems/dark.css';
import './themes/app-thems/light.css';
import { Theme } from './components/Theme.js';

if (window.location.pathname.endsWith('index.html') || window.location.pathname.includes('/assets/')) {
  window.history.replaceState(null, '', '/');
}

const savedTheme = localStorage.getItem("app-theme") || "light";
Theme(savedTheme);

render(Mind, document.getElementById('app'));