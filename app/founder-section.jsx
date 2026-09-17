import {jessicaProfile} from './jessica-profile'

export default function FounderSection({person='bettina'}){
 const isJessica=person==='jessica', name=isJessica?jessicaProfile.name:'Bettina Mattheus'
 const sectionId=isJessica?'jessica-winterholler':'bettina-mattheus',titleId=isJessica?'jessica-title':'founder-title'
 const portrait=isJessica?'/media/jessica/portrait-confident-1122.webp':'/media/bettina/portrait-confident.webp'
 const expression=isJessica?'im dunkelblauen Anzug mit heller Bluse':'stehend mit verschränkten Armen im dunkelblauen Hosenanzug'
 return <section className={`founder-section${isJessica?' jessica-founder':''}`} id={sectionId} aria-labelledby={titleId}>
  <div className="founder-portraits"><div className="founder-frames"><img src={portrait} width="1122" height="1402" loading="lazy" decoding="async" alt={`${name} – ${expression}`} className="is-active"/></div></div>
  {isJessica?<div className="founder-copy"><span className="eyebrow">DIE FRAU HINTER ELYSERA</span><h2 id={titleId}>{jessicaProfile.name}</h2><p className="founder-role">{jessicaProfile.role}</p>{jessicaProfile.paragraphs.map(p=><p key={p}>{p}</p>)}</div>:<div className="founder-copy"><span className="eyebrow">DIE FRAU HINTER ELYSERA</span><h2 id="founder-title">Bettina Mattheus</h2><p className="founder-role">Mitgründerin · Produktentwicklung & Hautkonzept</p><p>Mehr als 25 Jahre Hautpraxis prägen ihren Blick auf Pflege. Als Kosmetikerin hat Bettina Mattheus Menschen beraten, als Dozentin Wissen vermittelt und Nachwuchskräfte ausgebildet.</p><p>Seit Juni 2026 verantwortet sie bei ELYSERA die Produktentwicklung und das Hautkonzept. Ihr Anspruch: Wirkstoffe, Verträglichkeit, Textur und Anwendung sollen im Alltag zusammenpassen.</p><blockquote>„Ich wollte eine Pflegeroutine entwickeln, deren Aufbau nachvollziehbar ist, deren Texturen man gerne verwendet und bei der die einzelnen Schritte sinnvoll zusammenspielen.“</blockquote><p className="founder-credit">Bettina Mattheus</p></div>}
 </section>
}
