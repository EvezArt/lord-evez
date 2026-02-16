function classifyIntent(message) {
  const text = message.toLowerCase();
  if (text.includes('status') || text.includes('health')) return 'status';
  if (text.includes('help') || text.includes('what can you do')) return 'help';
  if (text.includes('next') || text.includes('plan')) return 'plan';
  if (text.includes('remember') || text.includes('continuity')) return 'continuity';
  return 'general';
}

function buildReply(intent, message, context) {
  if (intent === 'status') {
    return `System status is operational. Coherence ${context.coherencePct}%, mapping confidence ${context.awarenessConfidencePct}%.`;
  }
  if (intent === 'help') {
    return 'I can summarize state, suggest next actions, generate handoff prompts, and explain metric panels.';
  }
  if (intent === 'plan') {
    return 'Next action: capture current blockers, save continuity profile, and run one measurable step before handoff.';
  }
  if (intent === 'continuity') {
    return 'Continuity mode: persist identity anchors + mission + prompt in the Continuity Bridge panel, then export handoff JSON.';
  }
  return `Received: "${message}". I am tracking your context and can convert this into an actionable next-step plan.`;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return {};
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.method === 'POST' ? parseBody(req) : req.query || {};
  const message = String(payload.message || 'status').trim();
  const intent = classifyIntent(message);

  const context = {
    coherencePct: Number(payload.coherencePct || 0),
    awarenessConfidencePct: Number(payload.awarenessConfidencePct || 0),
  };

  const reply = buildReply(intent, message, context);

  return res.status(200).json({
    status: 'ok',
    intent,
    message,
    reply,
    generatedAt: Date.now(),
  });
}
