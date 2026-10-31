// Ensure window.fetch is writable to prevent "Cannot set property fetch of #<Window> which has only a getter"
try {
  let currentFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get: () => currentFetch,
    set: (fn) => {
      currentFetch = fn;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  // Ignore if already configured
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
