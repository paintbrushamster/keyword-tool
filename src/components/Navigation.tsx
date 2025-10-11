import React from 'react';
import { Search, Sparkles } from 'lucide-react';
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
          <h1 className="nav-logo">KeywordPro</h1>
          <span className="nav-tagline">SEO Keyword Research Tool</span>
        </div>

        <div className="nav-links">
          <button
            onClick={() => onNavigate('main')}
            className={`nav-link ${currentPage === 'main' ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Keyword Research</span>
          </button>

          <button
            onClick={() => onNavigate('related')}
            className={`nav-link ${currentPage === 'related' ? 'active' : ''}`}
          >
            <Sparkles size={18} />
            <span>Related Keywords</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;