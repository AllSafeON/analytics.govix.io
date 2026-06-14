const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3030;
const DATA_FILE = path.join(__dirname, 'data.json');

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

app.listen(PORT, () => console.log(`analytics-api running on port ${PORT}`));
