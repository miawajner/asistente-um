export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey  = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    console.error('Missing ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY env vars');
    return res.status(500).json({ error: 'Server configuration missing' });
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey } }
    );

    if (!upstream.ok) {
      const body = await upstream.text();
      console.error(`ElevenLabs ${upstream.status}:`, body);
      return res.status(502).json({ error: `ElevenLabs error: ${upstream.status}` });
    }

    const { signed_url } = await upstream.json();
    return res.status(200).json({ signedUrl: signed_url });

  } catch (err) {
    console.error('get-signed-url:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
