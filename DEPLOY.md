# Деплой HH Scanner

## Варианты распространения

### 1. Developer mode (личное использование, без публикации)

Самый быстрый вариант — подходит если расширение нужно только тебе.

```bash
npm install
npm run build
```

1. Открой `chrome://extensions/`
2. Включи **Developer mode** (переключатель справа сверху)
3. **Load unpacked** → выбери папку `dist/`
4. Расширение активно

Обновление: пересобрал → в `chrome://extensions/` кликни ⟳ на карточке расширения.

### 2. Chrome Web Store (публичный релиз)

#### Подготовка

1. **Регистрация разработчика** — [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Единоразовый взнос $5
   - Аккаунт Google

2. **Сборка релиза:**
```bash
npm run build
cd dist && zip -r ../hh-scanner-v1.0.0.zip . && cd ..
```

3. **Ассеты для стора** (подготовить заранее):
   - Иконка 128×128 (у нас уже есть в `public/icons/icon128.png`)
   - Скриншоты 1280×800 или 640×400 (минимум 1, рекомендуется 3–5)
   - Небольшое промо-изображение 440×280 (опционально)
   - Описание: короткое (до 132 симв) + подробное

#### Загрузка

1. Dashboard → **New item**
2. Загрузи `hh-scanner-v1.0.0.zip`
3. Заполни:
   - **Product details** — название, описание, категория (Productivity)
   - **Privacy practices** — опиши что расширение:
     - Читает контент страниц `hh.ru` (для парсинга)
     - Хранит данные локально в `chrome.storage.local`
     - Не отправляет данные на серверы
   - **Distribution** — регион, Public / Unlisted / Private
4. **Submit for review**
5. Ожидание модерации: обычно 1–3 дня

### 3. Установка из .crx (ручная публикация, например через GitHub Releases)

```bash
# Сгенерировать .crx через Chrome CLI (нужен Chrome + ключ)
# На macOS/Linux:
google-chrome --pack-extension=./dist --pack-extension-key=./key.pem

# Первый раз (создаёт key.pem):
google-chrome --pack-extension=./dist
```

Публикуй `dist.crx` в GitHub Releases. Пользователи смогут перетащить файл в `chrome://extensions/`.

**⚠️ Важно:** с Chrome 75+ `.crx` из сторонних источников по умолчанию блокируются.
Работает только для Enterprise-политик или Developer mode.

---

## CI/CD (GitHub Actions)

Автоматический релиз на тэги `v*.*.*`:

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Pack extension
        run: cd dist && zip -r ../hh-scanner-${{ github.ref_name }}.zip .
      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: hh-scanner-*.zip
          generate_release_notes: true
```

Опционально — авто-публикация в Chrome Web Store через [chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload):

```yaml
      - name: Publish to Chrome Web Store
        run: npx chrome-webstore-upload-cli@2 upload \
          --source hh-scanner-${{ github.ref_name }}.zip \
          --auto-publish
        env:
          EXTENSION_ID: ${{ secrets.CHROME_EXT_ID }}
          CLIENT_ID: ${{ secrets.CHROME_CLIENT_ID }}
          CLIENT_SECRET: ${{ secrets.CHROME_CLIENT_SECRET }}
          REFRESH_TOKEN: ${{ secrets.CHROME_REFRESH_TOKEN }}
```

---

## Версионирование

Версия хранится в `package.json` и автоматически пробрасывается в `manifest.json` через `@crxjs/vite-plugin`.

```bash
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

git push --follow-tags
```

Если настроен CI — автоматически соберётся и опубликуется релиз.

---

## Privacy Policy (требование Chrome Web Store)

Для публикации в сторе нужна страница с политикой конфиденциальности.
Минимальный шаблон:

```markdown
# HH Scanner — Privacy Policy

## Какие данные собирает расширение

HH Scanner читает публичные страницы поиска вакансий на hh.ru
для извлечения данных о вакансиях (название, работодатель, зарплата,
описание, теги, город).

## Где хранятся данные

Все собранные данные хранятся **локально** в браузере через
`chrome.storage.local`. Данные не передаются на сервера разработчика
или третьих лиц.

## Какие разрешения запрашиваются

- `storage` — локальное хранение вакансий и настроек
- `tabs` — открытие вкладок hh.ru для сканирования страниц пагинации
- `activeTab` — доступ к текущей вкладке для парсинга
- `scripting` — инъекция парсера в страницы hh.ru
- `host_permissions: hh.ru` — работа только с hh.ru

## Контакты

Вопросы: d.nikulshin.work@gmail.com
```

Хостинг: GitHub Pages, Notion, Google Docs с публичной ссылкой.

---

## Чеклист перед публикацией

- [ ] `npm test` — все тесты проходят
- [ ] `npm run build` — сборка без ошибок/ворнингов
- [ ] Версия в `package.json` обновлена
- [ ] `CHANGELOG.md` обновлён
- [ ] Скриншоты и иконки готовы
- [ ] Privacy Policy опубликована
- [ ] `README.md` актуален
- [ ] Проверено ручное тестирование: скан 5 страниц, фильтры, скоринг, экспорт
- [ ] Проверка на свежем профиле Chrome (чистая установка)
