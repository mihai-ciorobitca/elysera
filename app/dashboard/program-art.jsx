import Image from 'next/image'
const labels={globe:'Globus in Weiß und Gold',phone:'Smartphone als Meilenstein',car:'Firmenwagen als Meilenstein',legacy:'ELYSERA Legacy Emblem',watch:'Armbanduhr als Meilenstein'}
export function ProgramArt({kind='globe'}){return <Image className={'ep-art ep-art-'+kind} src={'/media/partner-program/'+kind+'.png'} width={724} height={543} sizes="(max-width:700px) 45vw, 300px" alt={labels[kind]} loading="eager"/>}
