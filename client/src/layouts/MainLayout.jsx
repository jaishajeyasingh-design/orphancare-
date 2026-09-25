import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import { LayoutDashboard, Users, Heart, LogOut, Bell, Search, FileText, Megaphone, Sparkles, Award, TrendingUp, ShieldCheck, UserCheck } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Base navigation links
  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Children', path: '/children', icon: <Users size={18} /> },
    { name: 'Opportunities', path: '/opportunities', icon: <Award size={18} /> },
    { name: 'Requirements', path: '/requirements', icon: <Megaphone size={18} /> },
    { name: 'Donations', path: '/donations', icon: <Heart size={18} /> },
    { name: 'Volunteers', path: '/volunteers', icon: <UserCheck size={18} /> },
    { name: 'AI Matching', path: '/matching', icon: <Sparkles size={18} /> },
    { name: 'Development', path: '/development', icon: <TrendingUp size={18} /> },
    { name: 'Progress', path: '/progress', icon: <FileText size={18} /> },
    { name: 'Impact', path: '/impact', icon: <ShieldCheck size={18} /> },
  ];

  if (user.role === 'Admin' || user.role === 'Organization') {
      links.push({ name: 'Manage Residents', path: '/residents', icon: <Users size={20} /> });
  }

  if (user.role === 'Adopter' || user.role === 'Donor') {
      links.push({ name: 'Available Children', path: '/adopter/children', icon: <Search size={20} /> });
      links.push({ name: 'My Requests', path: '/adopter/my-requests', icon: <FileText size={20} /> });
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 animate-fade-in font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-xs transition-colors duration-200">
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 shadow-2xs">
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">OrphanCare+</span>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold -mt-0.5">Home Portal</p>
            </div>
          </Link>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 flex items-center gap-1.5">
            <span>Role:</span>
            <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md font-bold border border-blue-100">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-semibold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 text-sm transition-colors"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-rose-600" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-2xs transition-colors duration-200">
           <div>
               <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name}</h2>
               <p className="text-sm text-slate-500 mt-0.5">OrphanCare Residential Home Operations & Live Overview</p>
           </div>
           <div className="flex items-center gap-4 sm:gap-5">
               <span className="hidden lg:inline-block bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 shadow-2xs">
                   {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </span>

               {/* Theme Switcher Toggle */}
               <ThemeToggle />

               <button className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors bg-white border border-slate-200 rounded-full shadow-2xs">
                 <Bell size={18} />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
               </button>
               <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200 shadow-2xs flex items-center justify-center text-sm">
                 {user.name.charAt(0).toUpperCase()}
               </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

