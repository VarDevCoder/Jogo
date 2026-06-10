const _suites = [];
let _current = null;

export function describe(name, fn) {
  const suite = { name, tests: [] };
  _suites.push(suite);
  _current = suite;
  fn();
  _current = null;
}

export function it(name, fn) {
  if (!_current) throw new Error('it() must be called inside describe()');
  _current.tests.push({ name, fn });
}

class Expect {
  constructor(actual) { this.actual = actual; }
  toBe(expected) {
    if (this.actual !== expected) {
      throw new Error(`expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`);
    }
  }
  toEqual(expected) {
    if (JSON.stringify(this.actual) !== JSON.stringify(expected)) {
      throw new Error(`expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`);
    }
  }
  toBeCloseTo(expected, decimals = 2) {
    const tol = 10 ** -decimals / 2;
    if (Math.abs(this.actual - expected) > tol) {
      throw new Error(`expected ${this.actual} to be close to ${expected} (±${tol})`);
    }
  }
  toBeGreaterThan(n) {
    if (!(this.actual > n)) throw new Error(`expected ${this.actual} > ${n}`);
  }
  toBeLessThan(n) {
    if (!(this.actual < n)) throw new Error(`expected ${this.actual} < ${n}`);
  }
  toBeTruthy() {
    if (!this.actual) throw new Error(`expected ${JSON.stringify(this.actual)} to be truthy`);
  }
  toBeFalsy() {
    if (this.actual) throw new Error(`expected ${JSON.stringify(this.actual)} to be falsy`);
  }
  toContain(item) {
    if (!this.actual.includes(item)) throw new Error(`expected ${JSON.stringify(this.actual)} to contain ${JSON.stringify(item)}`);
  }
  toThrow() {
    let threw = false;
    try { this.actual(); } catch { threw = true; }
    if (!threw) throw new Error('expected function to throw');
  }
}

export function expect(actual) { return new Expect(actual); }

export function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export async function runAll(rootEl) {
  let totalPass = 0, totalFail = 0;
  const out = [];

  for (const suite of _suites) {
    const suiteBlock = { name: suite.name, results: [] };
    for (const t of suite.tests) {
      try {
        await t.fn();
        suiteBlock.results.push({ name: t.name, pass: true });
        totalPass++;
      } catch (err) {
        suiteBlock.results.push({ name: t.name, pass: false, error: err.message });
        totalFail++;
      }
    }
    out.push(suiteBlock);
  }

  rootEl.innerHTML = render(out, totalPass, totalFail);
}

function render(suites, pass, fail) {
  const total = pass + fail;
  const headerColor = fail === 0 ? '#5fffaf' : '#ff6b6b';
  return `
    <div class="hdr" style="color:${headerColor}">
      ${fail === 0 ? '✓ ALL PASSING' : '✗ FAILING'} — ${pass}/${total} passed (${fail} failed)
    </div>
    ${suites.map(s => `
      <div class="suite">
        <div class="suiteName">${s.name}</div>
        ${s.results.map(r => `
          <div class="test ${r.pass ? 'pass' : 'fail'}">
            ${r.pass ? '✓' : '✗'} ${r.name}
            ${r.error ? `<div class="err">${escapeHtml(r.error)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}
  `;
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}
