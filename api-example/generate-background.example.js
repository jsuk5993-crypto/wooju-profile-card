// Example server endpoint for /api/generate-character
// Replace the placeholder image generation logic with your actual image API.
// Expected request body:
// {
//   prompt, champion, mainRole, subRole, tier, tags, format
// }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt } = req.body || {};

  // TODO:
  // 1) call your image generation API with `prompt`
  // 2) get back a square background-only image URL or base64
  // 3) return it in this format

  res.status(501).json({
    error: 'Connect your real image generation API here.',
    receivedPrompt: prompt,
    expectedResponseExample: {
      imageUrl: 'https://your-cdn.example.com/generated/background.png'
    }
  });
}
