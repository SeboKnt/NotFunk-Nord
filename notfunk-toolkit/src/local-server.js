import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkWebsiteDetailed, checkWikipediaReference, checkApiStatus } from './status-check.js';

// Für __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notfunk-local-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Status check endpoints
app.get('/api/status/website', async (req, res) => {
  try {
    const result = await checkWebsiteDetailed();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status/wikipedia', async (req, res) => {
  try {
    const result = await checkWikipediaReference();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status/all', async (req, res) => {
  try {
    const [website, wikipedia, api] = await Promise.all([
      checkWebsiteDetailed(),
      checkWikipediaReference(),
      checkApiStatus()
    ]);
    
    res.json({
      website,
      wikipedia,
      api,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Fallback routes for SPA
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.get('/tools', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`📡 NotFunk-Nord Development Server läuft auf Port ${PORT}`);
  console.log(`📱 Website: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status/all`);
});

export default app;