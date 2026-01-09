import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('index.js loaded');
console.log('Root element:', document.getElementById('root'));

const root = ReactDOM.createRoot(document.getElementById('root'));
console.log('Root created:', root);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('Root rendered');

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
