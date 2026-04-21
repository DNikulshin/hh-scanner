import { describe, it, expect } from 'vitest';
import { calcScore, scoreVacancy } from './scoring';
import { DEFAULT_SCORING } from './constants';

// ============================================================
// Scoring engine — против профиля Никульшина
// ============================================================

describe('calcScore — default profile (Nikulshin)', () => {
  it('awards +10 per core keyword', () => {
    const r = calcScore('React Developer', '', DEFAULT_SCORING);
    expect(r.score).toBe(10);
    expect(r.matches.some((m) => m.includes('react'))).toBe(true);
  });

  it('stacks multiple core keywords', () => {
    // TypeScript + React + Node.js + Fullstack = +40
    const r = calcScore(
      'Fullstack Developer on TypeScript, React, Node.js',
      '',
      DEFAULT_SCORING
    );
    expect(r.score).toBeGreaterThanOrEqual(30);
    expect(r.matches.length).toBeGreaterThanOrEqual(3);
  });

  it('adds related stack bonus', () => {
    const r = calcScore(
      'React Developer with PostgreSQL and Docker',
      'Опыт 1-3 года',
      DEFAULT_SCORING
    );
    // react(+10) + postgresql(+5) + postgres(+5) + docker(+5) = +25
    expect(r.score).toBeGreaterThanOrEqual(20);
  });

  it('applies junior penalty', () => {
    const r = calcScore('Junior React Developer', '', DEFAULT_SCORING);
    // react(+10) + junior(-3) = +7
    expect(r.score).toBe(7);
    expect(r.matches.some((m) => m.includes('junior'))).toBe(true);
  });

  it('applies soft senior penalty', () => {
    const r = calcScore('Senior React Developer', '', DEFAULT_SCORING);
    // react(+10) + senior(-1) = +9
    expect(r.score).toBe(9);
  });

  it('hard-excludes 1C', () => {
    const r = calcScore('Разработчик 1С', '', DEFAULT_SCORING);
    expect(r.excluded).toBe(true);
    expect(r.score).toBe(-999);
  });

  it('hard-excludes PHP', () => {
    const r = calcScore('PHP Backend Developer', '', DEFAULT_SCORING);
    expect(r.excluded).toBe(true);
  });

  it('hard-excludes Kotlin/Flutter/Swift (mobile native)', () => {
    expect(calcScore('Kotlin Senior', '', DEFAULT_SCORING).excluded).toBe(true);
    expect(calcScore('Flutter Mobile Dev', '', DEFAULT_SCORING).excluded).toBe(true);
    expect(calcScore('Swift iOS Engineer', '', DEFAULT_SCORING).excluded).toBe(true);
  });

  it('hard-excludes STM32 / электроника', () => {
    expect(calcScore('Инженер-программист STM32 (C++)', '', DEFAULT_SCORING).excluded).toBe(true);
    expect(
      calcScore('Инженер-разработчик электроники', '', DEFAULT_SCORING).excluded
    ).toBe(true);
  });

  it('hard-excludes Elixir (not in profile stack)', () => {
    const r = calcScore('Cтажёр разработчик Elixir', '', DEFAULT_SCORING);
    expect(r.excluded).toBe(true);
  });

  it('case-insensitive matching', () => {
    const a = calcScore('TYPESCRIPT Developer', '', DEFAULT_SCORING);
    const b = calcScore('typescript developer', '', DEFAULT_SCORING);
    expect(a.score).toBe(b.score);
  });

  it('returns 0 score for unrelated title (no matches, no exclusions)', () => {
    const r = calcScore('Frontend Developer', '', DEFAULT_SCORING);
    // "Frontend" нет в дефолтном списке, "Developer" тоже — score=0
    expect(r.excluded).toBe(false);
    expect(r.score).toBe(0);
    expect(r.matches).toHaveLength(0);
  });
});

// ============================================================
// Integration: scoreVacancy wraps raw parsed data
// ============================================================
describe('scoreVacancy', () => {
  it('extends raw vacancy with score/matches/excluded', () => {
    const raw = {
      id: '1',
      title: 'Fullstack TypeScript Developer',
      tags: 'Опыт 3-6 лет',
      url: 'https://hh.ru/vacancy/1',
    };
    const result = scoreVacancy(raw, DEFAULT_SCORING);

    expect(result.id).toBe('1');
    expect(result.title).toBe('Fullstack TypeScript Developer');
    expect(result.score).toBeGreaterThan(0);
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.excluded).toBe(false);
  });
});

// ============================================================
// Real-world titles from HH fixture
// ============================================================
describe('Regression: real HH titles from test-run', () => {
  const cases = [
    {
      title: 'AI-first Full Stack Developer (Node.js, React, PostgreSQL)',
      minScore: 30,
    },
    {
      title: 'Fullstack Developer (Node.js + React + Telegram Bot API)',
      minScore: 25,
    },
    {
      title: 'Senior React и Electron разработчик',
      minScore: 5, // react(+10) + senior(-1) = +9
    },
    {
      title: 'Старший/Ведущий разработчик 1С',
      excluded: true,
    },
    {
      title: 'Cтажёр разработчик Elixir',
      excluded: true,
    },
  ];

  cases.forEach(({ title, minScore, excluded }) => {
    it(`"${title}"`, () => {
      const r = calcScore(title, '', DEFAULT_SCORING);
      if (excluded) {
        expect(r.excluded).toBe(true);
      } else {
        expect(r.excluded).toBe(false);
        expect(r.score).toBeGreaterThanOrEqual(minScore!);
      }
    });
  });
});
