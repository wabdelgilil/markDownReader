import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import 'katex/dist/katex.min.css';
import './styles/themes.css';
import './styles/typography.css';
import './styles/prism.css';
import './styles/diagrams.css';
import './styles/globals.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
