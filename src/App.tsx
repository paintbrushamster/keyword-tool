import { useState } from 'react';
import Navigation from './components/Navigation';
import KeywordResearchTool from './components/KeywordResearchTool';
import RelatedKeywordsTest from './components/RelatedKeywordsTest';

type Page = 'main' | 'related';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');

  return (
    <div className="app">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={(page) => setCurrentPage(page as Page)} 
      />
      
      <main>
        {currentPage === 'main' ? <KeywordResearchTool /> : <RelatedKeywordsTest />}
      </main>
    </div>
  );
}

export default App;