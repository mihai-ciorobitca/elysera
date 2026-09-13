import {accountEmail} from '../auth/email-templates.mjs'
export const EMAIL_GROUPS={account:'Konto & Produkt',checkout:'Bestellung & Zahlung',status:'Bestellstatus',custom:'Individuelle Nachrichten',internal:'Intern & Team'}
const proposals=[
 ['order-confirmation','Bestellbestätigung','checkout','Deine Beispielbestellung wurde erfasst.','Your sample order has been received.',['bank','plain']],
 ['payment-reminder','Zahlungserinnerung','checkout','Für deine Beispielbestellung ist eine Zahlung offen.','Payment is pending for your sample order.',['bank','card']],
 ['status-pending','Bestellung eingegangen','status','Deine Beispielbestellung wartet auf Bearbeitung.','Your sample order is awaiting processing.'],
 ['status-paid','Zahlung bestätigt','status','Die Zahlung für deine Beispielbestellung ist bestätigt.','Payment for your sample order is confirmed.'],
 ['status-packed','Bestellung verpackt','status','Deine Beispielbestellung ist versandbereit.','Your sample order is ready for shipment.'],
 ['status-shipped','Bestellung versendet','status','Deine Beispielbestellung ist unterwegs. Tracking: DEMO-0001.','Your sample order is on its way. Tracking: DEMO-0001.'],
 ['status-delivered','Bestellung zugestellt','status','Deine Beispielbestellung wurde zugestellt.','Your sample order has been delivered.'],
 ['status-cancelled','Bestellung storniert','status','Deine Beispielbestellung wurde storniert.','Your sample order has been cancelled.'],
 ['status-issue','Problem mit Bestellung','status','Bitte kontaktiere uns zu deiner Beispielbestellung.','Please contact us about your sample order.'],
 ['status-custom-note','Status mit Teamnotiz','status','Beispielnotiz: Wir prüfen deine Lieferangaben.','Sample note: We are checking your delivery details.'],
 ['custom-delay','Lieferverzögerung','custom','Der Versand deiner Beispielbestellung verzögert sich.','Shipment of your sample order is delayed.'],
 ['product-question-answer','Produktfrage beantwortet','account','Beispielantwort: Verwende die Pflege gemäß den Produkthinweisen.','Sample answer: Use the skincare according to its product instructions.'],
 ['contact-form','Kontaktanfrage intern','internal','Beispielanfrage von Beispielkundin: Eine Frage zur Hautpflege.','Sample enquiry: A question about skincare.'],
 ['membership-bank-transfer','Partner-Mitgliedschaft','internal','Beispiel einer internen Benachrichtigung zu einer offenen Mitgliedschaftszahlung.','Sample internal notification about a pending membership payment.'],
]
export const EMAIL_TEMPLATES=[...['verify','reset','changed'].map((kind,i)=>({id:kind,title:['E-Mail bestätigen','Passwort zurücksetzen','Passwort geändert'][i],group:'account',actual:true,locales:['de']})),...proposals.map(([id,title,group,de,en,variants])=>({id,title,group,de,en,variants,actual:false,locales:['de','en']}))]
export const EMAIL_VARIANTS={bank:'Banküberweisung',plain:'Ohne Zahlungsblock',card:'Kartenlink'}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export function buildEmailPreview(id,locale='de',variant){
 const template=EMAIL_TEMPLATES.find(t=>t.id===id)
 if(!template)throw Error('Unbekannte E-Mail-Vorlage')
 locale=template.locales.includes(locale)?locale:'de'
 variant=template.variants?.includes(variant)?variant:template.variants?.[0]
 if(template.actual)return {...accountEmail(id,`https://example.invalid/elysera/${id}?token=FICTIONAL-PREVIEW`),locale,variant}
 const english=locale==='en',subject=`[${english?'DRAFT':'ENTWURF'}] ELYSERA · ${english?template.en.split('.')[0]:template.title}`
 const payment=variant==='bank'?(english?'Sample payment method: bank transfer. No bank account is provided.':'Beispiel-Zahlungsart: Banküberweisung. Keine Bankverbindung hinterlegt.'):variant==='card'?(english?'Sample card link: https://example.invalid/payment':'Beispiel-Kartenlink: https://example.invalid/payment'):''
 const lines=[english?'Fictional preview · Not connected to delivery':'Fiktive Vorschau · Nicht an den Versand angebunden',english?'Hello sample customer,':'Hallo Beispielkundin,',template[locale],template.group==='checkout'?'DEMO-0001 · 1 × ELYSERA Beispielpflege · 49,00 €':'',payment,english?'This message is a proposed template, not an operational email.':'Diese Nachricht ist ein Vorlagenentwurf und keine operative E-Mail.'].filter(Boolean)
 return {subject,locale,variant,text:['ELYSERA',...lines].join('\n\n'),html:`<!doctype html><html lang="${locale}"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:#f3f9fd;color:#183555;font-family:Arial,sans-serif"><main style="max-width:560px;margin:auto;padding:28px 20px;background:white"><header style="font:28px Georgia,serif;letter-spacing:5px;border-bottom:2px solid #a88a47;padding-bottom:22px">ELYSERA</header>${lines.map((line,i)=>`<p style="font-size:${i===0?'12':'15'}px;line-height:1.7;overflow-wrap:anywhere">${escape(line)}</p>`).join('')}<footer style="border-top:1px solid #dfe9f2;padding-top:18px;font-size:12px">ELYSERA · Schönheit verbindet</footer></main></body></html>`}
}
// Prevent preview links from navigating even inside the isolated frame.
export function isolatedEmailHtml(html){return html.replace(/<a\b([^>]*)>/gi,(_,attributes)=>'<span'+(attributes.match(/\sstyle="[^"]*"/i)?.[0]||'')+'>').replace(/<\/a>/gi,'</span>').replace(/<html([^>]*)>/i,'<html$1><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'"></head>')}
