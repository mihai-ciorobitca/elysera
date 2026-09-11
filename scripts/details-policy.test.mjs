import assert from 'node:assert/strict'
import {validateDetails} from '../lib/auth/details-policy.mjs'
const valid={name:'Anna',last:'Test',street:'Teststraße',houseNumber:'1',postalCode:'10115',city:'Berlin',country:'Deutschland'}
assert.ok(validateDetails(valid));for(const key of Object.keys(valid))assert.equal(validateDetails({...valid,[key]:''}),null,key)
for(const birthDate of ['2020-02-30','2999-01-01','1899-12-31','invalid'])assert.equal(validateDetails({...valid,birthDate}),null)
assert.ok(validateDetails({...valid,birthDate:'2000-02-29',gender:'undisclosed',phone:'+49 1234567'}));assert.equal(validateDetails({...valid,gender:'unexpected'}),null);assert.equal(validateDetails({...valid,phone:'abc'}),null);assert.equal(validateDetails({...valid,street:'x'.repeat(161)}),null);console.log('Required fields, date validity, optional field values and length limits passed')
