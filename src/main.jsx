import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/:colorWay?/:reactUrl?/:reactStart?/:talUrl?/:talStart?/:playPause?"
          element={<App />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
