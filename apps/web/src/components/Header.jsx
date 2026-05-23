import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sprout, ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * transparent prop: when true the header starts invisible over a hero image
 * and transitions to solid as the user scrolls down.
 */
const Header = ({ transparent = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [scrolled, setScrolled]             = useState(false);

  const location = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated, isSeller, isEditor, isAdmin, currentUser, logout } = useAuth();
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  /* Scroll listener — becomes "solid" after 70px */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSolid = scrolled || !transparent;

  /* Dynamic classes */
  const headerBg  = isSolid
    ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
    : 'bg-transparent border-transparent';

  const logoText  = isSolid ? 'text-foreground' : 'text-white drop-shadow';
  const linkBase  = isSolid
    ? 'text-foreground/80 hover:text-primary'
    : 'text-white/85 hover:text-white drop-shadow-sm';
  const linkActive = isSolid ? 'text-primary font-semibold' : 'text-white font-bold drop-shadow';
  const iconColor  = isSolid ? 'text-foreground hover:text-primary' : 'text-white hover:text-white/80';
  const logoIcon   = isSolid ? 'bg-primary/10' : 'bg-white/15 backdrop-blur-sm';

  const navLinks = [
    { name: 'Inicio',        path: '/' },
    { name: 'Productos',     path: '/productos' },
    { name: 'Sobre Nosotros',path: '/sobre-nosotros' },
    { name: 'Contacto',      path: '/contacto' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/productos?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}
    >
      <nav className="container-custom py-3.5">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${logoIcon}`}>
              <Sprout className={`w-6 h-6 transition-colors duration-300 ${isSolid ? 'text-primary' : 'text-white'}`} />
            </div>
            <span className={`text-lg font-bold hidden sm:block transition-colors duration-300 tracking-tight ${logoText}`}>
              AGRO IMPULSO
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive(link.path) ? linkActive : linkBase
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isSeller && (
              <Link
                to="/vendedor"
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive('/vendedor')
                    ? (isSolid ? 'text-accent font-semibold' : 'text-secondary font-bold drop-shadow')
                    : (isSolid ? 'text-accent/80 hover:text-accent' : 'text-secondary/90 hover:text-secondary drop-shadow-sm')
                }`}
              >
                Panel Vendedor
              </Link>
            )}
            {isEditor && !isSeller && (
              <Link
                to="/editor"
                className={`text-sm font-medium transition-all duration-300 ${
                  isActive('/editor')
                    ? (isSolid ? 'text-accent font-semibold' : 'text-secondary font-bold drop-shadow')
                    : (isSolid ? 'text-accent/80 hover:text-accent' : 'text-secondary/90 hover:text-secondary drop-shadow-sm')
                }`}
              >
                Panel Editor
              </Link>
            )}
          </div>

          {/* Search — desktop */}
          <div className="flex-1 max-w-sm hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isSolid ? 'text-muted-foreground' : 'text-white/60'}`} />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className={`w-full pl-9 h-9 text-sm transition-all duration-300 ${
                  isSolid
                    ? 'bg-muted/60 border-transparent focus-visible:ring-primary'
                    : 'bg-white/15 border-white/20 placeholder:text-white/60 text-white focus-visible:ring-white/40 backdrop-blur-sm'
                }`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Link
              to="/carrito"
              className={`relative p-2 rounded-lg transition-all duration-300 ${iconColor}`}
              title="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-secondary text-secondary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full transition-all duration-300 ${isSolid ? '' : 'text-white hover:bg-white/15'}`}
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 text-xs text-muted-foreground font-medium truncate">
                    {currentUser?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/mi-cuenta" className="cursor-pointer">Mi Cuenta</Link>
                  </DropdownMenuItem>
                  {isSeller && (
                    <DropdownMenuItem asChild>
                      <Link to="/vendedor" className="cursor-pointer text-accent">Panel Vendedor</Link>
                    </DropdownMenuItem>
                  )}
                  {isEditor && !isSeller && (
                    <DropdownMenuItem asChild>
                      <Link to="/editor" className="cursor-pointer text-accent">Panel Editor</Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-destructive font-semibold">Panel Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`transition-all duration-300 ${isSolid ? '' : 'text-white hover:bg-white/15 border-white/20'}`}
                  >
                    Ingresar
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className={`transition-all duration-300 ${
                      isSolid
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-white text-primary hover:bg-white/90 font-bold'
                    }`}
                  >
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${iconColor}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 border-t border-border/40 pt-4 space-y-1 bg-background/98 backdrop-blur-xl rounded-2xl px-2 -mx-2 shadow-xl">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </form>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isSeller && (
              <Link
                to="/vendedor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                Panel Vendedor
              </Link>
            )}
            {isEditor && !isSeller && (
              <Link
                to="/editor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
              >
                Panel Editor
              </Link>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-3 border-t border-border mt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Ingresar</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
    {/* Spacer: compensates for fixed positioning on non-hero pages */}
    {!transparent && <div className="h-[68px] flex-shrink-0" />}
    </>
  );
};

export default Header;
