const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const urlDatabase = {};
const baseUrl = 'http://localhost:' + PORT + '/';

// Simple function to generate a short id
function generateShortId() {
  return Math.random().toString(36).substring(2, 8);
}

// API endpoint to shorten URL
app.post('/api/shorten', (req, res) => {
  const originalUrl = req.body.url;
  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Check if URL already shortened
  for (const key in urlDatabase) {
    if (urlDatabase[key].original === originalUrl) {
      return res.json({ shortUrl: baseUrl + key });
    }
  }

  const shortId = generateShortId();
  urlDatabase[shortId] = { original: originalUrl, clicks: 0 };
  res.json({ shortUrl: baseUrl + shortId });
});

// Redirect short URL to original URL and count clicks
app.get('/:shortId', (req, res) => {
  const shortId = req.params.shortId;
  const entry = urlDatabase[shortId];
  if (entry) {
    entry.clicks++;
    res.redirect(entry.original);
  } else {
    res.status(404).send('URL not found');
  }
});

// Endpoint to get click count (optional)
app.get('/api/clicks/:shortId', (req, res) => {
  const shortId = req.params.shortId;
  const entry = urlDatabase[shortId];
  if (entry) {
    res.json({ clicks: entry.clicks });
  } else {
    res.status(404).json({ error: 'Short URL not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
