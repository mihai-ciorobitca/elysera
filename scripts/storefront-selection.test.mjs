import test from 'node:test'
import assert from 'node:assert/strict'
import {selectionTotal} from '../lib/storefront-pricing.mjs'
test('individual products and explicitly selected bundles retain their own prices',()=>{
assert.equal(selectionTotal({'renewal-serum':1}),69)
assert.equal(selectionTotal({'balance-toner':2,'contour-eye-cream':1}),117)
assert.equal(selectionTotal({'peptide-ritual-set':2,'renewal-serum':1}),347)
assert.equal(selectionTotal({'renewal-serum':1,'balance-toner':1,'contour-eye-cream':1}),157)
assert.equal(selectionTotal({}),0)
})
