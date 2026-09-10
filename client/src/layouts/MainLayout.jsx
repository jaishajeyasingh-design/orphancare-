import React, { useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    <div className="flex min-h-screen bg-slate-50 animate-fade-in font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Heart className="text-primary-600" size={28} fill="currentColor" />
            <span className="font-bold text-xl text-slate-800 tracking-tight">OrphanCare+</span>
          </Link>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
            Role: <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md ml-1">{user.role}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-primary-600' : 'text-slate-400'}>
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
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-rose-500" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
           <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back, {user.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Here is your overview for today.</p>
           </div>
           <div className="flex items-center gap-6">
               <span className="hidden sm:inline-block bg-white border border-slate-200 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 shadow-sm">
                   {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </span>
               <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white border border-slate-200 rounded-full shadow-sm">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shadow-sm">
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
