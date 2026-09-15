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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 animate-fade-in font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-10 shadow-sm transition-colors duration-200">
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <Heart className="text-primary-600 dark:text-primary-500" size={28} fill="currentColor" />
            <div>
              <span className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">OrphanCare+</span>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">Home Portal</p>
            </div>
          </Link>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-3">
            Role: <span className="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md ml-1 border border-primary-100 dark:border-blue-900/50">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-blue-950/50 text-primary-700 dark:text-primary-300 border border-primary-100/50 dark:border-blue-800/50' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}>
                  {link.icon}
                </span>
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700/60">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-rose-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center shadow-sm transition-colors duration-200">
           <div>
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Welcome back, {user.name}</h2>
               <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">OrphanCare Residential Home Operations & Live Overview</p>
           </div>
           <div className="flex items-center gap-4 sm:gap-6">
               <span className="hidden lg:inline-block bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                   {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </span>

               {/* Theme Switcher Toggle */}
               <ThemeToggle />

               <button className="relative p-2 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full shadow-sm">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-700 shadow-sm flex items-center justify-center">
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
