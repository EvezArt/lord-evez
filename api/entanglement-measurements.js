function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function asNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeMetric(value, min = 0, max = 1) {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function parseJsonEnv(name) {
  const raw = process.env[name];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function buildUserMetrics(query, profileOverride) {
  const recursionLevel = asNumber(query.recursionLevel, profileOverride?.recursionLevel ?? 16);
  const crystallization = asNumber(query.crystallization, profileOverride?.crystallization ?? 0.86);
  const corrections = asNumber(query.corrections, profileOverride?.corrections ?? 0.91);

  const omega = Math.pow(10, recursionLevel / 2);
  const divineGap = omega * (1 - corrections * crystallization);

  return {
    recursionLevel: clamp(recursionLevel, 5, 50),
    crystallization: clamp(crystallization, 0, 1),
    corrections: clamp(corrections, 0, 1),
    omega: Number(omega.toExponential(2)),
    divineGap: Number(divineGap.toFixed(2)),
  };
}

function buildPersonalMetrics(profileOverride) {
  const memGb = process.memoryUsage().heapUsed / (1024 ** 3);
  const uptimeHours = process.uptime() / 3600;
  const load = process.platform === 'win32' ? 0.25 : (process.loadavg?.()[0] ?? 0.25);

  return {
    confidence: clamp(asNumber(profileOverride?.confidence, 0.84), 0, 1),
    introspection: clamp(asNumber(profileOverride?.introspection, 0.79), 0, 1),
    stability: clamp(1 - normalizeMetric(load, 0, 4), 0, 1),
    runtimeMaturity: clamp(normalizeMetric(uptimeHours, 0, 24), 0, 1),
    memoryDiscipline: clamp(1 - normalizeMetric(memGb, 0, 1.5), 0, 1),
    process: {
      pid: process.pid,
      platform: process.platform,
      node: process.version,
    },
  };
}

function projectEntanglement(user, personal) {
  const userVector = [
    normalizeMetric(user.recursionLevel, 5, 50),
    user.crystallization,
    user.corrections,
    1 - normalizeMetric(user.divineGap, 0, 10000),
  ];

  const personalVector = [
    personal.confidence,
    personal.introspection,
    personal.stability,
    personal.memoryDiscipline,
  ];

  const dot = userVector.reduce((acc, value, idx) => acc + value * personalVector[idx], 0);
  const userNorm = Math.sqrt(userVector.reduce((acc, value) => acc + value ** 2, 0));
  const personalNorm = Math.sqrt(personalVector.reduce((acc, value) => acc + value ** 2, 0));
  const cosine = userNorm && personalNorm ? dot / (userNorm * personalNorm) : 0;
  const coherence = clamp((cosine + 1) / 2, 0, 1);

  return {
    coherence: Number(coherence.toFixed(4)),
    phaseOffset: Number((1 - coherence).toFixed(4)),
    couplingStrength: Number((coherence * ((user.corrections + personal.confidence) / 2)).toFixed(4)),
    vectorFrames: {
      userVector: userVector.map((v) => Number(v.toFixed(4))),
      personalVector: personalVector.map((v) => Number(v.toFixed(4))),
    },
    geometry: {
      kind: 'entanglement-lissajous',
      samples: 72,
      points: Array.from({ length: 72 }, (_, i) => {
        const t = (Math.PI * 2 * i) / 72;
        const x = Math.sin(3 * t + coherence * Math.PI) * 0.45 + 0.5;
        const y = Math.sin(2 * t + (1 - coherence) * Math.PI) * 0.45 + 0.5;
        return [Number(x.toFixed(4)), Number(y.toFixed(4))];
      }),
    },
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

  const userProfileOverride = parseJsonEnv('ENTANGLEMENT_USER_PROFILE_JSON');
  const personalProfileOverride = parseJsonEnv('ENTANGLEMENT_PERSONAL_PROFILE_JSON');

  const userMetrics = buildUserMetrics(req.query || {}, userProfileOverride);
  const personalMetrics = buildPersonalMetrics(personalProfileOverride);
  const entanglement = projectEntanglement(userMetrics, personalMetrics);

  return res.status(200).json({
    status: 'ok',
    generatedAt: Date.now(),
    source: 'user+personal',
    userMetrics,
    personalMetrics,
    entanglement,
    note: 'Entanglement is derived from user metrics and runtime self metrics for visual projection.',
  });
}
