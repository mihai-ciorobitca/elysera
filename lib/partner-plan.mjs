// Rules mirrored from the existing membership-access, career-plan and ticket program.
export const referralRates=[20,10,6,4,3,2,2,1,1,1]
export const memberships={Standard:2,Premium:5,Diamond:10}
export const milestones=[{id:'phone',name:'iPhone',amount:25000,diamonds:8},{id:'car',name:'Firmenwagen',amount:60000,diamonds:16},{id:'legacy',name:'Legacy',amount:100000,diamonds:24},{id:'watch',name:'Rolex',amount:150000,diamonds:24}]
export const worldRules={threshold:1000,poolPercent:10,settlements:'Am 1. und 15. um 20:00 Uhr · Europe/Berlin',settlementCount:2}
export const careerRules={days:90,levels:10,windowDays:30,diamondsPerWindow:8}
export function exampleCommission(amount,level,membership){const value=Number(amount);if(!Number.isFinite(value)||value<0)return 0;return level<=memberships[membership]?Math.round(value*referralRates[level-1])/100:0}
export function partnerName(p){return [p.firstName,p.secondName?String(p.secondName).slice(0,1)+'.':''].filter(Boolean).join(' ')||'Partner'}
