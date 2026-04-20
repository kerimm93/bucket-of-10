import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEventHandler, ClipboardEvent, KeyboardEvent } from 'react';
import { useAppStore } from '../../store/appStore';
import type { BucketItem } from '../../types';
import { renderMarkdown } from '../../utils/markdown';

const cleanPastedBucketLine = (line: string): string => line.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();

export default function FocusTab() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'focus' | 'context' | 'review' | 'studio'>('focus');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const week = useAppStore((s) => s.getCurrentWeek());
  const projects = useAppStore((s) => s.projects);
  const bucketWeeks = useAppStore((s) => s.bucketWeeks);
  const startNewWeek = useAppStore((s) => s.startNewWeek);
  const clearCurrentBucket = useAppStore((s) => s.clearCurrentBucket);
  const openWeek = useAppStore((s) => s.openWeek);
  const updateItem = useAppStore((s) => s.updateItem);
  const fillFromPaste = useAppStore((s) => s.fillFromPaste);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);

  const done = useMemo(() => week?.items.filter((i) => i.done).length ?? 0, [week]);
  const filled = useMemo(() => week?.items.filter((i) => i.title.trim()).length ?? 0, [week]);

  useEffect(() => {
    if (!week) startNewWeek(true);
  }, [week, startNewWeek]);

  const focusByIndex = (index: number) => {
    const el = inputRefs.current[index - 1];
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, item: BucketItem) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      updateItem(item.id, { open: !item.open });
      return;
    }
    if (event.key === 'Enter' && event.altKey) {
      event.preventDefault();
      if (item.index > 1) focusByIndex(item.index - 1);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      if (item.index < 10) focusByIndex(item.index + 1);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (item.open) updateItem(item.id, { open: false });
      else (event.target as HTMLInputElement).blur();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>, item: BucketItem) => {
    const text = event.clipboardData.getData('text');
    const lines = text.split('\n').map(cleanPastedBucketLine).filter(Boolean);
    if (lines.length <= 1) return;
    event.preventDefault();
    const last = fillFromPaste(item.index, lines);
    window.setTimeout(() => focusByIndex(last), 30);
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bucket-of-ten-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importData(text);
    window.alert(result.message);
    event.target.value = '';
  };

  if (!week) return null;

  return (
    <div className="app">
      <div className="topbar">
        <div className="titlebox">
          <h1>Bucket of Ten</h1>
          <p className="subtitle">Dringendes füllt selten alle zehn Plätze. Der Rest ist dein Wachstumsraum. Kontext ist Material — Fokus ist Verbindlichkeit.</p>
        </div>
        <div className="toolbarbox">
          <div className="toolbar">
            <button className="btn primary" onClick={() => startNewWeek()}>Neue Woche</button>
            <button className="btn" onClick={handleExport}>Export</button>
            <label className="btn" htmlFor="import-file">Import</label>
            <input id="import-file" type="file" accept="application/json" hidden onChange={handleImport} />
            <button className="btn" onClick={() => setActiveTab('review')}>Review</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'focus' ? 'active' : ''}`} onClick={() => setActiveTab('focus')}>Fokus</button>
        <button className={`tab ${activeTab === 'context' ? 'active' : ''}`} onClick={() => setActiveTab('context')}>Projekte</button>
        <button className={`tab ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>Reset / Review</button>
        <button className={`tab ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>Prompt Studio</button>
      </div>

      {activeTab === 'focus' ? (
        <section className="panel focus-only">
          <div className="focus-topbar">
            <span className="focus-week-label">{week.label}</span>
            <div className="focus-head-actions">
              <span className="focus-meta-inline">{done} / {filled} erledigt</span>
              <button className="btn-options" onClick={() => setOptionsOpen((x) => !x)}>⋯</button>
            </div>
          </div>

          {optionsOpen && (
            <div className="focus-options-panel">
              <button className="btn small primary" onClick={() => startNewWeek()}>Neue Woche</button>
              <button className="btn small" onClick={clearCurrentBucket}>Liste leeren</button>
            </div>
          )}

          <div className="paper-surface">
            <div className="bucket-list">
              {week.items.map((item, idx) => {
                const project = projects.find((p) => p.id === item.projectId);
                return (
                  <div key={item.id} className={`paper-item ${item.done ? 'done' : ''}`}>
                    <span className="paper-num">{item.index}</span>
                    <div className="paper-row">
                      <input
                        type="checkbox"
                        className="paper-check"
                        checked={item.done}
                        onChange={(e) => updateItem(item.id, { done: e.target.checked })}
                      />
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        className="paper-input"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                        onKeyDown={(e) => onKeyDown(e, item)}
                        onPaste={(e) => onPaste(e, item)}
                      />
                      <div className="paper-row-controls">
                        <button className="btn-paper" onClick={() => updateItem(item.id, { open: !item.open })}>{item.open ? '▲' : '▼'}</button>
                      </div>
                    </div>
                    {item.projectRef && !item.open && <div className="paper-project-hint">{item.projectRef}</div>}
                    {item.open && (
                      <div className="paper-detail-area">
                        <div className="inline-grid">
                          <select className="select" value={item.type} onChange={(e) => updateItem(item.id, { type: e.target.value as BucketItem['type'] })}>
                            <option value="pflicht">Pflicht</option>
                            <option value="pflege">Pflege</option>
                            <option value="wachstum">Wachstum</option>
                            <option value="kreativ">Kreativ</option>
                          </select>
                          <select
                            className="select"
                            value={item.projectId}
                            onChange={(e) => {
                              const pid = e.target.value;
                              const selected = projects.find((p) => p.id === pid);
                              updateItem(item.id, { projectId: pid, projectRef: selected?.title ?? '' });
                            }}
                          >
                            <option value="">(kein Projekt)</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.title || '(ohne Titel)'}</option>
                            ))}
                          </select>
                        </div>
                        {project && <div className="smallmeta">Projekt: {project.title}</div>}
                        <textarea
                          className="textarea"
                          value={item.details}
                          placeholder="Kontext, Unter-Schritte, Why now… (Markdown)"
                          onChange={(e) => updateItem(item.id, { details: e.target.value })}
                        />
                        {item.details && <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.details) }} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="paper-mini-stats">{done} / 10</div>
          </div>

          <div className="focus-history-section">
            <button className="focus-history-toggle" onClick={() => setHistoryOpen((x) => !x)}>
              <span>{historyOpen ? '▾' : '▸'}</span> Wochenverlauf
            </button>
            {historyOpen && (
              <div className="focus-history-content">
                <div className="card-list" id="historyListFocus">
                  {bucketWeeks.map((hist) => (
                    <div className="card" key={hist.id}>
                      <div className="section-head compact">
                        <div>
                          <h3>{hist.label}</h3>
                          <div className="smallmeta">{hist.items.filter((i) => i.title.trim()).length} gefüllt · {hist.items.filter((i) => i.done).length} erledigt</div>
                        </div>
                        <button className="btn small" onClick={() => openWeek(hist.id)}>öffnen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="panel placeholder-panel">
          <h2>{activeTab === 'context' ? 'Projekte' : activeTab === 'review' ? 'Reset / Review' : 'Prompt Studio'}</h2>
          <p>Phase 2: Dieser Bereich wird nach dem stabilen Fokus-Refactor umgesetzt.</p>
        </section>
      )}
    </div>
  );
}
