'use client'
import AutoCarousel from './auto-carousel'
import {DetailIcon} from './design-details'
export default function ReferenceBenefits(){return <AutoCarousel className="reference-benefits" label="Pflegevorteil">{[
 ['peptide','Gezielte Peptidpflege','Drei Produkte mit klaren Aufgaben.'],
 ['texture','Leichte Texturen','Entdecke Serum, Toner und Augenpflege.'],
 ['ritual','Deine Routine','Ein täglicher Moment für dich.'],
].map(([icon,title,copy])=><div key={icon}><DetailIcon name={icon}/><h3>{title}</h3><p>{copy}</p></div>)}</AutoCarousel>}
