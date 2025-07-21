
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
  
  // Check if user is on empresas or parcerias pages
  const isOnEmpresasOrParcerias = location.pathname === '/empresas' || location.pathname === '/parcerias';
  
  // Handle portfolio click
  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Define navigation items based on current page
  const navItems = isOnEmpresasOrParcerias ? [
    { path: '/sobre-nos#portfolio', label: 'Portfolio', onClick: handlePortfolioClick },
    { path: '/sobre-nos', label: t('nav.sobre') },
    { path: '/blog', label: t('nav.blog') },
  ] : [
    { path: '/empresas', label: t('nav.empresas') },
    { path: '/parcerias', label: t('nav.parcerias') },
    { path: '/sobre-nos', label: t('nav.sobre') },
    { path: '/blog', label: t('nav.blog') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-center pt-4">
        <div className="glass rounded-full flex items-center space-x-6 px-8 py-3 transition-all duration-300 hover:scale-105">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src={theme === 'dark' ? '/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png' : '/lovable-uploads/73ba0359-0a2c-4f33-b272-c06f14465ceb.png'}
              alt="Notkode"
              className="h-6 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={item.onClick}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(item.path.split('#')[0])
                      ? 'bg-primary/20 text-primary'
                      : 'text-foreground/80 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Controls Section */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="lang-selector h-8 px-2">
                  <Globe className="w-3 h-3 mr-1" />
                  <span className="text-xs">{language.toUpperCase()}</span>
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
              className="glass-button w-8 h-8 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-3 h-3" />
              ) : (
                <Moon className="w-3 h-3" />
              )}
            </Button>
          </div>
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
                <Link to={item.path} onClick={item.onClick} className="w-full">
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
