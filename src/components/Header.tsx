import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/empresas', label: t('nav.empresas') },
    { path: '/parcerias', label: t('nav.parcerias') },
    { path: '/sobre-nos', label: t('nav.sobre') },
    { path: '/blog', label: t('nav.blog') },
  ];

  return (
    <header className="glass-header h-16 border-b border-white/10">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-sora font-bold text-xl text-gradient group-hover:scale-105 transition-transform">
            Notkode
          </span>
        </Link>

        {/* Navigation Menu - Hidden on mobile */}
        <nav className="hidden md:flex items-center">
          <div className="nav-menu flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-primary/20 text-primary'
                    : 'text-foreground/80 hover:text-primary hover:bg-primary/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="lang-selector">
                <Globe className="w-4 h-4 mr-1" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => setLanguage('pt')}>
                Português (BR)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            className="glass-button w-10 h-10 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation - Dropdown for smaller screens */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="fixed top-4 right-16 z-50">
              <span className="sr-only">Menu</span>
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current mb-1"></div>
                <div className="w-4 h-0.5 bg-current"></div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass w-48">
            {navItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link to={item.path} className="w-full">
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;