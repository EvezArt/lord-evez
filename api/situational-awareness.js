function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seededNumber(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

function buildNodes(seed) {
  const labels = ['Input', 'Memory', 'Planner', 'Agent', 'Observer', 'Guardrail', 'Output', 'Feedback'];
  return labels.map((label, index) => {
    const angle = (Math.PI * 2 * index) / labels.length;
    const radius = seededNumber(seed + index, 28, 44);
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    return {
      id: label.toLowerCase(),
      label,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      load: Number(clamp(seededNumber(seed + index * 3, 0.2, 0.95), 0, 1).toFixed(2)),
    };
  });
}

function buildEdges(nodes) {
  const edges = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const from = nodes[i];
    const to = nodes[(i + 1) % nodes.length];
    edges.push({
      from: from.id,
      to: to.id,
      intensity: Number(((from.load + to.load) / 2).toFixed(2)),
    });
  }
  edges.push({ from: 'feedback', to: 'planner', intensity: 0.9 });
  edges.push({ from: 'observer', to: 'guardrail', intensity: 0.86 });
  return edges;
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

  const seed = Number.isFinite(Number(req.query?.seed)) ? Number(req.query.seed) : Date.now() / 1000;
  const nodes = buildNodes(seed);
  const edges = buildEdges(nodes);

  const awareness = {
    mode: 'rolling',
    infiniteMapping: true,
    horizon: {
      trackedDomains: ['identity', 'intent', 'risk', 'feedback', 'context'],
      refreshIntervalMs: 4000,
      confidence: Number((nodes.reduce((acc, n) => acc + n.load, 0) / nodes.length).toFixed(2)),
    },
    graph: {
      coordinateSpace: 'percent',
      nodes,
      edges,
    },
  };

  return res.status(200).json({
    status: 'ok',
    generatedAt: Date.now(),
    awareness,
    note: 'Situational graph is continuously refreshable for effectively unbounded mapping over time.',
  });
}
