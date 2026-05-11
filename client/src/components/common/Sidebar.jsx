import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, Users, BarChart3,
  UserCog, DatabaseBackup, ShoppingCart, ClipboardList
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/inventory', label: 'Inventory', icon: Warehouse },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/end-of-day', label: 'End of Day', icon: ClipboardList },
    { path: '/admin/users', label: 'User Management', icon: UserCog },
    { path: '/admin/backup', label: 'Backup & Recovery', icon: DatabaseBackup },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/products', label: 'Products', icon: Package },
    { path: '/manager/inventory', label: 'Inventory', icon: Warehouse },
    { path: '/manager/customers', label: 'Customers', icon: Users },
    { path: '/manager/reports', label: 'Reports', icon: BarChart3 },
    { path: '/admin/end-of-day', label: 'End of Day', icon: ClipboardList },
  ];

  const cashierLinks = [
    { path: '/cashier/pos', label: 'POS Screen', icon: ShoppingCart },
  ];

  const getLinks = () => {
    if (user?.role === 'admin') return adminLinks;
    if (user?.role === 'manager') return managerLinks;
    return cashierLinks;
  };

  return (
    <div className={`h-full transition-all duration-300 flex flex-col ${
      isOpen ? 'w-56' : 'w-0 overflow-hidden'
    } ${isDark ? 'bg-slate-950 border-r border-slate-800' : 'bg-white border-r border-[#FFD6D6]'}`}>

      <div className="p-4 flex-1">

        {/* User Info */}
        <div className={`rounded-xl p-3 mb-6 ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-[#FFF5F5] border border-[#FFD6D6]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-[#FFD6D6] rounded-full p-2">
              <Users size={16} className="text-[#E60000]" />
            </div>
            <div>
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {user?.name}
              </p>
              <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {getLinks().map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition duration-200 ${
                    isActive
                      ? 'bg-[#FFF0F0] text-[#E60000] font-medium border border-[#FFD6D6]'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-gray-700 hover:bg-[#FFF5F5] hover:text-[#E60000]'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

      </div>

    </div>
  );
};

export default Sidebar;
