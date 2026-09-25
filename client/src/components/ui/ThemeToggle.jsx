import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 p-2 px-3 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 cursor-pointer ${
        isDark
          ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-amber-200'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <Moon size={18} className="text-amber-300" />
          <span className="text-xs font-semibold hidden md:inline text-slate-200">Dark</span>
        </>
      ) : (
        <>
          <Sun size={18} className="text-amber-500" />
          <span className="text-xs font-semibold hidden md:inline text-slate-700">Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;

