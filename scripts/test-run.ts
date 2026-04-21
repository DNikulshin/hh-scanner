// Тестовый прогон — имитирует полный workflow расширения
// без запуска самого Chrome: парсинг → скоринг → фильтрация

import { Window } from 'happy-dom';
import { parseAllCards, getTotalCount, getPageCount } from '../src/shared/parser';
import { scoreVacancy } from '../src/shared/scoring';
import { DEFAULT_SCORING } from '../src/shared/constants';
import { SERP_PAGE } from '../src/shared/__fixtures__/hh-cards';

const win = new Window({ url: 'https://hh.ru/search/vacancy?employment=project' });
const doc = win.document;
doc.documentElement.innerHTML = SERP_PAGE;

// ---------- Имитация парсинга ----------
const raw = parseAllCards(doc as unknown as Document);
const total = getTotalCount(doc as unknown as Document);
const pages = getPageCount(doc as unknown as Document);

console.log('═══════════════════════════════════════════════════════════');
console.log('  HH SCANNER — TEST RUN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`\n📊 Парсинг страницы:`);
console.log(`   Всего вакансий на HH: ${total}`);
console.log(`   Страниц пагинации: ${pages}`);
console.log(`   Карточек распарсено: ${raw.length}`);

// ---------- Скоринг ----------
const scored = raw.map((v) => scoreVacancy(v, DEFAULT_SCORING));
const excluded = scored.filter((v) => v.excluded);
const relevant = scored.filter((v) => !v.excluded && v.score >= DEFAULT_SCORING.minScore);
const lowScore = scored.filter((v) => !v.excluded && v.score < DEFAULT_SCORING.minScore);

console.log(`\n🎯 Скоринг (профиль Никульшина):`);
console.log(`   Жёстко исключено: ${excluded.length}`);
console.log(`   Ниже минимального порога: ${lowScore.length}`);
console.log(`   Релевантных: ${relevant.length}`);

// ---------- Детали ----------
console.log(`\n🔍 РЕЛЕВАНТНЫЕ (топ по score):`);
console.log('───────────────────────────────────────────────────────────');
relevant
  .sort((a, b) => b.score - a.score)
  .forEach((v, i) => {
    console.log(`\n  ${i + 1}. [${v.score > 0 ? '+' : ''}${v.score}] ${v.title}`);
    console.log(`     🏢 ${v.employer ?? '—'}   ${v.rating ? `★ ${v.rating}` : ''}`);
    console.log(`     📍 ${v.city ?? '—'}`);
    console.log(`     💰 ${formatSalary(v.salary)}`);
    console.log(`     🔗 ${v.url}`);
    console.log(`     🏷️  ${v.tags}`);
    console.log(`     ✨ Совпадения: ${v.matches.slice(0, 6).join(', ')}${v.matches.length > 6 ? '…' : ''}`);
  });

console.log('\n\n❌ ИСКЛЮЧЕНО:');
console.log('───────────────────────────────────────────────────────────');
excluded.forEach((v) => {
  console.log(`   • [${v.score}] ${v.title}  —  (hardExclude сработал)`);
});

if (lowScore.length > 0) {
  console.log('\n⚠️  LOW-SCORE:');
  console.log('───────────────────────────────────────────────────────────');
  lowScore.forEach((v) => {
    console.log(`   • [${v.score}] ${v.title}  —  matches: ${v.matches.join(', ') || 'none'}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════════\n');

// ---------- Helpers ----------
function formatSalary(s: { raw: string | null; from: number | null; to: number | null; currency: string | null; period: string | null }) {
  if (!s.raw) return '—';
  const cur = s.currency === 'USD' ? '$' : s.currency === 'EUR' ? '€' : '₽';
  const per = s.period === 'hour' ? '/ч' : s.period === 'project' ? '/проект' : '/мес';
  const fmt = (n: number) => n.toLocaleString('ru-RU');
  if (s.from && s.to) return `${fmt(s.from)}–${fmt(s.to)} ${cur}${per}`;
  if (s.from) return `от ${fmt(s.from)} ${cur}${per}`;
  if (s.to) return `до ${fmt(s.to)} ${cur}${per}`;
  return s.raw;
}
