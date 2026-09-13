 'use client'
import {useId,useRef,useState} from 'react'
import './address-search.css'
const domains=['gmail.com','gmx.de','web.de','hotmail.com','outlook.com','t-online.de','icloud.com','yahoo.de','yahoo.com','gmx.net','outlook.de','hotmail.de','live.de','aol.com','proton.me'];
export function EmailSuggestions({email,onSelect}){
 const id=useId(),input=useRef(null),[focused,setFocused]=useState(false),[index,setIndex]=useState(-1);
 const at=email.indexOf('@'),name=(at<0?email:email.slice(0,at)).trim(),suffix=at<0?'':email.slice(at+1).toLowerCase();
 const suggestions=name&&!/\s|@/.test(name)&&!domains.includes(suffix)?domains.filter(domain=>domain.startsWith(suffix)).map(domain=>name+'@'+domain):[];
 const open=focused&&suggestions.length>0;
 const choose=value=>{onSelect(value);setFocused(false);setIndex(-1);input.current?.focus()};
 return <div className="es-street-search es-inline-email" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
 <label htmlFor={id}>E-Mail-Adresse</label>
 <input ref={input} id={id} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={email} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open?id+'-list':undefined} aria-activedescendant={open&&index>=0?id+'-'+index:undefined} onFocus={()=>setFocused(true)} onChange={e=>{onSelect(e.target.value);setFocused(true);setIndex(-1)}} onKeyDown={e=>{
 if(e.key==='Escape'){e.preventDefault();setFocused(false)}
 if(open&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setIndex(i=>e.key==='ArrowDown'?Math.min(i+1,suggestions.length-1):Math.max(i-1,0))}
 if(open&&e.key==='Enter'&&index>=0){e.preventDefault();choose(suggestions[index])}
 }}/>
 {open&&<div className="es-street-panel"><div role="listbox" id={id+'-list'} aria-label="E-Mail-Vorschläge">{suggestions.map((item,i)=><button key={item} id={id+'-'+i} role="option" aria-selected={i===index} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item)}>{name}<strong>@{item.split('@')[1]}</strong></button>)}</div></div>}
 <p>Deinen Anbieter auswählen oder die vollständige Adresse selbst eingeben.</p>
 </div>
}
export default function RegistrationHelp(){return <section className="es-registration-help" aria-label="Registrierungshilfe"><h2>Hilfe bei deiner Registrierung</h2>
 <details><summary>Wie erstelle ich mein Konto?</summary><p>Trage deinen Vor- und Nachnamen, deine vollständige Adresse und eine gültige Empfehlung ein. Ergänze deine E-Mail-Adresse und wähle ein Passwort. Nach „Konto erstellen“ bestätigst du deine E-Mail über den zugesandten Link.</p></details>
 <details><summary>Wo finde ich meinen Referral-Link?</summary><p>Bitte die Person, die dich eingeladen hat, um ihren ELYSERA Referral-Link oder Empfehlungscode. Beides kannst du in das Feld einfügen. Wenn du über einen Einladungslink gekommen bist, ist der Code bereits vorausgefüllt. Ohne gültige Empfehlung ist keine neue Registrierung möglich.</p></details>
 <details><summary>Welche E-Mail-Adresse kann ich verwenden?</summary><p>Nutze eine E-Mail-Adresse, auf deren Postfach du zugreifen kannst. Die Vorschläge ergänzen nur den Anbieter; prüfe danach die vollständige Adresse. Du kannst auch jeden anderen Anbieter oder eine eigene Domain eingeben.</p></details>
 <details><summary>Wie funktioniert die Google-Registrierung?</summary><p>Wähle „Mit Google registrieren“ und anschließend auf der Anmeldeseite „Mit Google anmelden“. Bei einem neuen Konto ergänzt du danach deine Pflichtangaben und deine Empfehlung. Ein zusätzliches Passwort ist dafür nicht nötig.</p></details>
 <details><summary>Welches Passwort brauche ich?</summary><p>Verwende ein eigenes, langes Passwort mit 12 bis 128 Zeichen und wiederhole es exakt im zweiten Feld. Ein Passwortmanager kann dir dabei helfen.</p></details>
 <details><summary>Keine Bestätigungs-E-Mail erhalten?</summary><p>Prüfe deinen Spam-Ordner und die eingegebene E-Mail-Adresse. Über „Bestätigung erneut senden“ kannst du einen neuen Link anfordern. Hast du bereits ein Konto, nutze „Anmelden“.</p></details>
 </section>}
