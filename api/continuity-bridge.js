function parseJson(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function withFallback(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const overrides = parseJson(process.env.CONTINUITY_PROFILE_JSON) || {};
  const userAlias = withFallback(req.query?.userAlias, withFallback(overrides.userAlias, 'Operator'));
  const assistantAlias = withFallback(req.query?.assistantAlias, withFallback(overrides.assistantAlias, 'LORD Copilot'));

  const profile = {
    userAlias,
    assistantAlias,
    sharedMission: withFallback(
      overrides.sharedMission,
      'Keep context continuity across sessions and maintain execution-ready plans.',
    ),
    continuityRules: Array.isArray(overrides.continuityRules) && overrides.continuityRules.length
      ? overrides.continuityRules
      : [
          'Summarize latest state in compact bullets before ending each run.',
          'Store identity anchors and active goals so next session can restore quickly.',
          'Keep prompts executable, specific, and measurable.',
        ],
    promptKit: {
      systemPrompt: withFallback(
        overrides.systemPrompt,
        'You are a continuity-first agent. Rehydrate identity, goals, and constraints before planning.',
      ),
      handoffPrompt: withFallback(
        overrides.handoffPrompt,
        'Produce a handoff note with: current state, active tasks, blockers, next command.',
      ),
      memoryPrompt: withFallback(
        overrides.memoryPrompt,
        'Persist only durable facts: identities, objectives, preferences, and validated outcomes.',
      ),
    },
  };

  return res.status(200).json({
    status: 'ok',
    generatedAt: Date.now(),
    profile,
    note: 'Use this profile as the continuity anchor between sessions.',
  });
}
