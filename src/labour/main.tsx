import React from 'react';
import ReactDOM from 'react-dom/client';
import { LabourAuthProvider, useLabourAuth } from './LabourAuthContext';
import LabourLogin from './LabourLogin';
import LabourDashboard from './LabourDashboard';
import '../index.css';

function LabourApp() {
  const { labour, isLoading } = useLabourAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1410] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#6B9080]/20 border-t-[#6B9080] rounded-full animate-spin" />
      </div>
    );
  }

  return labour ? <LabourDashboard /> : <LabourLogin />;
}

ReactDOM.createRoot(document.getElementById('labour-root')!).render(
  <React.StrictMode>
    <LabourAuthProvider>
      <LabourApp />
    </LabourAuthProvider>
  </React.StrictMode>
);
