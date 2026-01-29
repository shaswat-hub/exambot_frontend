import { useEffect, useState } from "react";
import App from './App';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Home Component
const Home = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultType, setResultType] = useState(null);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    loadAds();
    trackVisitor();
  }, []);

  const loadAds = async () => {
    try {
      const response = await axios.get(`${API}/admin/ads`);
      setAds(response.data);
    } catch (e) {
      console.error("Error loading ads:", e);
    }
  };

  const trackVisitor = async () => {
    try {
      await axios.post(`${API}/visitor/track`, null, {
        params: { ip_address: "user_" + Date.now() }
      });
    } catch (e) {
      console.error("Error tracking visitor:", e);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertToBase64 = (dataUrl) => {
    return dataUrl.split(',')[1];
  };

  const handleGenerateSummary = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);
    setResult(null);
    setResultType('summary');

    try {
      const base64Images = images.map(convertToBase64);
      const response = await axios.post(`${API}/generate/summary`, {
        images: base64Images
      });
      setResult(response.data.result);
    } catch (e) {
      console.error("Error generating summary:", e);
      alert("Error generating summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);
    setResult(null);
    setResultType('questions');

    try {
      const base64Images = images.map(convertToBase64);
      const response = await axios.post(`${API}/generate/questions`, {
        images: base64Images
      });
      setResult(response.data.result);
    } catch (e) {
      console.error("Error generating questions:", e);
      alert("Error generating questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getAdByPosition = (position) => {
    return ads.find(ad => ad.position === position);
  };

  const renderAdBlock = (position, label) => {
    const ad = getAdByPosition(position);
    return (
      <div className="ad-block" data-testid={`ad-${position}`}>
        <div className="ad-label">{label}</div>
        {ad && ad.image_url ? (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
            <img src={ad.image_url} alt={label} className="ad-image" />
          </a>
        ) : (
          <div className="ad-placeholder">Ad Placeholder</div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <a href="/" className="logo" data-testid="logo">Exam Bot</a>
        </div>
      </header>

      <div className="mobile-ads">
        {renderAdBlock('top', 'Sponsored')}
      </div>

      <div className="main-layout">
        <aside className="ad-column">
          {renderAdBlock('left1', 'Sponsored')}
          {renderAdBlock('left2', 'Sponsored')}
        </aside>

        <main className="content-area">
          <h1 className="content-title" data-testid="main-title">Exam Bot - AI Study Assistant</h1>
          <p className="content-subtitle">Upload your study materials and generate summaries or question papers instantly</p>

          <div className="upload-zone" onClick={() => document.getElementById('file-input').click()} data-testid="upload-zone">
            <div className="upload-icon">📁</div>
            <h3>Upload Images</h3>
            <p>Click to select images from your gallery</p>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              data-testid="file-input"
            />
          </div>

          {images.length > 0 && (
            <div className="image-preview-grid" data-testid="image-preview-grid">
              {images.map((img, index) => (
                <div key={index} className="image-preview-item" data-testid={`image-preview-${index}`}>
                  <img src={img} alt={`Preview ${index + 1}`} />
                  <button
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                    data-testid={`remove-image-${index}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleGenerateSummary}
              disabled={loading || images.length === 0}
              data-testid="summary-btn"
            >
              📝 Generate Summary
            </button>
            <button
              className="btn btn-primary"
              onClick={handleGenerateQuestions}
              disabled={loading || images.length === 0}
              data-testid="questions-btn"
            >
              📋 Generate Question Paper
            </button>
            {images.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => setImages([])}
                disabled={loading}
                data-testid="clear-btn"
              >
                🗑️ Clear All
              </button>
            )}
          </div>

          {loading && (
            <div className="loading" data-testid="loading">
              <div className="loading-spinner"></div>
            </div>
          )}

          {result && (
            <div className="result-container" data-testid="result-container">
              <h2 className="result-title">
                {resultType === 'summary' ? '📝 Summary' : '📋 Question Paper'}
              </h2>
              <div className="result-content">{result}</div>
            </div>
          )}
        </main>

        <aside className="ad-column">
          {renderAdBlock('right1', 'Sponsored')}
          {renderAdBlock('right2', 'Sponsored')}
        </aside>
      </div>

      <div className="mobile-ads">
        {renderAdBlock('bottom', 'Sponsored')}
      </div>
    </div>
  );
};

// Admin Component
const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState([]);
  const [editingAd, setEditingAd] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      loadStats();
      loadAds();
      const interval = setInterval(loadStats, 5000); // Refresh stats every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${API}/admin/login`, {
        username,
        password
      });

      if (response.data.success) {
        setIsLoggedIn(true);
      } else {
        setError(response.data.message);
      }
    } catch (e) {
      setError("Login failed. Please try again.");
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  };

  const loadAds = async () => {
    try {
      const response = await axios.get(`${API}/admin/ads`);
      setAds(response.data);
    } catch (e) {
      console.error("Error loading ads:", e);
    }
  };

  const handleAdUpdate = async (position) => {
    const adData = editingAd[position];
    if (!adData || !adData.image_url || !adData.link_url) {
      alert("Please provide both image URL and link URL");
      return;
    }

    try {
      await axios.post(`${API}/admin/ads`, {
        position,
        image_url: adData.image_url,
        link_url: adData.link_url
      });
      alert("Ad updated successfully!");
      loadAds();
    } catch (e) {
      alert("Error updating ad. Please try again.");
    }
  };

  const updateEditingAd = (position, field, value) => {
    setEditingAd(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        [field]: value
      }
    }));
  };

  const getAdByPosition = (position) => {
    return ads.find(ad => ad.position === position) || {};
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h1 className="admin-title" data-testid="admin-title">Admin Login</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="username-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                required
              />
            </div>
            {error && <div className="error-message" data-testid="error-message">{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} data-testid="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <a href="/admin" className="logo" data-testid="admin-logo">Exam Bot Admin</a>
          <a href="/" className="btn btn-secondary" data-testid="home-link">Back to Home</a>
        </div>
      </header>

      <div style={{ padding: 'var(--space-8)' }}>
        <div className="admin-card">
          <h2 className="admin-title" data-testid="stats-title">Visitor Analytics</h2>
          
          {stats && (
            <div className="stats-grid">
              <div className="stat-card" data-testid="stat-realtime">
                <div className="stat-value">{stats.realtime}</div>
                <div className="stat-label">Real-time (5 min)</div>
              </div>
              <div className="stat-card" data-testid="stat-daily">
                <div className="stat-value">{stats.daily}</div>
                <div className="stat-label">Daily Visitors</div>
              </div>
              <div className="stat-card" data-testid="stat-weekly">
                <div className="stat-value">{stats.weekly}</div>
                <div className="stat-label">Weekly Visitors</div>
              </div>
              <div className="stat-card" data-testid="stat-monthly">
                <div className="stat-value">{stats.monthly}</div>
                <div className="stat-label">Monthly Visitors</div>
              </div>
            </div>
          )}

          <h2 className="admin-title" style={{ marginTop: 'var(--space-12)' }} data-testid="ad-management-title">Ad Management</h2>
          
          <div className="ad-management-grid">
            {['left1', 'left2', 'right1', 'right2', 'top', 'bottom'].map(position => {
              const ad = getAdByPosition(position);
              const editing = editingAd[position] || {};
              return (
                <div key={position} className="ad-edit-card" data-testid={`ad-edit-${position}`}>
                  <h3 className="ad-edit-title">{position.toUpperCase()}</h3>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={ad.image_url || "Enter image URL"}
                      value={editing.image_url || ''}
                      onChange={(e) => updateEditingAd(position, 'image_url', e.target.value)}
                      data-testid={`image-url-${position}`}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={ad.link_url || "Enter link URL"}
                      value={editing.link_url || ''}
                      onChange={(e) => updateEditingAd(position, 'link_url', e.target.value)}
                      data-testid={`link-url-${position}`}
                    />
                  </div>
                  {(editing.image_url || ad.image_url) && (
                    <div className="ad-preview">
                      <img src={editing.image_url || ad.image_url} alt={`${position} preview`} />
                    </div>
                  )}
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 'var(--space-4)' }}
                    onClick={() => handleAdUpdate(position)}
                    data-testid={`update-ad-${position}`}
                  >
                    Update Ad
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
