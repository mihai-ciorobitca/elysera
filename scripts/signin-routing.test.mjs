import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'

for (const method of ['signin', 'mfa']) {
 test(`${method} routes verified admins and members while rejecting ineligible accounts`, async () => {
  for (const kind of ['admin', 'member', 'denied']) {
   let signedOut = false
   const client = {auth: {
    signInWithPassword: async () => ({}),
    getUser: async () => ({data: {user: {email: 'account@example.test'}}}),
    signOut: async () => { signedOut = true },
    mfa: {
     getAuthenticatorAssuranceLevel: async () => ({data: {currentLevel: 'aal1', nextLevel: 'aal1'}}),
     listFactors: async () => ({data: {totp: [{id: 'factor', status: 'verified'}]}}),
     challengeAndVerify: async () => ({})
    }
   }}
   const scope = vm.createContext({
    NextResponse: {json: (body, options) => ({body, status: options.status})},
    authClient: async () => client,
    loginPrincipalFor: async () => kind === 'denied' ? null : {id:kind,role:kind==='admin'?'ADMIN':'AFFILIATE'},
    sameOrigin: () => true, validCredentials: () => true, loginRateLimit: async () => true
   })
   const source = readFileSync(`app/api/auth/${method}/route.js`, 'utf8').replace(/^import .*$/mg, '').replaceAll('export ', '')
   vm.runInContext(source + ';this.handler=POST', scope)
   const body = {email: 'account@example.test', password: 'fixture-password', code: '123456'}
   const result = await scope.handler({headers: {get: () => null}, text: async () => JSON.stringify(body), json: async () => body})
   assert.equal(result.status, kind === 'denied' ? 403 : 200)
   assert.equal(result.body.redirect, kind === 'admin' ? '/admin' : kind === 'member' ? '/dashboard' : undefined)
   assert.equal(signedOut, kind === 'denied')
  }
 })
}
