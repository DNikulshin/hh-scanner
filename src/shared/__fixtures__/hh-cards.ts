// Реальные фрагменты HTML карточек с hh.ru (захвачены 21.04.2026)
// Используются и для тестового прогона, и для Vitest

export const CARD_WITH_SALARY = `
<div class="vacancy-card">
  <div id="132191637" class="vacancy-card--n77Dj8TY8VIUF0yM font-inter">
    <div class="vacancy-info">
      <a class="magritte-link" data-qa="serp-item__title" href="https://hh.ru/vacancy/132191637?query=X&hhtmFrom=vacancy_search_list">
        <span data-qa="serp-item__title-text">Fullstack Developer (Node.js + React + Telegram Bot API)</span>
      </a>
      <div>
        <span class="magritte-text_typography-label-1-regular">от 200 000 ₽ за месяц, на руки</span>
        <div class="compensation-labels">
          <span data-qa="vacancy-serp__vacancy-work-experience-between1And3">Опыт 1-3 года</span>
          <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
          <span data-qa="vacancy-label-side-job">Подработка</span>
        </div>
      </div>
      <a data-qa="vacancy-serp__vacancy-employer" href="/employer/1011638">
        <span data-qa="vacancy-serp__vacancy-employer-text">ООО&nbsp;Митэг</span>
      </a>
      <span data-qa="company-review-rating-value">5.0</span>
      <span data-qa="vacancy-serp__vacancy-address">Москва</span>
    </div>
  </div>
</div>
`;

export const CARD_NO_SALARY = `
<div class="vacancy-card">
  <div id="132093739">
    <a data-qa="serp-item__title" href="https://hh.ru/vacancy/132093739?query=Y">
      <span data-qa="serp-item__title-text">Frontend Developer</span>
    </a>
    <span data-qa="vacancy-serp__vacancy-work-experience-between3And6">Опыт 3-6 лет</span>
    <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
    <span data-qa="vacancy-label-side-job">Подработка</span>
    <span data-qa="vacancy-serp__vacancy-employer-text">ООО ДжазТим</span>
    <span data-qa="vacancy-serp__vacancy-address">Минск</span>
  </div>
</div>
`;

export const CARD_EXCLUDED_1C = `
<div class="vacancy-card">
  <div id="131265667">
    <a data-qa="serp-item__title" href="https://hh.ru/vacancy/131265667">
      <span data-qa="serp-item__title-text">Старший/Ведущий разработчик 1С</span>
    </a>
    <span data-qa="vacancy-serp__vacancy-employer-text">Детский мир. ДМ-тех</span>
    <span data-qa="vacancy-serp__vacancy-address">Москва</span>
    <span data-qa="vacancy-serp__vacancy-work-experience-between3And6">Опыт 3-6 лет</span>
    <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
  </div>
</div>
`;

export const CARD_SALARY_RANGE = `
<div class="vacancy-card">
  <div id="131957917">
    <a data-qa="serp-item__title" href="https://hh.ru/vacancy/131957917">
      <span data-qa="serp-item__title-text">Senior React и Electron разработчик</span>
    </a>
    <span class="magritte-text_typography-label-1-regular">200 000 – 350 000 ₽ за месяц, до вычета налогов</span>
    <span data-qa="vacancy-serp__vacancy-work-experience-moreThan6">Опыт более 6 лет</span>
    <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
    <span data-qa="vacancy-serp__vacancy-employer-text">GO Digital</span>
    <span data-qa="company-review-rating-value">4.1</span>
    <span data-qa="vacancy-serp__vacancy-address">Москва</span>
  </div>
</div>
`;

export const CARD_SALARY_USD = `
<div class="vacancy-card">
  <div id="131927036">
    <a data-qa="serp-item__title" href="https://hh.ru/vacancy/131927036">
      <span data-qa="serp-item__title-text">AI-first Full Stack Developer (Node.js, React, PostgreSQL)</span>
    </a>
    <span>10 – 20 $ за час, на руки</span>
    <span data-qa="vacancy-serp__vacancy-work-experience-moreThan6">Опыт более 6 лет</span>
    <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
    <span data-qa="vacancy-serp__vacancy-employer-text">ООО Современные Решения</span>
    <span data-qa="vacancy-serp__vacancy-address">Астана</span>
  </div>
</div>
`;

export const CARD_JUNIOR = `
<div class="vacancy-card">
  <div id="132165696">
    <a data-qa="serp-item__title" href="https://hh.ru/vacancy/132165696">
      <span data-qa="serp-item__title-text">Cтажёр разработчик Elixir</span>
    </a>
    <span data-qa="vacancy-serp__vacancy-work-experience-noExperience">Без опыта</span>
    <span data-qa="vacancy-label-work-schedule-remote">Можно удалённо</span>
    <span data-qa="vacancy-serp__vacancy-employer-text">Ecom.tech</span>
  </div>
</div>
`;

export const SERP_PAGE = `
<!doctype html>
<html>
<body>
  <h1>Найдена 231 вакансия «TypeScript OR React OR Node.js OR Next.js OR разработчик»</h1>
  <div data-qa="vacancy-serp__vacancy">${CARD_WITH_SALARY}</div>
  <div data-qa="vacancy-serp__vacancy">${CARD_NO_SALARY}</div>
  <div data-qa="vacancy-serp__vacancy">${CARD_EXCLUDED_1C}</div>
  <div data-qa="vacancy-serp__vacancy">${CARD_SALARY_RANGE}</div>
  <div data-qa="vacancy-serp__vacancy">${CARD_SALARY_USD}</div>
  <div data-qa="vacancy-serp__vacancy">${CARD_JUNIOR}</div>
  <nav data-qa="pager-block">
    <a href="https://hh.ru/search/vacancy?page=0">1</a>
    <a href="https://hh.ru/search/vacancy?page=1">2</a>
    <a href="https://hh.ru/search/vacancy?page=2">3</a>
    <a href="https://hh.ru/search/vacancy?page=3">4</a>
    <a href="https://hh.ru/search/vacancy?page=4">5</a>
  </nav>
</body>
</html>
`;
