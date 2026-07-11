const fs = require('fs');
const path = require('path');

const localesDir = path.resolve(__dirname, '..', 'src', 'i18n', 'locales');
const reference = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

function flatten(value, prefix = '', target = {}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, target));
    return target;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      flatten(item, prefix ? `${prefix}.${key}` : key, target);
    });
    return target;
  }
  target[prefix] = String(value ?? '');
  return target;
}

function placeholders(value) {
  return [...value.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]).sort().join('|');
}

const base = flatten(reference);
const localeFiles = fs.readdirSync(localesDir).filter((name) => name.endsWith('.json'));
let invalid = false;

for (const file of localeFiles) {
  const translated = flatten(JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8')));
  const missing = Object.keys(base).filter((key) => !(key in translated));
  const extra = Object.keys(translated).filter((key) => !(key in base));
  const mismatchedVars = Object.keys(base).filter(
    (key) => key in translated && placeholders(base[key]) !== placeholders(translated[key]),
  );
  if (missing.length || extra.length || mismatchedVars.length) {
    invalid = true;
    console.error(`\n${file}`);
    if (missing.length) console.error(`  missing: ${missing.join(', ')}`);
    if (extra.length) console.error(`  extra: ${extra.join(', ')}`);
    if (mismatchedVars.length) console.error(`  placeholders: ${mismatchedVars.join(', ')}`);
  }
}

if (invalid) process.exit(1);
console.log(`i18n OK: ${localeFiles.length} locale files match en.json`);
