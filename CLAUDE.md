# CLAUDE.md — HH Scanner Chrome Extension

## Итог работы

Создано профессиональное Chrome-расширение **HH Scanner** для умного парсинга
вакансий hh.ru с персонализированным скорингом под профиль Дмитрия Никульшина
(Middle+ Fullstack, TypeScript/React/Next.js/Node.js).

## Профиль разработчика (из резюме)

- **Должность:** Fullstack-разработчик (Middle / Middle+)
- **Локация:** Москва, удалёнка
- **Core stack:** TypeScript, React, Next.js (App Router), Node.js, NestJS/Fastify/Express
- **Backend:** Prisma, PostgreSQL, Redis, WebSocket
- **Infra:** Docker, GitHub Actions, CI/CD
- **Прочее:** TanStack Query, Vitest, PWA, Expo, Caddy

## Архитектура расширения

```
Content Script (hh.ru) → Background Service Worker → chrome.storage.local
                                                          ↓
                                            Dashboard (React SPA) + Popup
```

## Стек проекта

- Manifest V3 + @crxjs/vite-plugin
- React 18 + TypeScript 5 (strict)
- Vite 5 (HMR работает в dev)
- Tailwind CSS 3 (dark theme)
- Zustand для state

## Ключевые решения

### 1. Обход 502 при прямом fetch

HH блокирует fetch из контекста страницы. Решение: background-координатор
открывает реальную вкладку и листает страницы через `chrome.tabs.update()`,
content script парсит DOM на каждой странице.

### 2. Селекторы HH.ru (data-qa)

| Поле         | Селектор                                                                           |
| ------------ | ---------------------------------------------------------------------------------- |
| Карточка     | `[data-qa="vacancy-serp__vacancy"]`                                                |
| ID           | `[id]` внутри карточки                                                             |
| Заголовок    | `[data-qa="serp-item__title-text"]`                                                |
| Ссылка       | `[data-qa="serp-item__title"]`                                                     |
| **Salary**   | **нет data-qa!** — ищем span с ₽/$/€ регекспом                                     |
| Работодатель | `[data-qa="vacancy-serp__vacancy-employer-text"]`                                  |
| Рейтинг      | `[data-qa="company-review-rating-value"]`                                          |
| Город        | `[data-qa="vacancy-serp__vacancy-address"]`                                        |
| Теги         | `[data-qa^="vacancy-label"]`, `[data-qa^="vacancy-serp__vacancy-work-experience"]` |
| Счётчик      | `h1` + regex                                                                       |
| Пагинация    | `[data-qa="pager-block"] a`                                                        |

### 3. Скоринг

- **Core (+10):** typescript, react, next.js, nodejs, nestjs, fullstack
- **Related (+5):** prisma, postgres, docker, redis, websocket
- **Nice (+2):** trpc, tailwind, monorepo, middle
- **Junior penalty (−3):** стажёр, без опыта
- **Senior soft penalty (−1):** senior, lead
- **Hard exclude (−999):** 1с, битрикс, php, java, kotlin, go, stm32, lua и т.д.
- **Min score:** 5

### 4. Persistence

chrome.storage.local через типизированную обёртку.
Дедуп по ID. Пользовательские пометки (liked/applied/hidden) сохраняются
при повторном сканировании.

### 5. UI реактивность

Zustand store подписывается на `chrome.storage.onChanged` — данные в dashboard
обновляются в реальном времени во время скана (без ручного refresh).

## Multi-Profile Support (v1.1)

Расширение теперь поддерживает **два предопределённых профиля резюме**:

### Fullstack Developer (Middle+)

Файл: [rezume_fullstack-developer.txt](rezume_fullstack-developer.txt)

- **Core (+10):** TypeScript, React, Next.js, Node.js, NestJS, Fullstack
- **Related (+5):** Prisma, PostgreSQL, Docker, CI/CD, Redis, WebSocket
- **Nice (+2):** Tailwind, Monorepo, TanStack Query, Caddy, Nginx
- **Junior penalty (-3):** стажёр, без опыта
- **Hard exclude (-999):** 1с, bitrix, PHP, Java, Kotlin, Unity, QA, и т.д.

### DevOps / System Engineer

Файл: [rezume_admin-devops.txt](rezume_admin-devops.txt)

- **Core (+10):** PowerShell, Active Directory, Linux, Docker, DevOps, Kubernetes
- **Related (+5):** Windows Server, Bash, Terraform, Ansible, Zabbix, Prometheus
- **Nice (+2):** OpenStack, SSL/TLS, ITSM, Nginx, HAProxy
- **Junior penalty (-3):** стажёр, без опыта, helpdesk
- **Hard exclude (-999):** PHP, Java, CMS, 1с, Bitrix, QA

### Выбор профиля

1. Dashboard → Settings (⚙️)
2. Раздел "Выберите профиль резюме:"
3. Нажать на нужный профиль — применяется моментально:
   - Конфиг скорирования меняется на соответствующий профилю.
   - **URL поиска hh.ru** переключается на URL активного профиля (`profileUrls[profile]`).
   - **Уже сохранённые вакансии пересчитываются** под новый профиль: обновляются `score`, `matches`, `excluded`; те, что перестали проходить фильтр, помечаются `status: "hidden"` (история не теряется).
4. Для полного пересбора рекомендуется запустить скан заново — вакансии, которые не прошли фильтр при прошлом сканировании, в storage не попали.

### URL поиска per-profile (v1.2)

Каждый профиль хранит свой URL поиска hh.ru в `settings.profileUrls`:

- **fullstack** — по умолчанию: `text=TypeScript+OR+React+OR+Node.js+OR+Next.js+OR+разработчик&employment=project&schedule=remote`.
- **devops** — по умолчанию: `text=devops+OR+системный+администратор+OR+системный+инженер&area=1&schedule=remote`.

В Settings (⚙️) есть блок **«URL поиска hh.ru для активного профиля»** — textarea с URL текущего профиля и кнопка «Сохранить URL». При переключении профиля URL обновляется автоматически (`targetUrl = profileUrls[activeProfile]`).

Миграция со старых версий расширения: если в `chrome.storage.local` лежит `settings` без `profileUrls`, прежний `targetUrl` копируется в `profileUrls[activeProfile]`, остальные профили получают дефолты (см. `DEFAULT_PROFILE_URLS` в [src/shared/storage.ts](src/shared/storage.ts)).

### Файлы для support

- `src/shared/resume-parser.ts` — парсер профилей с predefined конфигами
- `src/shared/constants.ts` — `FULLSTACK_SCORING`, `DEVOPS_SCORING`, `getScoringConfigByProfile()`
- `src/shared/storage.ts` — `DEFAULT_PROFILE_URLS`, `AppSettings.profileUrls`, миграция settings
- `src/shared/types.ts` — `ProfileType = 'fullstack' | 'devops'`
- `src/dashboard/store/useStore.ts` — `setActiveProfile` (пересчёт + смена URL), `updateProfileUrl`
- `src/dashboard/components/ScoringSettings.tsx` — UI выбора профиля + редактор URL

## Артефакты

- `hh-scanner-extension.zip` — **готовый dist** для загрузки в Chrome через
  chrome://extensions → Load unpacked (папка `dist` внутри zip)
- `hh-scanner-source.zip` — исходники проекта для разработки
  (`npm install && npm run build`)

## Установка (быстрый старт)

1. Распаковать `hh-scanner-extension.zip`
2. Chrome → `chrome://extensions/` → включить Developer mode
3. Load unpacked → выбрать папку `dist`
4. Клик по иконке HH в тулбаре → «Запустить скан»
5. Dashboard открывается автоматически

## Что ещё можно улучшить

- [ ] Использовать официальный HH API (OAuth) вместо DOM-парсинга
- [ ] Экспорт в CSV / Google Sheets
- [ ] Push-уведомления о новых релевантных вакансиях (через chrome.alarms)
- [ ] Trend analytics — график новых вакансий по дням/неделям
- [ ] Тесты Vitest для shared слоя (scoring, parser, storage)
