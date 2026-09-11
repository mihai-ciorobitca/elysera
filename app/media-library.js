export const legacyMediaRoot='/media/renewal-2026/'
export const mediaRoot='/media/wavespeed-4k/'
const aliases={
 'ugc-serum':'ugc-serum-20260912','story-serum':'ugc-serum-20260912',
 'ugc-toner':'ugc-toner-20260912',
 'hero':'hero-desktop','atelier-collection':'hero-desktop',
 'ugc-creator':'ugc-serum','ugc-morning':'ugc-toner','ugc-eye':'ugc-eye-20260912',
 'home-story':'story-serum','home-finder':'finder-eye',
 'serum-application':'story-serum','eye-application':'finder-eye',
 'routine-serum':'story-serum','routine-eye':'finder-eye','routine-toner':'toner-application',
 'serum-detail':'story-serum','toner-detail':'toner-application','eye-detail':'finder-eye',
 'about-portrait':'story-serum','contact-portrait':'toner-application',
 'toner-application':'ugc-toner','finder-eye':'ugc-eye','ugc-evening':'story-serum'
}
export const mediaName=name=>{let key=name;while(aliases[key]&&aliases[key]!==key)key=aliases[key];return key}
export const mediaImage=(name,small=false)=>`${mediaRoot}${mediaName(name)}${small?'-560':''}.webp`
export const mediaSrcSet=name=>[560,1120,1680].map(width=>`${mediaRoot}${mediaName(name)}-${width}.webp ${width}w`).concat(`${mediaImage(name)} ${mediaName(name).endsWith('-20260912')?2576:mediaName(name)==='hero-desktop'?3840:2160}w`).join(', ')
// New campaign films will be added only after they match the approved stills.
export const mediaVideo=()=>null
