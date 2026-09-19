import Link from 'next/link'
const scenes={
 signin:{image:'signin-v2',title:'Dein Moment. Dein ELYSERA.',text:'Schön, dass du wieder da bist.',alt:'Illustratives Porträt einer Frau im natürlichen Tageslicht'},
 register:{image:'register',title:'Deine Pflege beginnt bei dir.',text:'Willkommen in deiner persönlichen ELYSERA Welt.',alt:'Illustratives Porträt einer Frau in einem ruhigen Interieur'},
 resend:{image:'resend',title:'Ein kleiner Schritt fehlt noch.',text:'Bestätige deine E-Mail und vervollständige deinen Zugang.',alt:'Licht auf Leinen und Keramik – illustrative Stilllebenaufnahme'},
 recovery:{image:'resend',title:'Zurück zu deinem Konto.',text:'Wir begleiten dich zum nächsten Schritt.',alt:'Illustratives Stillleben mit Leinen und Keramik'}
}
export default function AccountEditorial({variant='signin'}){
 const scene=scenes[variant]||scenes.recovery
 return <section className="es-login-gallery es-account-editorial" aria-label="ELYSERA">
  <div className="es-gallery-slide is-active"><img src={`/media/page-editorial-2026/${scene.image}-1120.webp`} srcSet={`/media/page-editorial-2026/${scene.image}-560.webp 560w, /media/page-editorial-2026/${scene.image}-1120.webp 1120w`} sizes="(max-width: 800px) 100vw, 50vw" alt={scene.alt} fetchPriority="high" decoding="async"/><div className="es-gallery-copy"><h2>{scene.title}</h2><p>{scene.text}</p></div></div>
  <Link href="/" className="es-gallery-brand" aria-label="ELYSERA Startseite">ELYSERA<small>SKINCARE</small></Link>
 </section>
}
