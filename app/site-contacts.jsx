export default function PublicContacts({settings}){
 const s=settings||{};const links=[['E-Mail',s.supportEmail&&`mailto:${s.supportEmail}`],['Telefon',s.supportPhone&&`tel:${s.supportPhone}`],['WhatsApp',s.whatsapp&&`https://wa.me/${s.whatsapp.slice(1)}`],...['instagram','facebook','youtube','tiktok','linkedin','x'].map(k=>[k,s[k]])].filter(([,url])=>url)
 return links.length?<section aria-label="ELYSERA Kontakt"><ul>{links.map(([name,url])=><li key={name}><a href={url} rel="noopener noreferrer">{name}</a></li>)}</ul></section>:null
}
