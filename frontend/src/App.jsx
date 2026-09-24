import React from 'react';
import StrategicExecutiveDashboard from './components/StrategicExecutiveDashboard';

/**
 * ملف التجميع الرئيسي (App.jsx)
 * الهدف: استدعاء لوحة التحكم الاستراتيجية الرئيسية وتغليف التطبيق بالكامل ليظهر في المتصفح.
 */
function App() {
  return (
    <div className="bg-slate-900 min-h-screen">
      <StrategicExecutiveDashboard />
    </div>
  );
}

export default App;