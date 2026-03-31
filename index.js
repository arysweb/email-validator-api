const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { promisify } = require('util');

const app = express();
app.use(cors());
app.use(express.json());

const resolveMx = promisify(dns.resolveMx);

// Common disposable email domains (embed a solid starter list)
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','10minutemail.com','throwam.com',
  'tempmail.com','yopmail.com','trashmail.com','sharklasers.com',
  'guerrillamailblock.com','grr.la','guerrillamail.info','guerrillamail.biz',
  'guerrillamail.de','guerrillamail.net','guerrillamail.org','spam4.me',
  'dispostable.com','maildrop.cc','spamgourmet.com','trashmail.at',
  'trashmail.io','trashmail.me','trashmail.net','fakeinbox.com',
  'mailnull.com','spamherelots.com','spamhereplease.com','tempr.email',
  'discard.email','spambog.com','trashmail.org','0-mail.com',
  'zetmail.com','mohmal.com','getairmail.com','filzmail.com',
  'throwam.com','getnada.com','owlpic.com','tempinbox.com',
  'mailexpire.com','tempail.com','mintemail.com','spamoff.de',
  'spamgob.com','spamspot.com','notsharingmy.info','objectmail.com',
  'ownmail.net','petml.com','put2.net','rcpt.at','recode.me',
  'regbypass.com','regbypass.comsafe-mail.net','safetymail.info',
  'safetypost.de','sandelf.de','sent.as','sharklasers.com','shitmail.me',
  'shitmail.org','shitware.nl','shortmail.net','sibmail.com',
  'skeefmail.com','slapsfromlastnight.com','slippery.email',
  'slo.net','slopsbox.com','smapfree24.com','smapfree24.de',
  'smapfree24.eu','smapfree24.info','smapfree24.org','smellfear.com',
  'snakemail.com','sneakemail.com','sneakmail.de','snkmail.com',
]);

// Free email providers (not disposable, but not business)
const FREE_PROVIDERS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com',
  'icloud.com','protonmail.com','mail.com','zoho.com','yandex.com',
  'live.com','msn.com','me.com','mac.com','googlemail.com',
  'yahoo.co.uk','yahoo.fr','yahoo.de','yahoo.it','yahoo.es',
  'hotmail.co.uk','hotmail.fr','hotmail.de','hotmail.it',
  'gmx.com','gmx.net','gmx.de','web.de','libero.it',
]);

// Syntax validation
function validateSyntax(email) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

// MX record lookup
async function checkMxRecords(domain) {
  try {
    const records = await resolveMx(domain);
    return { hasMx: records && records.length > 0, records: records || [] };
  } catch {
    return { hasMx: false, records: [] };
  }
}

// Score calculator
function calculateScore(checks) {
  let score = 100;
  if (!checks.syntax_valid) score -= 50;
  if (!checks.mx_found) score -= 30;
  if (checks.is_disposable) score -= 40;
  if (checks.is_role_address) score -= 10;
  return Math.max(0, Math.min(100, score));
}

// Main validation endpoint
app.get('/validate', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Missing required parameter: email' });
  }

  const emailStr = email.trim().toLowerCase();
  const syntaxValid = validateSyntax(emailStr);

  if (!syntaxValid) {
    return res.json({
      email: emailStr,
      is_valid: false,
      score: 0,
      checks: {
        syntax_valid: false,
        mx_found: false,
        is_disposable: false,
        is_free_provider: false,
        is_role_address: false,
      },
      domain: null,
      suggestion: null,
    });
  }

  const [localPart, domain] = emailStr.split('@');

  // Role addresses (admin@, info@, etc.)
  const roleAddresses = ['admin','info','contact','support','sales','help',
    'billing','noreply','no-reply','postmaster','webmaster','abuse',
    'security','team','hello','hi','mail','email'];
  const isRole = roleAddresses.includes(localPart);

  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  const isFreeProvider = FREE_PROVIDERS.has(domain);

  // MX check
  const { hasMx, records } = await checkMxRecords(domain);

  // Common typo suggestions
  const typoMap = {
    'gmai.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmail.co': 'gmail.com',
    'gnail.com': 'gmail.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com',
  };
  const suggestion = typoMap[domain] ? `${localPart}@${typoMap[domain]}` : null;

  const checks = {
    syntax_valid: true,
    mx_found: hasMx,
    is_disposable: isDisposable,
    is_free_provider: isFreeProvider,
    is_role_address: isRole,
  };

  const score = calculateScore(checks);
  const isValid = syntaxValid && hasMx && !isDisposable;

  return res.json({
    email: emailStr,
    is_valid: isValid,
    score,
    checks,
    domain,
    mx_records: records.slice(0, 3),
    suggestion,
  });
});

// Bulk validation endpoint
app.post('/validate/bulk', async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails)) {
    return res.status(400).json({ error: 'Body must contain an "emails" array' });
  }
  if (emails.length > 50) {
    return res.status(400).json({ error: 'Maximum 50 emails per bulk request' });
  }

  const results = await Promise.all(
    emails.map(async (email) => {
      const emailStr = (email || '').trim().toLowerCase();
      const syntaxValid = validateSyntax(emailStr);
      if (!syntaxValid) return { email: emailStr, is_valid: false, score: 0 };

      const [localPart, domain] = emailStr.split('@');
      const isDisposable = DISPOSABLE_DOMAINS.has(domain);
      const isFreeProvider = FREE_PROVIDERS.has(domain);
      const roleAddresses = ['admin','info','contact','support','sales','help','billing','noreply'];
      const isRole = roleAddresses.includes(localPart);
      const { hasMx } = await checkMxRecords(domain);

      const checks = { syntax_valid: true, mx_found: hasMx, is_disposable: isDisposable, is_free_provider: isFreeProvider, is_role_address: isRole };
      const score = calculateScore(checks);
      return { email: emailStr, is_valid: syntaxValid && hasMx && !isDisposable, score, checks, domain };
    })
  );

  return res.json({ results, total: results.length, valid_count: results.filter(r => r.is_valid).length });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Email Validator API running on port ${PORT}`));
