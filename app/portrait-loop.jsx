'use client'
import {CampaignImage} from './campaign'
export default function PortraitLoop({name,alt}){return <div className="portrait-loop" data-portrait-loop={name} data-ready={false}><CampaignImage name={name} alt={alt} animate={false}/></div>}
