import content from './legal-content.json'
import './legal.css'
const headings=new Set(['Widerrufsrecht','Folgen des Widerrufs','Ausschluss bzw. vorzeitiges Erlöschen','Diensteanbieter','Rechtsform','Register','Kontakt','US-Steuernummer (EIN)','Umsatzsteuer','EU-Streitbeilegung'])
function linked(line){return line.split(/(https?:\/\/[^\s]+|office@elysera\.org)/g).map((part,i)=>part.startsWith('http')?<a key={i} href={part}>{part}</a>:part==='office@elysera.org'?<a key={i} href={'mailto:'+part}>{part}</a>:part)}
export default function LegalPage({page}){const lines=content[page].split(/\r?\n/).filter(line=>line.trim());return <article className="section legal-document"><h1>{lines[0]}</h1>{lines.slice(1).map((line,i)=>/^\d+\. /.test(line)||headings.has(line)?<h2 key={i}>{line}</h2>:<p key={i}>{linked(line)}</p>)}</article>}
