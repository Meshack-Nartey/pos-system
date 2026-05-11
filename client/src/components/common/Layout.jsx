import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import useTheme from '../../hooks/useTheme';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark } = useTheme();

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'dark bg-slate-900' : 'bg-white'}`}>

      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {children}
        </div>

      </div>

    </div>
  );
};

export default Layout;
