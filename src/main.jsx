import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route
          path="/:colorWay?/:reactUrl?/:reactStart?/:talUrl?/:talStart?/:playPause?/:extraContentParam?"
          element={<App />}
        />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
