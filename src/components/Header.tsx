
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
  
  // Check if user is on companies or agencies pages
  const isOnCompaniesOrAgencies = location.pathname === '/companies' || location.pathname === '/agencies';
  
  // Handle portfolio click
  const handlePortfolioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle language toggle
  const handleLanguageToggle = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };
  
  // Define navigation items based on current page
  const navItems = isOnCompaniesOrAgencies ? [
    { path: '/about-us#portfolio', label: 'Portfolio', onClick: handlePortfolioClick },
    { path: '/about-us', label: t('nav.sobre') },
    { path: '/blog', label: t('nav.blog') },
  ] : [
    { path: '/companies', label: t('nav.empresas') },
    { path: '/agencies', label: t('nav.parcerias') },
    { path: '/about-us', label: t('nav.sobre') },
    { path: '/blog', label: t('nav.blog') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      <div className="w-full px-4 md:container md:mx-auto h-full flex items-center justify-center pt-4">
        <div className="glass rounded-full flex items-center space-x-2 md:space-x-6 px-4 md:px-8 py-3 transition-all duration-300 hover:scale-105 max-w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img 
              src={theme === 'dark' ? '/lovable-uploads/6beced90-2174-433f-9c99-a27a4e5372e8.png' : '/lovable-uploads/73ba0359-0a2c-4f33-b272-c06f14465ceb.png'}
              alt="Notkode"
              className="h-5 md:h-6 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Navigation Menu - Hidden on mobile */}
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
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
            {/* Direct Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLanguageToggle}
              className="lang-selector h-8 px-2 hover:bg-primary/10 transition-colors"
            >
              <Globe className="w-3 h-3 mr-1" />
              <span className="text-xs font-medium">{language.toUpperCase()}</span>
            </Button>

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

            {/* Mobile Navigation Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <span className="sr-only">Menu</span>
                    <div className="w-4 h-4 flex flex-col justify-center items-center">
                      <div className="w-3 h-0.5 bg-current mb-0.5"></div>
                      <div className="w-3 h-0.5 bg-current mb-0.5"></div>
                      <div className="w-3 h-0.5 bg-current"></div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass w-48 bg-background border-border">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
