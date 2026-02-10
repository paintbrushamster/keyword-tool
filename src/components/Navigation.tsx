import React from 'react';
import { Search, Sparkles, Tag } from 'lucide-react';
import './Navigation.css';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="main-navigation">
      <div className="container nav-container">
        <div className="nav-brand">
          <h1 className="nav-logo">EtsyKeyword</h1>
          <span className="nav-tagline">Etsy Keyword Research & SEO Tool</span>
        </div>

        <div className="nav-links">
          <button
            onClick={() => onNavigate('search')}
            className={`nav-link ${currentPage === 'search' ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Keyword Search</span>
          </button>

          <button
            onClick={() => onNavigate('optimizer')}
            className={`nav-link ${currentPage === 'optimizer' ? 'active' : ''}`}
          >
            <Sparkles size={18} />
            <span>AI Optimizer</span>
          </button>

          <button
            onClick={() => onNavigate('related')}
            className={`nav-link ${currentPage === 'related' ? 'active' : ''}`}
          >
            <Tag size={18} />
            <span>Related Keywords</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
