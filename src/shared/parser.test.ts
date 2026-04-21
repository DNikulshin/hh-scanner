import { describe, it, expect, beforeEach } from 'vitest';
import { Window } from 'happy-dom';
import {
  parseAllCards,
  parseSalary,
  parseCard,
  getTotalCount,
  getPageCount,
  getCurrentPage,
  buildPageUrl,
} from './parser';
import {
  CARD_WITH_SALARY,
  CARD_NO_SALARY,
  CARD_SALARY_RANGE,
  CARD_SALARY_USD,
  CARD_EXCLUDED_1C,
  SERP_PAGE,
} from './__fixtures__/hh-cards';

function mkDoc(html: string): Document {
  const win = new Window();
  win.document.documentElement.innerHTML = html;
  return win.document as unknown as Document;
}

// ============================================================
// parseSalary — нормализация зарплатной строки
// ============================================================
describe('parseSalary', () => {
  it('returns all-nulls for null input', () => {
    expect(parseSalary(null)).toEqual({
      raw: null,
      from: null,
      to: null,
      currency: null,
      period: null,
      gross: null,
    });
  });

  it('parses "от X ₽ за месяц, на руки"', () => {
    const s = parseSalary('от 200 000 ₽ за месяц, на руки');
    expect(s).toMatchObject({
      from: 200000,
      to: null,
      currency: 'RUB',
      period: 'month',
      gross: 'net',
    });
  });

  it('parses range "X – Y ₽ за месяц, до вычета налогов"', () => {
    const s = parseSalary('200 000 – 350 000 ₽ за месяц, до вычета налогов');
    expect(s).toMatchObject({
      from: 200000,
      to: 350000,
      currency: 'RUB',
      period: 'month',
      gross: 'gross',
    });
  });

  it('parses hourly USD "X – Y $ за час"', () => {
    const s = parseSalary('10 – 20 $ за час, на руки');
    expect(s).toMatchObject({
      from: 10,
      to: 20,
      currency: 'USD',
      period: 'hour',
      gross: 'net',
    });
  });

  it('parses "до X ₽ за услугу"', () => {
    const s = parseSalary('до 144 000 ₽ за услугу, на руки');
    expect(s).toMatchObject({
      from: null,
      to: 144000,
      currency: 'RUB',
      period: 'project',
    });
  });

  it('parses fixed "X ₽ за месяц"', () => {
    const s = parseSalary('30 000 ₽ за месяц, на руки');
    expect(s).toMatchObject({
      from: 30000,
      to: null,
      currency: 'RUB',
      period: 'month',
    });
  });

  it('handles EUR currency', () => {
    expect(parseSalary('2 000 € за месяц, на руки').currency).toBe('EUR');
  });
});

// ============================================================
// parseCard — извлечение полей из DOM
// ============================================================
describe('parseCard', () => {
  it('parses a complete card with salary', () => {
    const doc = mkDoc(CARD_WITH_SALARY);
    const card = doc.querySelector('.vacancy-card')!;
    const v = parseCard(card);

    expect(v).not.toBeNull();
    expect(v!.id).toBe('132191637');
    expect(v!.title).toBe('Fullstack Developer (Node.js + React + Telegram Bot API)');
    expect(v!.url).toBe('https://hh.ru/vacancy/132191637');
    expect(v!.employer).toContain('Митэг');
    expect(v!.rating).toBe(5.0);
    expect(v!.city).toBe('Москва');
    expect(v!.salary.from).toBe(200000);
    expect(v!.salary.currency).toBe('RUB');
    expect(v!.tags).toContain('Опыт 1-3 года');
    expect(v!.tags).toContain('Можно удалённо');
  });

  it('parses a card without salary (salary.raw=null)', () => {
    const doc = mkDoc(CARD_NO_SALARY);
    const card = doc.querySelector('.vacancy-card')!;
    const v = parseCard(card);

    expect(v).not.toBeNull();
    expect(v!.title).toBe('Frontend Developer');
    expect(v!.salary.raw).toBeNull();
    expect(v!.salary.from).toBeNull();
  });

  it('strips ?query params from url', () => {
    const doc = mkDoc(CARD_WITH_SALARY);
    const v = parseCard(doc.querySelector('.vacancy-card')!);
    expect(v!.url).not.toContain('?');
  });

  it('returns null for malformed card (no title)', () => {
    const doc = mkDoc('<div class="vacancy-card"><div id="1"></div></div>');
    const v = parseCard(doc.querySelector('.vacancy-card')!);
    expect(v).toBeNull();
  });
});

// ============================================================
// parseAllCards + SERP parsing
// ============================================================
describe('SERP page parsing', () => {
  let doc: Document;
  beforeEach(() => {
    doc = mkDoc(SERP_PAGE);
  });

  it('counts all 6 vacancy cards', () => {
    const cards = parseAllCards(doc);
    expect(cards).toHaveLength(6);
  });

  it('extracts total count 231 from h1', () => {
    expect(getTotalCount(doc)).toBe(231);
  });

  it('detects 5 pages from pagination', () => {
    expect(getPageCount(doc)).toBe(5);
  });
});

// ============================================================
// URL helpers
// ============================================================
describe('URL helpers', () => {
  it('getCurrentPage reads from ?page= param', () => {
    expect(getCurrentPage('https://hh.ru/search/vacancy?page=2')).toBe(2);
    expect(getCurrentPage('https://hh.ru/search/vacancy')).toBe(0);
  });

  it('buildPageUrl sets page param', () => {
    const url = buildPageUrl('https://hh.ru/search/vacancy?text=react', 3);
    expect(url).toContain('page=3');
    expect(url).toContain('text=react');
  });

  it('buildPageUrl overrides existing page', () => {
    const url = buildPageUrl('https://hh.ru/search/vacancy?page=1&text=x', 4);
    expect(new URL(url).searchParams.get('page')).toBe('4');
  });
});

// ============================================================
// Salary edge cases (regression from real HH data)
// ============================================================
describe('Salary from real fixtures', () => {
  it('CARD_SALARY_RANGE parses 200k-350k', () => {
    const doc = mkDoc(CARD_SALARY_RANGE);
    const v = parseCard(doc.querySelector('.vacancy-card')!);
    expect(v!.salary.from).toBe(200000);
    expect(v!.salary.to).toBe(350000);
    expect(v!.salary.gross).toBe('gross');
  });

  it('CARD_SALARY_USD parses hourly USD range', () => {
    const doc = mkDoc(CARD_SALARY_USD);
    const v = parseCard(doc.querySelector('.vacancy-card')!);
    expect(v!.salary.from).toBe(10);
    expect(v!.salary.to).toBe(20);
    expect(v!.salary.currency).toBe('USD');
    expect(v!.salary.period).toBe('hour');
  });

  it('CARD_EXCLUDED_1C still parses — exclusion is scoring concern', () => {
    const doc = mkDoc(CARD_EXCLUDED_1C);
    const v = parseCard(doc.querySelector('.vacancy-card')!);
    expect(v).not.toBeNull();
    expect(v!.title).toContain('1С');
  });
});
