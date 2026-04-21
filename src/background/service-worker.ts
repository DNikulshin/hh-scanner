import {
  scoringStorage,
  vacanciesStorage,
  progressStorage,
  settingsStorage,
} from '@shared/storage';
import { scoreVacancy } from '@shared/scoring';
import { buildPageUrl } from '@shared/parser';
import type { Message, Vacancy, RawVacancy, ScanProgress } from '@shared/types';

// ============================================================
// BACKGROUND SERVICE WORKER
// Управляет многостраничным сканированием.
// ============================================================

console.log('[HH Scanner] Background service worker started');

// Состояние активного скана
interface ScanState {
  active: boolean;
  tabId: number | null;
  baseUrl: string;
  currentPage: number;
  totalPages: number;
}

let scanState: ScanState = {
  active: false,
  tabId: null,
  baseUrl: '',
  currentPage: 0,
  totalPages: 0,
};

// ---------- Клик по иконке расширения открывает dashboard ----------
// (popup при этом всё равно показывается — это быстрые действия)
chrome.runtime.onInstalled.addListener(() => {
  console.log('[HH Scanner] Extension installed');
  openDashboard();
});

// ---------- Открытие dashboard-страницы ----------
async function openDashboard() {
  const url = chrome.runtime.getURL('src/dashboard/index.html');
  const existing = await chrome.tabs.query({ url });

  if (existing.length > 0 && existing[0].id) {
    await chrome.tabs.update(existing[0].id, { active: true });
    if (existing[0].windowId) {
      await chrome.windows.update(existing[0].windowId, { focused: true });
    }
  } else {
    await chrome.tabs.create({ url });
  }
}

// ---------- Основной цикл сканирования ----------
async function startScan(url: string): Promise<void> {
  if (scanState.active) {
    console.warn('[HH Scanner] Scan already active');
    return;
  }

  const parsedUrl = new URL(url);
  parsedUrl.searchParams.delete('page');
  parsedUrl.searchParams.delete('search_session_id');

  scanState = {
    active: true,
    tabId: null,
    baseUrl: parsedUrl.toString(),
    currentPage: 0,
    totalPages: 0,
  };

  await progressStorage.set({
    status: 'scanning',
    currentPage: 0,
    totalPages: 0,
    totalVacancies: 0,
    relevantCount: 0,
    excludedCount: 0,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  });

  // Открываем первую страницу в новой вкладке
  const tab = await chrome.tabs.create({
    url: buildPageUrl(scanState.baseUrl, 0),
    active: false,
  });
  scanState.tabId = tab.id ?? null;

  // Дальше логика через onMessage: content script пришлёт PARSE_RESULT,
  // мы обработаем и перейдём на следующую страницу.
}

async function stopScan(reason?: string): Promise<void> {
  const progress = await progressStorage.get();
  await progressStorage.set({
    ...progress,
    status: reason === 'error' ? 'error' : 'done',
    finishedAt: new Date().toISOString(),
    error: reason === 'error' ? 'Scan failed' : undefined,
  });

  if (scanState.tabId !== null) {
    try {
      await chrome.tabs.remove(scanState.tabId);
    } catch {
      /* tab already closed */
    }
  }

  scanState = {
    active: false,
    tabId: null,
    baseUrl: '',
    currentPage: 0,
    totalPages: 0,
  };

  console.log('[HH Scanner] Scan finished', reason ?? 'done');
}

// ---------- Обработка результата парсинга страницы ----------
async function handleParseResult(payload: {
  vacancies: RawVacancy[];
  page: number;
  totalPages: number;
  totalCount: number;
}) {
  // Если скан не активен — просто сохраняем данные с текущей страницы
  // (ручной режим: пользователь просто открыл hh.ru)
  const isPassive = !scanState.active;

  const scoring = await scoringStorage.get();
  const scored: Vacancy[] = payload.vacancies.map((raw) => ({
    ...scoreVacancy(raw, scoring),
    status: 'new',
  }));

  const relevant = scored.filter((v) => !v.excluded && v.score >= scoring.minScore);
  await vacanciesStorage.upsert(relevant);

  const prev = await progressStorage.get();
  const nextProgress: ScanProgress = {
    ...prev,
    currentPage: payload.page,
    totalPages: payload.totalPages,
    totalVacancies: (prev.totalVacancies ?? 0) + payload.vacancies.length,
    relevantCount: (prev.relevantCount ?? 0) + relevant.length,
    excludedCount: (prev.excludedCount ?? 0) + scored.filter((v) => v.excluded).length,
  };
  await progressStorage.set(nextProgress);

  console.log(
    `[HH Scanner] Page ${payload.page}/${payload.totalPages - 1}: ${relevant.length} relevant / ${payload.vacancies.length} total`
  );

  if (isPassive) return;

  // Активный скан — двигаемся дальше
  scanState.totalPages = payload.totalPages;

  const nextPage = payload.page + 1;
  if (nextPage >= payload.totalPages) {
    await stopScan();
    return;
  }

  // Переход на следующую страницу с задержкой
  const settings = await settingsStorage.get();
  setTimeout(async () => {
    if (!scanState.active || scanState.tabId === null) return;

    const nextUrl = buildPageUrl(scanState.baseUrl, nextPage);
    try {
      await chrome.tabs.update(scanState.tabId, { url: nextUrl });
      scanState.currentPage = nextPage;
    } catch (e) {
      console.error('[HH Scanner] Failed to navigate', e);
      await stopScan('error');
    }
  }, settings.scanDelayMs);
}

// ---------- Message routing ----------
chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case 'SCAN_START':
        await startScan(msg.url);
        sendResponse({ ok: true });
        break;

      case 'SCAN_STOP':
        await stopScan();
        sendResponse({ ok: true });
        break;

      case 'PARSE_RESULT':
        await handleParseResult(msg.payload);
        sendResponse({ ok: true });
        break;

      case 'OPEN_DASHBOARD':
        await openDashboard();
        sendResponse({ ok: true });
        break;

      case 'GET_STATE':
        sendResponse({
          scanState,
          progress: await progressStorage.get(),
        });
        break;
    }
  })();

  return true; // async response
});
