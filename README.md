# HH Scanner — Smart Vacancy Filter

Профессиональное Chrome-расширение для умного сбора и фильтрации вакансий с hh.ru с персонализированным скорингом под ваш стек.

## Возможности

- **Авто-сканирование** всех страниц пагинации в фоновом режиме
- **Персонализированный скоринг** — каждая вакансия получает балл на основе совпадений с вашим стеком
- **Настройка весов** через UI — добавляйте/убирайте ключевые слова и меняйте коэффициенты
- **Жёсткие исключения** — автоматически отсекают неподходящие вакансии (1С, Битрикс, PHP и т.д.)
- **Пометки** — лайк / откликнулся / скрыть, с сохранением между сессиями
- **Фильтры и сортировка** — по релевантности, зарплате, рейтингу, дате
- **История** — данные сохраняются в `chrome.storage.local` с дедупликацией по ID
- **Экспорт в JSON** одной кнопкой

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│  Content Script  (на страницах hh.ru)                       │
│  Парсит карточки → отправляет RawVacancy в background        │
└────────────────────┬────────────────────────────────────────┘
                     │ chrome.runtime.sendMessage
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Background Service Worker (MV3)                            │
│  • Координирует многостраничное сканирование                 │
│  • Применяет скоринг                                         │
│  • Сохраняет в chrome.storage.local                          │
└────────────────────┬────────────────────────────────────────┘
                     │ chrome.storage (реактивно)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Dashboard (React SPA) + Popup                              │
│  Zustand store ← chrome.storage.onChanged                    │
└─────────────────────────────────────────────────────────────┘
```

## Стек

- **Vite 5** + `@crxjs/vite-plugin` — дев-сервер с HMR для расширения
- **React 18** + **TypeScript 5** (strict)
- **Tailwind CSS 3** — тёмная тема
- **Zustand** — state management
- **Manifest V3** — современный Chrome API

## Профили резюме (Multi-Profile Support)

Расширение поддерживает **2 готовых профиля** с разными стеками:

### 1️⃣ Fullstack Developer (Middle+)

- **Core (+10):** TypeScript, React, Next.js, Node.js, NestJS, Fullstack
- **Related (+5):** Prisma, PostgreSQL, Docker, CI/CD, Redis, WebSocket
- **Nice (+2):** Tailwind, Monorepo, TanStack Query, Caddy

📄 Справка: [rezume_fullstack-developer.txt](rezume_fullstack-developer.txt)

### 2️⃣ DevOps / System Engineer

- **Core (+10):** PowerShell, Active Directory, Linux, Docker, DevOps, Kubernetes
- **Related (+5):** Windows Server, Bash, Terraform, Ansible, Zabbix, Prometheus
- **Nice (+2):** OpenStack, SSL/TLS, Nginx, HAProxy

📄 Справка: [rezume_admin-devops.txt](rezume_admin-devops.txt)

### Как переключаться

1. Dashboard → ⚙ **Settings**
2. Выбрать профиль: **Fullstack** или **DevOps**
3. Конфиг скорирования обновится моментально
4. При новом сканировании вакансии пересчитаются по новому профилю

## Структура проекта

```
hh-scanner/
├── manifest.config.ts         # MV3 манифест
├── vite.config.ts             # Vite + crxjs
├── src/
│   ├── shared/                # Общий код: типы, скоринг, парсер, storage
│   │   ├── types.ts
│   │   ├── constants.ts       # ← дефолтный скоринг (редактируется через UI)
│   │   ├── parser.ts
│   │   ├── scoring.ts
│   │   └── storage.ts
│   ├── content/
│   │   └── content-script.ts  # Парсер на hh.ru
│   ├── background/
│   │   └── service-worker.ts  # Оркестратор скана
│   ├── dashboard/             # Главный UI (React SPA)
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── store/useStore.ts  # Zustand
│   └── popup/                 # Popup по клику на иконку
└── public/icons/
```

## Установка

### 1. Сборка

```bash
npm install
npm run build
```

Собранное расширение появится в `dist/`.

### 2. Загрузка в Chrome

1. Открой `chrome://extensions/`
2. Включи **Developer mode** (переключатель в правом верхнем углу)
3. Нажми **Load unpacked** → выбери папку `dist/`
4. Иконка расширения появится в тулбаре

### 3. Использование

**Через Popup (быстро):**

1. Клик по иконке → видишь статистику и прогресс
2. Кнопка **▶ Запустить скан** — расширение откроет скрытую вкладку, пройдёт по всем страницам hh.ru, соберёт и оценит вакансии
3. Кнопка **Открыть Dashboard** — полноценный UI

**Через Dashboard:**

- Таблица всех вакансий с оценками
- Фильтры: статус / поиск / мин. зарплата / сортировка
- ⚙ **Settings** — выбор профиля и редактор весов ключевых слов

**Выбор профиля:**

1. Открой Dashboard
2. Нажми ⚙ **Settings** → модалка "Настройка скоринга"
3. Выбери: **Fullstack Developer** или **DevOps / System Engineer**
4. Профиль сохранится → все вакансии пересчитаются
5. При новом сканировании используется выбранный профиль

- ⇣ **Экспорт** → JSON файл

## Dev-режим

```bash
npm run dev
```

Vite с HMR — изменения в UI подхватываются без перезагрузки расширения (для service worker и content script нужно нажимать «Reload» в `chrome://extensions/`).

## Скоринг

По умолчанию настроен под **Middle+ Fullstack на TypeScript стеке** (React / Next.js / Node.js / NestJS / Prisma / Docker).

### Группы весов

| Группа              | Вес  | Примеры ключевиков                    |
| ------------------- | ---- | ------------------------------------- |
| Core stack          | +10  | typescript, react, next.js, nestjs    |
| Related stack       | +5   | prisma, postgresql, docker, redis     |
| Nice-to-have        | +2   | monorepo, trpc, tailwind              |
| Junior penalty      | −3   | junior, стажёр, без опыта             |
| Senior soft penalty | −1   | senior, lead, архитектор              |
| **Hard exclude**    | −999 | 1с, битрикс, php, java, kotlin, stm32 |

Все веса и списки слов редактируются в UI через ⚙ **Скоринг**.

### Формула

```
score = Σ (совпадение ключевика в "title + tags" × вес группы)
```

- Если сработало хотя бы одно слово из `hardExclude` → `score = -999`, вакансия скрывается
- Если `score < minScore` (по умолчанию 5) → вакансия не сохраняется

## Troubleshooting

**"Скан не запускается / не переключает страницы"**  
Проверь что разрешены `tabs` и `host_permissions` для `hh.ru` в `chrome://extensions/ → Details`.

**"Content script не парсит"**  
HH.ru периодически обновляет классы — проверь селекторы в `src/shared/parser.ts`. Все ключевые селекторы через `data-qa="..."` и должны быть стабильны. Если что-то ломается — открой DevTools на hh.ru, найди актуальный `data-qa` и обнови.

**"Service worker спит"**  
MV3 service worker может уснуть — просто кликни по иконке, он проснётся.

## Roadmap

- [ ] Экспорт в CSV / Google Sheets
- [ ] Интеграция с HH API (через OAuth) вместо парсинга DOM
- [ ] Trend analysis — график появления новых вакансий по дням
- [ ] Уведомления о новых релевантных вакансиях (cron-скан)
- [ ] Импорт профиля с резюме PDF для авто-настройки скоринга

## Контекст для разработчиков (Claude & Copilot)

### Ключевые файлы для понимания проекта

1. **[src/shared/resume-parser.ts](src/shared/resume-parser.ts)** — Профили резюме (FULLSTACK_PROFILE, DEVOPS_PROFILE)
2. **[src/shared/constants.ts](src/shared/constants.ts)** — Конфиги скорирования (FULLSTACK_SCORING, DEVOPS_SCORING, getScoringConfigByProfile)
3. **[src/shared/types.ts](src/shared/types.ts)** — Типы (Vacancy, ScoringConfig, ProfileType = 'fullstack' | 'devops')
4. **[src/shared/storage.ts](src/shared/storage.ts)** — Типизированная обёртка chrome.storage.local (AppSettings.activeProfile)
5. **[src/background/service-worker.ts](src/background/service-worker.ts)** — Оркестратор сканирования (использует activeProfile)
6. **[src/dashboard/store/useStore.ts](src/dashboard/store/useStore.ts)** — Zustand store (функция setActiveProfile)
7. **[src/dashboard/components/ScoringSettings.tsx](src/dashboard/components/ScoringSettings.tsx)** — UI для выбора профиля

### Как добавить новый профиль

1. Расширить `ProfileType` в [src/shared/types.ts](src/shared/types.ts):

   ```typescript
   export type ProfileType = "fullstack" | "devops" | "backend"; // +backend
   ```

2. Добавить профиль в [src/shared/resume-parser.ts](src/shared/resume-parser.ts):

   ```typescript
   export const BACKEND_PROFILE: ProfileData = { ... }
   ALL_PROFILES.backend = BACKEND_PROFILE;
   ```

3. Добавить конфиг в [src/shared/constants.ts](src/shared/constants.ts):

   ```typescript
   export const BACKEND_SCORING: ScoringConfig = { ... }
   // обновить getScoringConfigByProfile()
   ```

4. UI обновится автоматически через `getAllProfiles()`

### Архитектура скорирования

**Поток данных:**

```
Content Script парсит DOM
  ↓
RawVacancy (без скора) → background
  ↓
scoreVacancyWithProfile(raw, activeProfile) → Vacancy (с скором)
  ↓
chrome.storage.local
  ↓
Zustand store → React компоненты
```

### Персистентность

- **AppSettings.activeProfile** — сохраняется в `chrome.storage.local` через `settingsStorage`
- При смене профиля → `setActiveProfile()` → обновляется settings + перечитывается config
- Вакансии пересчитываются при следующем сканировании, старые пометки (liked/applied/hidden) сохраняются

### Ключевой момент: chrome.storage.onChanged

`useStore.init()` подписывается на изменения в хранилище. Это позволяет dashboard видеть прогресс сканирования в реальном времени без ручного refresh.

## License

MIT
