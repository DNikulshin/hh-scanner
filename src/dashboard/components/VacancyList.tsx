import { useStore, selectVisibleVacancies } from '../store/useStore';
import { VacancyCard } from './VacancyCard';

export function VacancyList() {
  const vacancies = useStore(selectVisibleVacancies);
  const totalStored = useStore((s) => s.vacancies.length);
  const progress = useStore((s) => s.progress);

  if (vacancies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
        {totalStored === 0 ? (
          <>
            <div className="text-4xl">📭</div>
            <h3 className="mt-3 text-lg font-semibold text-zinc-200">
              {progress?.status === 'scanning' ? 'Сканирование в процессе…' : 'Пока ничего не собрано'}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {progress?.status === 'scanning'
                ? 'Данные появятся здесь по мере парсинга страниц.'
                : 'Нажми «Запустить скан» — парсер пройдёт по всем страницам hh.ru и соберёт релевантные вакансии.'}
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl">🔍</div>
            <h3 className="mt-3 text-lg font-semibold text-zinc-200">Нет подходящих вакансий</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Попробуй изменить фильтры или сбросить поиск.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vacancies.map((v) => (
        <VacancyCard key={v.id} vacancy={v} />
      ))}
    </div>
  );
}
