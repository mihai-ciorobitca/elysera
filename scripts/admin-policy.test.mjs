import {test} from 'node:test'
import assert from 'node:assert/strict'
import {eligibleAdmin,orderStates} from '../lib/admin/policy.mjs'
const identity={id:'auth-id',email:'admin@example.com',email_confirmed_at:'2026-09-12'}
const admin={email:'ADMIN@example.com',supabaseUserId:'auth-id',emailVerified:true,blocked:false,role:'ADMIN'}
test('exact verified admin identity is required',()=>{assert.equal(eligibleAdmin(identity,admin),true);for(const patch of [{role:'USER'},{role:'STAFF'},{blocked:true},{emailVerified:false},{supabaseUserId:null},{supabaseUserId:'other'},{email:'other@example.com'}])assert.equal(eligibleAdmin(identity,{...admin,...patch}),false);assert.equal(eligibleAdmin({...identity,email_confirmed_at:null},admin),false);assert.equal(eligibleAdmin(null,admin),false)})
test('payment and shipping remain separate states',()=>{assert.deepEqual(orderStates('PAID'),['Bezahlt','Nicht versendet']);assert.deepEqual(orderStates('SHIPPED'),['Bezahlt','Versendet']);assert.deepEqual(orderStates('AWAITING_BANK_TRANSFER'),['Überweisung ausstehend','Nicht versendet'])})
test('ELYSERA-only admin grant preserves shared account role requirements',()=>{const affiliate={...admin,role:'AFFILIATE'};assert.equal(eligibleAdmin(identity,affiliate,true),true);assert.equal(eligibleAdmin(identity,affiliate,false),false);assert.equal(eligibleAdmin(identity,{...affiliate,blocked:true},true),false);assert.equal(eligibleAdmin(identity,{...affiliate,supabaseUserId:'other'},true),false)})
