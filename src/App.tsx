import { useState } from 'react';
import Navigation from './components/Navigation';
import KeywordSearch from './components/KeywordSearch';
import AiOptimizer from './components/AiOptimizer';
import RelatedKeywordsTest from './components/RelatedKeywordsTest';

type Page = 'search' | 'optimizer' | 'related';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('search');

  return (
    <div className="app">
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
      />

      <main>
        {currentPage === 'search' && <KeywordSearch />}
        {currentPage === 'optimizer' && <AiOptimizer />}
        {currentPage === 'related' && <RelatedKeywordsTest />}
      </main>
    </div>
  );
}

export default App;
