const DEFAULT_METHODS = {
  email: {
    env: 'CONTACT_EMAIL',
    label: 'Email',
    buildLink: (value) => `mailto:${value}`,
  },
  sms: {
    env: 'CONTACT_SMS',
    label: 'SMS',
    buildLink: (value) => `sms:${value}`,
  },
  whatsapp: {
    env: 'CONTACT_WHATSAPP',
    label: 'WhatsApp',
    buildLink: (value) => `https://wa.me/${String(value).replace(/[^\d]/g, '')}`,
  },
  telegram: {
    env: 'CONTACT_TELEGRAM',
    label: 'Telegram',
    buildLink: (value) => `https://t.me/${String(value).replace(/^@/, '')}`,
  },
  signal: {
    env: 'CONTACT_SIGNAL',
    label: 'Signal',
    buildLink: (value) => `sgnl://signal.me/#p/${String(value).replace(/[^\d+]/g, '')}`,
  },
  discord: {
    env: 'CONTACT_DISCORD',
    label: 'Discord',
    buildLink: (value) => value,
  },
  matrix: {
    env: 'CONTACT_MATRIX',
    label: 'Matrix',
    buildLink: (value) => `https://matrix.to/#/${value}`,
  },
  slack: {
    env: 'CONTACT_SLACK',
    label: 'Slack',
    buildLink: (value) => value,
  },
  github: {
    env: 'CONTACT_GITHUB',
    label: 'GitHub',
    buildLink: (value) => value.startsWith('http') ? value : `https://github.com/${value}`,
  },
  x: {
    env: 'CONTACT_X',
    label: 'X',
    buildLink: (value) => value.startsWith('http') ? value : `https://x.com/${String(value).replace(/^@/, '')}`,
  },
  webhook: {
    env: 'CONTACT_WEBHOOK',
    label: 'Webhook',
    buildLink: (value) => value,
  },
};

function resolveMethods() {
  const methods = [];

  for (const [key, config] of Object.entries(DEFAULT_METHODS)) {
    const rawValue = process.env[config.env];
    if (!rawValue) continue;

    methods.push({
      key,
      label: config.label,
      value: rawValue,
      link: config.buildLink(rawValue),
    });
  }

  return methods;
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

  const methods = resolveMethods();

  return res.status(200).json({
    status: 'ok',
    count: methods.length,
    methods,
    note: methods.length
      ? 'Configured communication methods discovered.'
      : 'No communication methods configured. Set CONTACT_* environment variables.',
  });
}
