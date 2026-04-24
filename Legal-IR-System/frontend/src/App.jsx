import React, { useState } from 'react';
import SearchInterface from './components/SearchInterface';
import UploadCrawlerInterface from './components/UploadCrawlerInterface';
import { Scale } from 'lucide-react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px' }}>
            <Scale color="white" size={24} />
          </div>
          <h2 style={{ margin: 0 }} className="text-gradient">LexRetrieve</h2>
        </div>

        <div className="tabs" style={{ flexDirection: 'column', border: 'none', padding: 0 }}>
          <div 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Smart Search
          </div>
          <div 
            className={`tab ${activeTab === 'ingest' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingest')}
          >
            Data Ingestion
          </div>
        </div>

        <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Legal Information Retrieval System<br/>v1.0.0
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {activeTab === 'search' ? <SearchInterface /> : <UploadCrawlerInterface />}
      </div>
    </div>
  );
}

export default App;
