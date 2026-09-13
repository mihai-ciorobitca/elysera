'use client';
import { useEffect, useState } from 'react';
import { STORAGE_KEY, DEFAULT_TEMPLATE, SAMPLE, parseContacts, buildMessage, normalizePhone, waLink } from './whatsapp-model.mjs';
import './whatsapp-workspace.css';

export default function WhatsAppWorkspace() {
  const [tab, setTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [savedTemplate, setSavedTemplate] = useState(DEFAULT_TEMPLATE);
  const [marked, setMarked] = useState({});
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [selected, setSelected] = useState('');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const list = parseContacts(JSON.stringify(data.contacts)).contacts;
        if (typeof data.template !== 'string' || data.template.length > 10000) throw new Error();
        setContacts(list); setRaw(JSON.stringify(list.map(({key,...c}) => c), null, 2));
        setTemplate(data.template); setSavedTemplate(data.template);
        const validMarks = {};
        for (const c of list) if (typeof data.marked?.[c.key] === 'string' && Number.isFinite(Date.parse(data.marked[c.key]))) validMarks[c.key] = data.marked[c.key];
        setMarked(validMarks);
      }
    } catch { setError('Gespeicherte Browser-Daten konnten nicht geladen werden. Eine gültige Liste importieren oder lokale Daten entfernen.'); }
    setReady(true);
  }, []);
  function persist(nextContacts = contacts, nextTemplate = savedTemplate, nextMarked = marked) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ contacts: nextContacts, template: nextTemplate, marked: nextMarked })); setError(''); return true; }
    catch { setError('Browser-Speicher ist gesperrt oder voll. Diese Änderung wurde nicht gespeichert.'); return false; }
  }
  function importContacts() {
    try {
      const result = parseContacts(raw);
      const nextMarked = Object.fromEntries(result.contacts.filter(c => marked[c.key]).map(c => [c.key, marked[c.key]]));
      if (!persist(result.contacts, savedTemplate, nextMarked)) return;
      setContacts(result.contacts); setMarked(nextMarked); setSelected('');
      setNotice(`${result.contacts.length} Kontakte in diesem Browser gespeichert. ${result.duplicates} Duplikate übersprungen (erster Eintrag beibehalten).`);
      setTab('contacts');
    } catch (e) { setError(e.message); setNotice(''); }
  }
  function reset() {
    if (confirm === 'contacts') {
      if (!persist([], savedTemplate, {})) return;
      setContacts([]); setMarked({}); setRaw(''); setSelected('');
    } else if (confirm === 'marks') {
      if (!persist(contacts, savedTemplate, {})) return; setMarked({});
    } else if (confirm === 'template') {
      if (!persist(contacts, DEFAULT_TEMPLATE, marked)) return; setTemplate(DEFAULT_TEMPLATE); setSavedTemplate(DEFAULT_TEMPLATE);
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch { setError('Browser-Speicher konnte nicht geleert werden.'); return; }
      setContacts([]); setMarked({}); setRaw(''); setSelected(''); setTemplate(DEFAULT_TEMPLATE); setSavedTemplate(DEFAULT_TEMPLATE); setError('');
    }
    setConfirm(''); setNotice('Lokale Änderung gespeichert.');
  }
  const preview = contacts.find(c => c.key === selected) || contacts[0] || { firstName: 'Example', secondName: 'Contact', orderId: 'DEMO', total: '' };
  return <div className="waw-root">
    <header className="waw-heading"><div><span className="waw-kicker">Kundenkommunikation</span><h2>WhatsApp-Entwürfe</h2><p>Persönliche Nachrichten vorbereiten.</p></div></header>
    <div className="waw-disclosure"><p>Nur lokal gespeichert. Versand erfolgt manuell in WhatsApp.</p><details><summary>Speicherung &amp; Datenschutz</summary><p>Kontakte, gespeicherte Vorlagen und manuelle Markierungen bleiben im localStorage dieses Browsers. Sie werden weder mit dem Team geteilt noch an einen ELYSERA-Server gesendet. Beim Öffnen eines Links erhält WhatsApp die Telefonnummer und den Entwurf. Das bestätigt weder Versand noch Zustellung.</p></details></div>
    {tab !== 'template' && <div className="waw-metrics"><div><strong>{contacts.length}</strong><span>Lokale Kontakte</span></div><div><strong>{contacts.filter(c => normalizePhone(c.phone)).length}</strong><span>Gültiges Nummernformat</span></div><div><strong>{contacts.filter(c => marked[c.key]).length}</strong><span>Manuell kontaktiert</span></div></div>}
    <nav className="waw-tabs" aria-label="Composer sections">{[['contacts','Kontakte'],['template','Vorlage'],['json','JSON importieren']].map(([id,label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => {setTab(id);setConfirm('');}}>{label}</button>)}</nav>
    {error && <p className="waw-error" role="alert">{error}</p>}{notice && <p className="waw-notice" role="status">{notice}</p>}
    {!ready ? <p role="status">Lokaler Arbeitsbereich wird geladen…</p> : <>
    {tab === 'json' && <section className="waw-panel"><h3>Kontakte importieren</h3><p>Ein JSON-Array mit firstName, secondName, email, phone, orderId und total einfügen. Telefonnummern als Text mit Landesvorwahl (8–15 Ziffern); Leerzeichen, Klammern und Bindestriche sind erlaubt. Ungültige Nummern bleiben sichtbar, können WhatsApp aber nicht öffnen.</p><p>Der Import ersetzt die lokale Liste. Doppelte Telefonnummern werden zusammengeführt, ersatzweise E-Mail-Adressen. Der erste Eintrag bleibt erhalten. Maximal 1.000 Kontakte / 1 MB.</p><label htmlFor="waw-json">Kontakte als JSON</label><textarea id="waw-json" className="waw-code" rows={10} value={raw} placeholder={SAMPLE} spellCheck={false} onChange={e => setRaw(e.target.value)} /><div className="waw-actions"><button className="waw-primary" onClick={importContacts}>Prüfen & im Browser speichern</button><button onClick={() => setConfirm('contacts')}>Kontakte entfernen</button></div></section>}
    {tab === 'template' && <section className="waw-panel"><h3>Persönliche Nachricht</h3><label htmlFor="waw-template">Nachrichtenvorlage</label><textarea id="waw-template" rows={9} maxLength={10000} value={template} onChange={e => setTemplate(e.target.value)} /><details className="waw-template-help"><summary>Platzhalter verwenden</summary><p>Platzhalter: <code>{'{firstName}, {lastName}, {orderId}, {total}'}</code>. lastName verwendet das importierte Feld secondName. Unbekannte Platzhalter werden unverändert in die Nachricht übernommen – bitte vor dem Öffnen prüfen.</p></details><div className="waw-actions"><button className="waw-primary" disabled={!template.trim()} onClick={() => {if(persist(contacts,template,marked)){setSavedTemplate(template);setNotice('Vorlage in diesem Browser gespeichert.');}}}>Vorlage speichern</button><button onClick={() => setConfirm('template')}>Standard wiederherstellen</button><span>{template === savedTemplate ? 'Gespeicherte Version' : 'Ungespeicherte Änderungen · in der Vorschau aktiv'}</span></div></section>}
    {tab === 'contacts' && <section className="waw-panel"><div className="waw-section-heading"><h3>Kontaktliste</h3>{contacts.length > 0 && <button onClick={() => setConfirm('marks')}>Markierungen zurücksetzen</button>}</div>{contacts.length === 0 ? <div className="waw-empty"><span className="waw-empty-icon" aria-hidden="true">↗</span><h3>Hier beginnt das nächste Gespräch</h3><p>Kontakte importieren und persönliche Entwürfe vorbereiten. In diesem Browser sind noch keine Kontakte gespeichert.</p><button className="waw-primary" onClick={() => setTab('json')}>Kontakte als JSON importieren</button></div> : <div className="waw-list">{contacts.map(c => <article className="waw-contact" key={c.key}><div><h4>{[c.firstName,c.secondName].filter(Boolean).join(' ') || 'Kontakt ohne Namen'}</h4><p>{c.email || 'Keine E-Mail'}</p><p>{normalizePhone(c.phone) ? `+${normalizePhone(c.phone)}` : `${c.phone || 'Keine Telefonnummer'} · ungültiges Nummernformat`}</p><p>Bestellung: {c.orderId || '—'} · Betrag: {c.total || '—'}</p></div><div className="waw-contact-actions"><button onClick={() => setSelected(c.key)}>Nachricht ansehen</button><label><input type="checkbox" checked={Boolean(marked[c.key])} onChange={e => {const next = {...marked}; if(e.target.checked)next[c.key]=new Date().toISOString();else delete next[c.key];if(persist(contacts,savedTemplate,next))setMarked(next);}} />Manuell kontaktiert</label>{marked[c.key] && <small>Markiert am {new Date(marked[c.key]).toLocaleString()}</small>}</div></article>)}</div>}</section>}
    {(tab === 'template' || (tab === 'contacts' && contacts.length > 0)) && <section className="waw-panel waw-preview"><span className="waw-kicker">{contacts.length ? 'Vorschau für den ausgewählten Kontakt' : 'Beispielvorschau · kein gespeicherter Kontakt'}</span><h3>{[preview.firstName,preview.secondName].filter(Boolean).join(' ') || 'Kontakt ohne Namen'}</h3><pre>{buildMessage(template,preview) || 'Eine Nachricht eingeben, um die Vorschau zu sehen.'}</pre>{contacts.length > 0 && <div className="waw-actions">{waLink(preview,template) ? <a className="waw-primary" href={waLink(preview,template)} target="_blank" rel="noopener noreferrer">Entwurf in WhatsApp öffnen ↗</a> : <span>Öffnen nicht möglich: gültige Telefonnummer und Nachricht erforderlich.</span>}<span>Vor dem Senden prüfen. Markierungen erfolgen manuell und sind keine Zustellbestätigung.</span></div>}</section>}
    <footer className="waw-footer"><span>Lokale Entwürfe · keine Anbieter-Anbindung</span><button onClick={() => setConfirm('all')}>Alle lokalen Daten entfernen</button></footer>
    {confirm && <section className="waw-confirm" role="group" aria-label="Lokales Zurücksetzen bestätigen"><strong>{confirm === 'all' ? 'Alle lokalen Daten dieses Arbeitsbereichs entfernen?' : confirm === 'contacts' ? 'Kontakte entfernen and their manual marks?' : confirm === 'marks' ? 'Alle manuellen Kontaktmarkierungen zurücksetzen?' : 'Vorlage durch den Standard ersetzen?'}</strong><p>Dies betrifft nur diesen Browser. Bei Bedarf vorher eine Kopie aufbewahren.</p><div className="waw-actions"><button className="waw-primary" onClick={reset}>Zurücksetzen bestätigen</button><button onClick={() => setConfirm('')}>Abbrechen</button></div></section>}
    </>}
  </div>;
}
