import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'manager') navigate('/manager/dashboard');
    else navigate('/cashier/pos');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`rounded-2xl shadow-xl p-8 text-center max-w-md w-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}>

        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-[#FF0000] bg-opacity-20 rounded-full p-4">
            <ShieldX size={40} className="text-[#FF0000]" />
          </div>
        </div>

        {/* Text */}
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Access Denied
        </h1>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          You don't have permission to access this page.
          Please contact your administrator if you think this is a mistake.
        </p>

        {/* Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F5] text-[#E60000] border border-[#FFD6D6] px-6 py-2.5 rounded-xl font-medium text-sm transition duration-200 mx-auto"
        >
          <ArrowLeft size={16} />
          Go Back to Dashboard
        </button>

      </div>
    </div>
  );
};

export default UnauthorizedPage;