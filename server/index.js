const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3030;
const DATA_FILE = path.join(__dirname, 'data.json');
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// GET /api/data — отдать сохранённые данные
app.get('/api/data', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json({ data: null, fileName: null, uploadedAt: null });
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: 'Read error' });
  }
});

// POST /api/data — сохранить новые данные
app.post('/api/data', (req, res) => {
  const { data, fileName } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'data must be array' });
  }
  const payload = { data, fileName: fileName || 'unknown.csv', uploadedAt: new Date().toISOString() };
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload));
    res.json({ ok: true, rows: data.length });
  } catch (e) {
    res.status(500).json({ error: 'Write error' });
  }
});

// DELETE /api/data — сбросить данные
app.delete('/api/data', (req, res) => {
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
  res.json({ ok: true });
});

// POST /api/claude — proxy к Anthropic API
app.post('/api/claude', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set on server' });

  const body = JSON.stringify({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const apiReq = https.request(options, apiRes => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.error) return res.status(500).json({ error: json.error.message });
        res.json({ text: json.content?.[0]?.text || '' });
      } catch (e) {
        res.status(500).json({ error: 'Parse error' });
      }
    });
  });
  apiReq.on('error', e => res.status(500).json({ error: e.message }));
  apiReq.write(body);
  apiReq.end();
});

app.listen(PORT, () => console.log(`analytics-api running on port ${PORT}`));
