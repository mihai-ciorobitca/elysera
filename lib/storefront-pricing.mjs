export const prices = {'renewal-serum':69,'balance-toner':29,'contour-eye-cream':59,'peptide-ritual-set':139}
export const selectionTotal = cart => Object.entries(cart).reduce((sum,[slug,quantity])=>sum+(prices[slug]||0)*quantity,0)
