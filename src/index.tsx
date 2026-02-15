import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { PortalDataProvider } from './context/PortalDataContext';
import { SiteContentProvider } from './context/SiteContentContext';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SiteContentProvider>
          <PortalDataProvider>
            <App />
          </PortalDataProvider>
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
