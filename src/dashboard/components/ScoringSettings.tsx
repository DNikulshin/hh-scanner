import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { ScoringConfig, ScoringGroup } from '@shared/types';
import clsx from 'clsx';

interface GroupEditorProps {
  groupKey: keyof Omit<ScoringConfig, 'hardExclude' | 'minScore'>;
  group: ScoringGroup;
  onChange: (group: ScoringGroup) => void;
}

function GroupEditor({ group, onChange }: GroupEditorProps) {
  const [kwInput, setKwInput] = useState('');

  const addKeyword = () => {
    const kw = kwInput.trim().toLowerCase();
    if (!kw || group.keywords.includes(kw)) return;
    onChange({ ...group, keywords: [...group.keywords, kw] });
    setKwInput('');
  };

  const removeKeyword = (kw: string) => {
    onChange({ ...group, keywords: group.keywords.filter((k) => k !== kw) });
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-medium text-zinc-200">{group.label}</h4>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Вес:</span>
          <input
            type="number"
            value={group.weight}
            onChange={(e) => onChange({ ...group, weight: parseInt(e.target.value, 10) || 0 })}
            className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-zinc-100 focus:border-brand-600 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {group.keywords.map((kw) => (
          <span
            key={kw}
            className="group inline-flex items-center gap-1 rounded-full bg-zinc-800 py-0.5 pl-2.5 pr-1 text-xs text-zinc-300"
          >
            {kw}
            <button
              onClick={() => removeKeyword(kw)}
              className="rounded-full p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-rose-400"
              aria-label={`Удалить ${kw}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={kwInput}
          onChange={(e) => setKwInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
          placeholder="Добавить ключевик…"
          className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-brand-600 focus:outline-none"
        />
        <button
          onClick={addKeyword}
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ScoringSettings() {
  const scoring = useStore((s) => s.scoring);
  const updateScoring = useStore((s) => s.updateScoring);
  const resetScoring = useStore((s) => s.resetScoring);
  const showSettings = useStore((s) => s.showSettings);
  const setShowSettings = useStore((s) => s.setShowSettings);

  const [draft, setDraft] = useState<ScoringConfig | null>(null);
  const [excludeInput, setExcludeInput] = useState('');

  useEffect(() => {
    if (scoring) setDraft(structuredClone(scoring));
  }, [scoring]);

  if (!showSettings || !draft) return null;

  const setGroup = (key: keyof Omit<ScoringConfig, 'hardExclude' | 'minScore'>) =>
    (group: ScoringGroup) =>
      setDraft({ ...draft, [key]: group });

  const addExclude = () => {
    const kw = excludeInput.trim().toLowerCase();
    if (!kw || draft.hardExclude.includes(kw)) return;
    setDraft({ ...draft, hardExclude: [...draft.hardExclude, kw] });
    setExcludeInput('');
  };

  const removeExclude = (kw: string) => {
    setDraft({ ...draft, hardExclude: draft.hardExclude.filter((k) => k !== kw) });
  };

  const save = async () => {
    await updateScoring(draft);
    setShowSettings(false);
  };

  const reset = async () => {
    if (!confirm('Сбросить все настройки скоринга к дефолтным?')) return;
    await resetScoring();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 py-10 backdrop-blur-sm">
      <div className="w-full max-w-3xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Настройка скоринга</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Ключевые слова с весами. Скор считается по совпадениям в заголовке и тегах.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </header>

        <div className="space-y-3">
          <GroupEditor groupKey="core"          group={draft.core}          onChange={setGroup('core')} />
          <GroupEditor groupKey="related"       group={draft.related}       onChange={setGroup('related')} />
          <GroupEditor groupKey="nice"          group={draft.nice}          onChange={setGroup('nice')} />
          <GroupEditor groupKey="levelPenalty"  group={draft.levelPenalty}  onChange={setGroup('levelPenalty')} />
          <GroupEditor groupKey="seniorPenalty" group={draft.seniorPenalty} onChange={setGroup('seniorPenalty')} />

          {/* Hard exclude */}
          <div className="space-y-3 rounded-lg border border-rose-900/40 bg-rose-950/20 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-rose-200">Жёсткие исключения</h4>
              <span className="text-xs text-rose-300/70">score = −999, вакансия скрывается</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {draft.hardExclude.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-900/30 py-0.5 pl-2.5 pr-1 text-xs text-rose-200"
                >
                  {kw}
                  <button
                    onClick={() => removeExclude(kw)}
                    className="rounded-full p-0.5 text-rose-300/70 hover:bg-rose-800/50 hover:text-rose-100"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExclude()}
                placeholder="Слово-исключение…"
                className="flex-1 rounded border border-rose-900/40 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-100 focus:border-rose-600 focus:outline-none"
              />
              <button
                onClick={addExclude}
                className="rounded bg-rose-900/40 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-900/60"
              >
                +
              </button>
            </div>
          </div>

          {/* Min score */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <label className="flex items-center justify-between text-zinc-200">
              <div>
                <div className="font-medium">Минимальный скор</div>
                <div className="mt-0.5 text-xs text-zinc-400">
                  Вакансии с меньшим баллом не попадают в историю.
                </div>
              </div>
              <input
                type="number"
                value={draft.minScore}
                onChange={(e) => setDraft({ ...draft, minScore: parseInt(e.target.value, 10) || 0 })}
                className="w-24 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-zinc-100 focus:border-brand-600 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
          <button
            onClick={reset}
            className="text-sm text-zinc-500 hover:text-rose-400"
          >
            Сбросить к дефолту
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(false)}
              className={clsx(
                'rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300',
                'hover:bg-zinc-800'
              )}
            >
              Отмена
            </button>
            <button
              onClick={save}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Сохранить
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
