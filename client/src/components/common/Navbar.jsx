import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, User, X, AlertTriangle, Bell, Package, AlertCircle, ShoppingCart, ClipboardList, UserPlus, UserX, UserCog, Boxes } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { getLowStockItems } from '../../services/inventoryService';
import { getNotifications, markAllNotificationsAsRead } from '../../services/notificationService';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const seenNotifIds = useRef(new Set());

  // Fetch notifications (only for admin and manager)
  useEffect(() => {
    if (!user || user.role === 'cashier') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const [lowStockItems, adjustmentNotifs] = await Promise.all([
          getLowStockItems(token),
          getNotifications(token)
        ]);

        const built = [];

        // Low stock / out of stock alerts
        lowStockItems.forEach((item) => {
          const name = item.product?.name || 'Unknown Product';
          const qty = item.stockQuantity;
          const threshold = item.lowStockThreshold;

          if (qty === 0) {
            built.push({
              id: `ls-${item._id}`,
              type: 'critical',
              icon: 'alert',
              title: 'Out of Stock',
              message: `${name} is completely out of stock.`,
            });
          } else {
            built.push({
              id: `ls-${item._id}`,
              type: 'warning',
              icon: 'package',
              title: 'Low Stock',
              message: `${name} has only ${qty} left (threshold: ${threshold}).`,
            });
          }
        });

        // DB notifications (stock adjustments, updates, user & product events)
        adjustmentNotifs.forEach((notif) => {
          built.push({
            id: notif._id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            reason: notif.reason,
            adjustedBy: notif.adjustedBy,
            isRead: notif.isRead,
            createdAt: notif.createdAt
          });
        });

        setNotifications(built);
        const dbTypes = ['adjustment', 'stock_update', 'user_created', 'user_role_changed', 'user_deleted', 'product_created', 'product_deleted', 'product_bulk_import'];
        const unread = built.filter(n => {
          if (dbTypes.includes(n.type)) return !n.isRead;
          return !seenNotifIds.current.has(n.id);
        }).length;
        setUnreadCount(unread);
      } catch {
        // silently fail
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications((prev) => !prev);
    setUnreadCount(0);
    // Mark all currently visible notifications as seen so the badge doesn't re-appear
    notifications.forEach(n => seenNotifIds.current.add(n.id));
    const token = localStorage.getItem('token');
    const dbTypes = ['adjustment', 'stock_update', 'user_created', 'user_role_changed', 'user_deleted', 'product_created', 'product_deleted', 'product_bulk_import'];
    if (token && notifications.some(n => dbTypes.includes(n.type) && !n.isRead)) {
      try {
        await markAllNotificationsAsRead(token);
        setNotifications(prev => prev.map(n => dbTypes.includes(n.type) ? { ...n, isRead: true } : n));
      } catch {
        // silently fail
      }
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  const criticalCount   = notifications.filter((n) => n.type === 'critical').length;
  const warningCount    = notifications.filter((n) => n.type === 'warning').length;
  const dbNotifTypes    = ['stock_adjustment', 'stock_update', 'user_created', 'user_role_changed', 'user_deleted', 'product_created', 'product_deleted', 'product_bulk_import'];
  const activityCount   = notifications.filter((n) => dbNotifTypes.includes(n.type)).length;

  const getNotifStyle = (type) => {
    if (type === 'critical') return { bg: 'bg-[#FFF0F0]', text: 'text-[#FF0000]', icon: <AlertCircle size={14} /> };
    if (type === 'warning')  return { bg: 'bg-yellow-100', text: isDark ? 'text-yellow-400' : 'text-yellow-600', icon: <Package size={14} /> };
    if (type === 'user_created')      return { bg: 'bg-green-100', text: 'text-green-600', icon: <UserPlus size={14} /> };
    if (type === 'user_deleted')      return { bg: 'bg-[#FFF0F0]',   text: 'text-[#FF0000]',   icon: <UserX size={14} /> };
    if (type === 'user_role_changed') return { bg: 'bg-[#FFF0F0]', text: 'text-[#E60000]', icon: <UserCog size={14} /> };
    if (type === 'product_created' || type === 'product_bulk_import') return { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <Boxes size={14} /> };
    if (type === 'product_deleted')   return { bg: 'bg-orange-100', text: 'text-orange-600', icon: <Boxes size={14} /> };
    // stock_adjustment, stock_update
    return { bg: 'bg-[#FFF0F0]', text: isDark ? 'text-[#FF3333]' : 'text-[#E60000]', icon: <ClipboardList size={14} /> };
  };

  return (
    <>
      <div className="bg-white text-[#E60000] border-b border-[#FFD6D6] px-6 py-3 flex justify-between items-center shadow-sm">

        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-[#E60000] hover:text-[#CC0000] transition duration-200 p-1 rounded hover:bg-[#FFF5F5]"
          >
            <Menu size={22} />
          </button>
          <h1 className="brand-name text-xl">SwiftSale</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#FFF5F5] hover:bg-[#FFF0F0] text-[#E60000] border border-[#FFD6D6] transition duration-200"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell — hidden for cashier */}
          {user?.role !== 'cashier' && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleOpenNotifications}
                className="relative p-2 rounded-lg bg-[#FFF5F5] hover:bg-[#FFF0F0] text-[#E60000] border border-[#FFD6D6] transition duration-200"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#E60000] border border-[#FFD6D6] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}>

                  {/* Header */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${
                    isDark ? 'border-slate-700' : 'border-gray-100'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-[#E60000]" />
                      <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Notifications
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <span className="text-xs bg-[#FFF0F0] text-[#E60000] font-medium px-2 py-0.5 rounded-full">
                          {notifications.length} alert{notifications.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary row */}
                  {notifications.length > 0 && (
                    <div className={`flex flex-wrap gap-2 px-4 py-2 border-b ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-gray-50'}`}>
                      {criticalCount > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-[#FFF0F0] text-[#E60000] px-2 py-1 rounded-full font-medium">
                          <AlertCircle size={11} /> {criticalCount} Out of Stock
                        </span>
                      )}
                      {warningCount > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                          <Package size={11} /> {warningCount} Low Stock
                        </span>
                      )}
                      {activityCount > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-[#FFF0F0] text-[#CC0000] px-2 py-1 rounded-full font-medium">
                          <ClipboardList size={11} /> {activityCount} Activit{activityCount > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <ShoppingCart size={32} className={isDark ? 'text-slate-600' : 'text-gray-300'} />
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                          All stock levels are good
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const style = getNotifStyle(notif.type);
                        const isDbNotif = dbNotifTypes.includes(notif.type);
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              const path = user?.role === 'manager' ? '/manager/inventory' : '/admin/inventory';
                              navigate(path);
                              setShowNotifications(false);
                            }}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b last:border-0 transition ${
                              isDark
                                ? 'border-slate-700 hover:bg-slate-700'
                                : 'border-gray-100 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${style.bg} ${style.text}`}>
                              {style.icon}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold ${style.text}`}>
                                {notif.title}
                              </p>
                              <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {notif.message}
                              </p>
                              {isDbNotif && notif.adjustedBy && (
                                <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                  By {notif.adjustedBy.name} ({notif.adjustedBy.role})
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className={`px-4 py-2.5 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
                      <button
                        onClick={() => {
                          const path = user?.role === 'manager' ? '/manager/inventory' : '/admin/inventory';
                          navigate(path);
                          setShowNotifications(false);
                        }}
                        className="w-full text-xs text-[#FF0000] hover:text-[#E60000] font-medium text-center transition"
                      >
                        Go to Inventory Management →
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-2 bg-white border border-[#FFD6D6] rounded-lg px-3 py-2">
            <div className="bg-[#FFF5F5] border border-[#FFD6D6] p-2 rounded-full text-[#E60000]">
              <User size={16} />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-none text-[#E60000]">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] text-sm px-4 py-2 rounded-lg transition duration-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
          <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF0000] rounded-full p-2">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  Confirm Logout
                </h2>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={18} />
              </button>
            </div>

            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Are you sure you want to log out? Any unsaved changes will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] py-2.5 rounded-xl text-sm font-medium transition duration-200"
              >
                <LogOut size={16} />
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition duration-200 ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
