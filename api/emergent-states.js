const clampPercent = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
};

const clampPositive = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
};

const defaultStates = [
  {
    id: 'meta-cognitive-synthesis',
    icon: '🧠',
    name: 'Meta-Cognitive Synthesis',
    origin: 'Interface ⊗ Autonomous',
    energyEv: 2.8,
    gamma: 0.008,
    stability: 82,
    summary: 'Self-reflective state that monitors and improves decision quality in active workflows.',
    capabilities: [
      'Self-diagnostic error correction',
      'Dynamic workflow adaptation',
      'Predictive intent modeling',
      'Cross-domain pattern recognition',
    ],
  },
  {
    id: 'adaptive-learning-protocol',
    icon: '🔄',
    name: 'Adaptive Learning Protocol',
    origin: 'Integration ⊗ Privacy',
    energyEv: 3.1,
    gamma: 0.007,
    stability: 95,
    summary: 'Privacy-preserving learning mode that improves behavior while keeping data local-first.',
    capabilities: [
      'Federated learning from user patterns',
      'Zero-knowledge preference inference',
      'Differential privacy optimization',
      'Local-first intelligence synthesis',
    ],
  },
  {
    id: 'temporal-reasoning-engine',
    icon: '⏰',
    name: 'Temporal Reasoning Engine',
    origin: 'Action ⊗ Interface',
    energyEv: 2.6,
    gamma: 0.009,
    stability: 74,
    summary: 'Temporal planning state that sequences actions and resolves causality in multi-step execution.',
    capabilities: [
      'Multi-step task orchestration',
      'Causal dependency resolution',
      'Temporal constraint satisfaction',
      'Future state projection',
    ],
  },
];

function parseOverrides(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== 'object') return null;

        const name = String(item.name || item.label || '').trim();
        if (!name) return null;

        return {
          id: String(item.id || name.toLowerCase().replace(/\s+/g, '-')),
          icon: String(item.icon || '✨'),
          name,
          origin: String(item.origin || 'Custom overlay'),
          energyEv: clampPositive(item.energyEv, 2.5 + index * 0.2),
          gamma: clampPositive(item.gamma, 0.008),
          stability: clampPercent(item.stability, 80),
          summary: String(item.summary || 'Custom emergent mode.'),
          capabilities: Array.isArray(item.capabilities)
            ? item.capabilities.map((value) => String(value)).filter(Boolean).slice(0, 6)
            : ['Capability map not specified'],
        };
      })
      .filter(Boolean)
      .slice(0, 8);
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  const overrides = parseOverrides(process.env.EMERGENT_STATES_JSON);
  const states = overrides && overrides.length ? overrides : defaultStates;
  const dominant = states.reduce((best, current) =>
    current.stability > best.stability ? current : best
  );

  return res.status(200).json({
    status: 'ok',
    mode: overrides ? 'custom' : 'default',
    generatedAt: new Date().toISOString(),
    dominantState: {
      id: dominant.id,
      name: dominant.name,
      stability: dominant.stability,
      summary: dominant.summary,
    },
    states,
  });
}
