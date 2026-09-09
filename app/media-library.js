export const mediaRoot='/media/renewal-2026/'
const aliases={
 'home-story':'story-serum','home-finder':'finder-eye',
 'serum-application':'story-serum','eye-application':'finder-eye',
 'routine-serum':'story-serum','routine-eye':'finder-eye','routine-toner':'toner-application',
 'serum-detail':'story-serum','toner-detail':'toner-application','eye-detail':'finder-eye',
 'about-portrait':'story-serum','contact-portrait':'toner-application',
 'ugc-morning':'toner-application','ugc-evening':'story-serum','ugc-eye':'finder-eye'
}
export const mediaName=name=>aliases[name]||name
export const mediaImage=(name,small=false)=>`${mediaRoot}${mediaName(name)}${small?'-small':''}.webp`
export const mediaVideo=name=>`${mediaRoot}${mediaName(name)}.mp4`
