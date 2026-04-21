import type { RawVacancy, Salary } from './types';

// ============================================================
// HH.ru CARD PARSER — чистые функции, работают с Document
// ============================================================

export function parseSalary(raw: string | null): Salary {
  if (!raw) {
    return { raw: null, from: null, to: null, currency: null, period: null, gross: null };
  }

  const currency: Salary['currency'] = raw.includes('₽')
    ? 'RUB'
    : raw.includes('$')
    ? 'USD'
    : raw.includes('€')
    ? 'EUR'
    : null;

  const period: Salary['period'] = raw.includes('за час')
    ? 'hour'
    : raw.includes('за услугу')
    ? 'project'
    : raw.includes('за месяц')
    ? 'month'
    : null;

  const gross: Salary['gross'] = raw.includes('до вычета') ? 'gross' : 'net';

  const nums = [...raw.matchAll(/\d[\d\s]*/g)]
    .map((m) => parseInt(m[0].replace(/\s/g, ''), 10))
    .filter((n) => !isNaN(n) && n > 0);

  let from: number | null = null;
  let to: number | null = null;

  if (/от.*до/i.test(raw)) {
    from = nums[0] ?? null;
    to = nums[1] ?? null;
  } else if (/[–—-]/.test(raw) && nums.length >= 2) {
    from = nums[0] ?? null;
    to = nums[1] ?? null;
  } else if (/^\s*от/i.test(raw)) {
    from = nums[0] ?? null;
  } else if (/^\s*до/i.test(raw)) {
    to = nums[0] ?? null;
  } else {
    from = nums[0] ?? null;
  }

  return { raw, from, to, currency, period, gross };
}

function extractSalaryText(card: Element): string | null {
  // Salary-элемент не имеет data-qa — ищем span с символом валюты
  for (const span of card.querySelectorAll('span')) {
    const t = span.textContent?.trim();
    if (t && /(\d[\d\s]*[₽$€]|от\s*\d|до\s*\d|\d+\s*[$€])/i.test(t) && t.length < 80) {
      return t.replace(/\s+/g, ' ');
    }
  }
  return null;
}

export function parseCard(card: Element): RawVacancy | null {
  const idEl = card.querySelector('[id]');
  const id = idEl?.id ?? null;

  const title =
    card.querySelector('[data-qa="serp-item__title-text"]')?.textContent?.trim() ?? null;

  const url =
    (card.querySelector('[data-qa="serp-item__title"]') as HTMLAnchorElement)?.href
      ?.split('?')[0] ?? null;

  if (!id || !title || !url) return null;

  const salaryRaw = extractSalaryText(card);
  const employer =
    card.querySelector('[data-qa="vacancy-serp__vacancy-employer-text"]')?.textContent?.trim() ??
    null;
  const ratingText = card.querySelector('[data-qa="company-review-rating-value"]')?.textContent;
  const rating = ratingText ? parseFloat(ratingText) || null : null;
  const city =
    card.querySelector('[data-qa="vacancy-serp__vacancy-address"]')?.textContent?.trim() ?? null;

  const tagNodes = card.querySelectorAll(
    '[data-qa^="vacancy-label"],[data-qa^="vacancy-serp__vacancy-work-experience"]'
  );
  const tags = [...tagNodes]
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .join(' | ');

  return {
    id,
    title,
    salary: parseSalary(salaryRaw),
    employer,
    rating,
    city,
    tags,
    url,
    parsedAt: new Date().toISOString(),
  };
}

export function parseAllCards(root: ParentNode = document): RawVacancy[] {
  const cards = root.querySelectorAll('[data-qa="vacancy-serp__vacancy"]');
  return [...cards]
    .map(parseCard)
    .filter((v): v is RawVacancy => v !== null);
}

export function getTotalCount(root: ParentNode = document): number | null {
  const h1 = root.querySelector('h1');
  const m = h1?.textContent?.match(/\d[\d\s]*/);
  return m ? parseInt(m[0].replace(/\s/g, ''), 10) : null;
}

export function getPageCount(root: ParentNode = document): number {
  const links = root.querySelectorAll('[data-qa="pager-block"] a');
  if (!links.length) return 1;

  const nums = [...links]
    .map((a) => {
      const href = (a as HTMLAnchorElement).href;
      const m = href.match(/page=(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  return nums.length ? Math.max(...nums) + 1 : 1;
}

export function getCurrentPage(url: string = location.href): number {
  try {
    const p = new URL(url).searchParams.get('page');
    return p ? parseInt(p, 10) : 0;
  } catch {
    return 0;
  }
}

export function buildPageUrl(baseUrl: string, page: number): string {
  const u = new URL(baseUrl);
  u.searchParams.set('page', String(page));
  return u.toString();
}
