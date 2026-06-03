// Vercel serverless function — proxies MLB Stats API & ESPN with CORS + edge caching.
// Lives at /api/mlb on your deployed site. No API key needed.
export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).json({ error: 'missing url param' });
    return;
  }
  // Only allow the two trusted hosts (safety)
  if (!/^https:\/\/(statsapi\.mlb\.com|site\.api\.espn\.com)\//.test(target)) {
    res.status(403).json({ error: 'host not allowed' });
    return;
  }
  try {
    const r = await fetch(target, { headers: { 'User-Agent': 'BaseLine/1.0' } });
    const data = await r.json();
    // Cache at Vercel's edge: fresh for 15s, serve stale up to 30s while revalidating.
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: String(e) });
  }
}
