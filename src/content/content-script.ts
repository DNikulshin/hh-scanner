import { parseAllCards, getTotalCount, getPageCount, getCurrentPage } from '@shared/parser';
import type { Message } from '@shared/types';

// ============================================================
// CONTENT SCRIPT — работает на страницах hh.ru/search/vacancy
// ============================================================

console.log('[HH Scanner] Content script loaded', location.href);

function scrapeCurrentPage() {
  const vacancies = parseAllCards();
  const totalCount = getTotalCount() ?? 0;
  const totalPages = getPageCount();
  const page = getCurrentPage();

  console.log(
    `[HH Scanner] Page ${page}/${totalPages - 1}: ${vacancies.length} cards, total ${totalCount}`
  );

  return { vacancies, page, totalPages, totalCount };
}

// Слушаем команды от background / popup / dashboard
chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  if (msg.type === 'PARSE_PAGE') {
    const data = scrapeCurrentPage();
    sendResponse({ type: 'PARSE_RESULT', payload: data });
    return true;
  }
  return false;
});

// Автоматически уведомляем background о загрузке страницы
// (background решит, сканировать ли)
chrome.runtime
  .sendMessage({
    type: 'PARSE_RESULT',
    payload: scrapeCurrentPage(),
  } satisfies Message)
  .catch(() => {
    // Если background не ждёт — ничего страшного
  });
