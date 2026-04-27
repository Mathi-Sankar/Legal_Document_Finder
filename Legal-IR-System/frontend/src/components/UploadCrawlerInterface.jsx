import React, { useState } from 'react';
import { UploadCloud, Globe, Server, CheckCircle2 } from 'lucide-react';

const UploadCrawlerInterface = () => {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState('1952');
  const [keyword, setKeyword] = useState('');
  const [caseName, setCaseName] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStatus({ type: '', msg: '' });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if(res.ok) {
        setStatus({ type: 'success', msg: `Successfully uploaded ${file.name}. Parsed Crime: ${data.metadata.crime_type}, Date: ${data.metadata.date}` });
      } else {
        setStatus({ type: 'error', msg: 'Upload failed' });
      }
    } catch(e) {
      setStatus({ type: 'error', msg: 'Connection Error' });
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const handleCrawl = async () => {
    if (!year) return;
    setIsCrawling(true);
    setStatus({ type: '', msg: 'Initializing native headless crawler... Please wait.' });

    try {
      const res = await fetch('http://localhost:8000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            year: parseInt(year), 
            keyword: keyword,
            case_name: caseName,
            max_pages: 1 
        }),
      });
      const data = await res.json();
      if(res.ok) {
        setStatus({ type: 'success', msg: data.message });
      }
    } catch(e) {
      setStatus({ type: 'error', msg: 'Failed to start crawler' });
    } finally {
      setIsCrawling(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%', height: '100%', alignItems: 'center' }}>
      
      {/* Manual Upload */}
      <div className="glass-panel" style={{ flex: 1, height: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud className="text-gradient" /> Manual Upload
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          Directly upload PDF legal documents. The system will extract metadata (Date, Crime Type) automatically.
        </p>

        <div className="upload-zone" onClick={() => document.getElementById('file-upload').click()}>
          <Server size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <p style={{ margin: 0 }}>{file ? file.name : 'Click or Drag PDF to Upload'}</p>
          <input 
            id="file-upload" 
            type="file" 
            accept=".pdf" 
            style={{ display: 'none' }} 
            onChange={e => setFile(e.target.files[0])}
          />
        </div>

        <button 
          className="btn" 
          style={{ marginTop: 'auto' }} 
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? 'Processing Document Chunks...' : 'Upload & Process Data'}
        </button>
      </div>

      {/* Web Crawler */}
      <div className="glass-panel" style={{ flex: 1, height: '450px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe className="text-gradient" /> Web Crawler (IndianKanoon)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Trigger the headless scraper to traverse pages and insert records in the background.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Year to Scrape</label>
            <input 
                type="number" 
                className="input-field" 
                value={year} 
                onChange={e => setYear(e.target.value)} 
                placeholder="e.g. 1952" 
            />
            </div>

            <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Crime/Keyword</label>
            <input 
                type="text" 
                className="input-field" 
                value={keyword} 
                onChange={e => setKeyword(e.target.value)} 
                placeholder="e.g. Theft" 
            />
            </div>
        </div>

        <div className="input-group" style={{ marginBottom: '8px' }}>
          <label className="input-label">Extact Case Name (Optional)</label>
          <input 
            type="text" 
            className="input-field" 
            value={caseName} 
            onChange={e => setCaseName(e.target.value)} 
            placeholder="e.g. State vs John" 
          />
        </div>

        <button 
          className="btn btn-secondary" 
          style={{ marginTop: 'auto', width: '100%' }}
          onClick={handleCrawl}
          disabled={isCrawling}
        >
          {isCrawling ? 'Initializing Crawler...' : 'Start Background Crawler'}
        </button>
      </div>

      {/* Status Bar */}
      {status.msg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px 24px',
          borderRadius: '8px',
          background: status.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 197, 94, 0.9)',
          backdropFilter: 'blur(4px)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fade-in 0.3s ease'
        }}>
          {status.type === 'success' && <CheckCircle2 />}
          {status.msg}
        </div>
      )}

    </div>
  );
};

export default UploadCrawlerInterface;
