function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function numberFromQuery(queryValue, fallback) {
  const parsed = Number(queryValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildMetrics(seed) {
  const recursionLevel = clamp(Math.round(8 + (seed % 24)), 5, 40);
  const crystallization = clamp(0.55 + ((seed * 7) % 40) / 100, 0, 1);
  const corrections = clamp(0.5 + ((seed * 11) % 45) / 100, 0, 1);
  const omega = Math.pow(10, recursionLevel / 2);
  const divineGap = omega * (1 - corrections * crystallization);

  return {
    recursionLevel,
    crystallization: Number(crystallization.toFixed(4)),
    corrections: Number(corrections.toFixed(4)),
    omega: Number(omega.toExponential(2)),
    divineGap: Number(divineGap.toFixed(2)),
  };
}

function buildObjects(metrics) {
  const recursionScale = clamp(metrics.recursionLevel / 40, 0, 1);
  const crystalScale = clamp(metrics.crystallization, 0, 1);
  const correctionScale = clamp(metrics.corrections, 0, 1);
  const divergenceScale = clamp(metrics.divineGap / 10000, 0, 1);

  return [
    {
      id: 'recursion-orb',
      kind: 'circle',
      label: 'Recursion Orb',
      x: 20,
      y: 24,
      radius: Number((20 + recursionScale * 22).toFixed(2)),
      color: '#00ff99',
      alpha: Number((0.45 + recursionScale * 0.4).toFixed(2)),
      source: 'recursionLevel',
    },
    {
      id: 'crystallization-prism',
      kind: 'polygon',
      label: 'Crystallization Prism',
      x: 50,
      y: 52,
      sides: Math.max(3, Math.round(3 + crystalScale * 7)),
      radius: Number((12 + crystalScale * 28).toFixed(2)),
      rotation: Number((crystalScale * 360).toFixed(2)),
      color: '#66ccff',
      alpha: Number((0.4 + crystalScale * 0.45).toFixed(2)),
      source: 'crystallization',
    },
    {
      id: 'correction-beam',
      kind: 'line',
      label: 'Correction Beam',
      x1: 8,
      y1: 85,
      x2: Number((15 + correctionScale * 80).toFixed(2)),
      y2: Number((60 - correctionScale * 40).toFixed(2)),
      width: Number((2 + correctionScale * 7).toFixed(2)),
      color: '#f9f871',
      alpha: Number((0.4 + correctionScale * 0.5).toFixed(2)),
      source: 'corrections',
    },
    {
      id: 'divine-gap-field',
      kind: 'ring',
      label: 'Divine Gap Field',
      x: 80,
      y: 20,
      radius: Number((8 + divergenceScale * 22).toFixed(2)),
      thickness: Number((1 + divergenceScale * 6).toFixed(2)),
      color: '#ff6688',
      alpha: Number((0.35 + divergenceScale * 0.5).toFixed(2)),
      source: 'divineGap',
    },
  ];
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

  const seed = numberFromQuery(req.query?.seed, Date.now() % 97);
  const metrics = buildMetrics(seed);
  const objects = buildObjects(metrics);

  return res.status(200).json({
    status: 'ok',
    generatedAt: Date.now(),
    projection: {
      seed,
      coordinateSpace: 'percent',
      objects,
      metrics,
      rationale: 'Data projected into geometric objects for fast visual intuition.',
    },
  });
}
