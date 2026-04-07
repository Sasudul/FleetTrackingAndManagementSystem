import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Truck, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'Drivers', path: '/drivers' },
    { label: 'Trips', path: '/trips' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-pureWhite text-uberBlack font-sans text-[16px] flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-pureWhite border-b border-chipGray">
        <div className="max-w-[1136px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-[24px] font-bold font-display tracking-tight leading-none text-uberBlack flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                Fleeter
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2.5 rounded-pill text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-uberBlack text-pureWhite'
                        : 'bg-chipGray text-uberBlack hover:bg-hoverGray'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {user && (
              <span className="text-[14px] font-medium text-uberBlack">
                {user.fullName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-[16px] py-[10px] bg-chipGray text-uberBlack rounded-pill text-[14px] font-medium hover:bg-hoverGray transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-circle hover:bg-chipGray transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-uberBlack" /> : <Menu className="h-6 w-6 text-uberBlack" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-chipGray bg-pureWhite px-4 py-4 absolute w-full shadow-level-2 pb-6">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-5 py-3.5 rounded-pill text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-uberBlack text-pureWhite'
                        : 'bg-chipGray text-uberBlack active:bg-hoverGray'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-5 py-3.5 bg-chipGray text-uberBlack rounded-pill text-[14px] font-medium mt-4 active:bg-hoverGray text-left"
              >
                Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[1136px] mx-auto px-4 md:px-8 py-12 md:py-16 flex-1">
        <Outlet />
      </main>

      {/* Black Footer */}
      <footer className="bg-uberBlack text-pureWhite pt-16 pb-12 mt-auto">
        <div className="max-w-[1136px] mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 mb-10">
            <h2 className="text-[24px] font-bold font-display tracking-tight leading-none text-pureWhite">Fleeter</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="font-medium text-pureWhite text-[18px] mb-4">Company</h3>
              <ul className="space-y-3 text-mutedGray text-[14px]">
                <li><a href="#" className="hover:text-pureWhite transition-colors">About</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Newsroom</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-pureWhite text-[18px] mb-4">Products</h3>
              <ul className="space-y-3 text-mutedGray text-[14px]">
                <li><a href="#" className="hover:text-pureWhite transition-colors">Ride</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Drive</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Fleeter Freight</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-pureWhite text-[18px] mb-4">Global citizenship</h3>
              <ul className="space-y-3 text-mutedGray text-[14px]">
                <li><a href="#" className="hover:text-pureWhite transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Diversity and Inclusion</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Sustainability</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-pureWhite text-[18px] mb-4">Travel</h3>
              <ul className="space-y-3 text-mutedGray text-[14px]">
                <li><a href="#" className="hover:text-pureWhite transition-colors">Airports</a></li>
                <li><a href="#" className="hover:text-pureWhite transition-colors">Cities</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#333333] text-mutedGray text-[12px] flex flex-col md:flex-row justify-between items-center gap-6">
            <p>&copy; {new Date().getFullYear()} Fleeter Technologies Inc.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-pureWhite transition-colors">Privacy</a>
              <a href="#" className="hover:text-pureWhite transition-colors">Accessibility</a>
              <a href="#" className="hover:text-pureWhite transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;