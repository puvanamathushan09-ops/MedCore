import { ArticleList } from './components/ArticleList';
import './App.css';

function App() {
  return (
    <div className="medcore-app">
      <header className="medcore-header">
        <div className="header-container">
          <div className="brand-logo">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <span className="brand-title">MedCore</span>
          </div>

          <nav className="header-nav">
            <span className="nav-item active">Articles</span>
            <span className="nav-item">Subjects</span>
            <span className="nav-item">Topics</span>
          </nav>
        </div>
      </header>

      <main className="medcore-main">
        <ArticleList />
      </main>

      <footer className="medcore-footer">
        <div className="footer-container">
          <p>&copy; {new Date().getFullYear()} MedCore Medical Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
