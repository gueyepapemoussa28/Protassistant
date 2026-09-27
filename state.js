const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

function keyFor(code) {
  return 'protocole:' + code.trim().toUpperCase();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const code = (req.query.code || '').toString();
    if (!code) return res.status(400).json({ error: "Paramètre 'code' manquant." });
    try {
      const data = await redis.get(keyFor(code));
      return res.status(200).json(data || { apiKey: '', profile: '', history: [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { code, apiKey, profile, history } = req.body || {};
    if (!code) return res.status(400).json({ error: "Champ 'code' manquant." });
    try {
      await redis.set(keyFor(code), {
        apiKey: apiKey || '',
        profile: profile || '',
        history: Array.isArray(history) ? history : []
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(405).json({ error: 'Méthode non supportée.' });
};
