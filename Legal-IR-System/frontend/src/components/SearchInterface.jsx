import React, { useState } from 'react';
import { Search, Filter, Loader2, BookOpen } from 'lucide-react';

const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ date: '', crime_type: '', case_name: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() && !filters.date && !filters.crime_type && !filters.case_name) return;
    
    setLoading(true);
    // Clear previous results and summaries
    setResults(null); 
    setSummaries({});
    try {
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, filters })
      });
      const data = await response.json();
      setResults(data.sources || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoubleClick = async (index, text) => {
    if (summaries[index] || summaryLoading[index]) return;
    
    setSummaryLoading(prev => ({ ...prev, [index]: true }));
    try {
      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query || 'Summarize this case segment.', text })
      });
      const data = await response.json();
      setSummaries(prev => ({ ...prev, [index]: data.summary }));
    } catch (error) {
      setSummaries(prev => ({ ...prev, [index]: 'Error generating summary.' }));
    } finally {
      setSummaryLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '16px', height: '100%' }}>
      {/* Search & Filters Column */}
      <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
        <h3>Search Details</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="input-group">
            <label className="input-label">Natural Language Query</label>
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="e.g. Find cases similar to property dispute from 2012 where..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', margin: '8px 0' }} />
          
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filters
          </h4>
          
          <div className="input-group">
            <label className="input-label">Date / Year</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="e.g. 1952" 
              value={filters.date}
              onChange={e => setFilters({...filters, date: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Crime Type / Category</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="e.g. Theft, Homicide" 
              value={filters.crime_type}
              onChange={e => setFilters({...filters, crime_type: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Case Name</label>
            <input 
              className="input-field" 
              type="text" 
              placeholder="e.g. State vs John" 
              value={filters.case_name}
              onChange={e => setFilters({...filters, case_name: e.target.value})}
            />
          </div>

          <button type="submit" className="btn" style={{ marginTop: 'auto' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search Engine'}
          </button>
        </form>
      </div>

      {/* Results Column */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
        <h2>Retrieval & Intelligence</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          Double-click any result title to instantly generate an AI summary for that specific snippet.
        </p>
        
        <div>
          <h3 style={{ marginBottom: '16px' }}>Retrieved Document Chunks {results && `(${results.length})`}</h3>
          
          {!results && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              <Search size={48} opacity={0.2} style={{ margin: '0 auto 16px' }} />
              <p>Enter a query and apply filters to begin finding cases.</p>
            </div>
          )}

          {results && results.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No exact matches found. Try broadening your filters.</p>
          )}

          {results && results.map((res, i) => (
            <div key={i} className="glass-panel result-card">
              <h4 
                className="result-title" 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onDoubleClick={() => handleDoubleClick(i, res.text)}
                title="Double click to generate AI summary"
              >
                {res.metadata.filename || res.metadata.case_name}
                {summaryLoading[i] && <Loader2 className="animate-spin" size={14} style={{ color: 'var(--text-muted)' }}/>}
              </h4>
              
              <div className="result-meta">
                <span className="badge">{res.metadata.crime_type || 'Unknown'}</span>
                <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8' }}>
                  {res.metadata.date || 'No Date'}
                </span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>Distance: {res.score?.toFixed(3)}</span>
              </div>
              
              {summaries[i] && (
                <div className="rag-box" style={{ margin: '12px 0', padding: '12px' }}>
                  <h4 style={{ color: '#d8b4fe', margin: '0 0 8px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} /> Local AI Insight
                  </h4>
                  <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0 }}>{summaries[i]}</p>
                </div>
              )}

              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {res.text.length > 500 ? res.text.substring(0, 500) + '...' : res.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;
