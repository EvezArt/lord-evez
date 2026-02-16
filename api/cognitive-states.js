const DEFAULT_STATES = [
  {
    key: 'observe',
    label: 'Observe',
    intent: 'Collect external signals and identify new patterns.',
    confidence: 0.92,
    energy: 'stable',
    biasGuard: 'Cross-check event stream against webhook metrics.',
  },
  {
    key: 'orient',
    label: 'Orient',
    intent: 'Map incoming signals to current system context.',
    confidence: 0.87,
    energy: 'adaptive',
    biasGuard: 'Prioritize verified payloads over assumptions.',
  },
  {
    key: 'intuit',
    label: 'Intuit',
    intent: 'Generate candidate next actions from partial information.',
    confidence: 0.81,
    energy: 'high',
    biasGuard: 'Surface uncertainty before recommending actions.',
  },
  {
    key: 'stabilize',
    label: 'Stabilize',
    intent: 'Reduce divergence and preserve reliable operating state.',
    confidence: 0.9,
    energy: 'stable',
    biasGuard: 'Prefer reversible changes when confidence drops.',
  },
];

function parseStateConfig(rawValue) {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter((state) => state && typeof state === 'object')
      .map((state, index) => ({
        key: String(state.key || `custom-${index + 1}`),
        label: String(state.label || `Custom ${index + 1}`),
        intent: String(state.intent || 'No intent provided.'),
        confidence: Number.isFinite(Number(state.confidence)) ? Number(state.confidence) : 0.5,
        energy: String(state.energy || 'unknown'),
        biasGuard: String(state.biasGuard || 'No explicit guardrail provided.'),
      }));
  } catch {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeStates(states) {
  return states.map((state) => ({
    ...state,
    confidence: clamp(Number(state.confidence || 0), 0, 1),
  }));
}

function deriveDominantState(states) {
  if (!states.length) {
    return {
      key: 'none',
      label: 'Unavailable',
      rationale: 'No cognitive states configured.',
    };
  }

  const dominant = [...states].sort((a, b) => b.confidence - a.confidence)[0];
  return {
    key: dominant.key,
    label: dominant.label,
    rationale: `${dominant.label} is currently dominant with ${(dominant.confidence * 100).toFixed(1)}% confidence.`,
  };
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

  const configuredStates = parseStateConfig(process.env.COGNITIVE_SELF_STATES_JSON);
  const states = normalizeStates(configuredStates && configuredStates.length ? configuredStates : DEFAULT_STATES);
  const dominantState = deriveDominantState(states);

  return res.status(200).json({
    status: 'ok',
    mode: configuredStates ? 'configured' : 'default',
    generatedAt: Date.now(),
    dominantState,
    states,
    note: configuredStates
      ? 'Loaded cognitive self states from COGNITIVE_SELF_STATES_JSON.'
      : 'Using default cognitive self states. Set COGNITIVE_SELF_STATES_JSON to customize.',
  });
}
