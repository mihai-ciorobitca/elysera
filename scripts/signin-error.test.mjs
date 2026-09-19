import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readFileSync} from 'node:fs'
import {signInError} from '../lib/auth/signin-error.mjs'

for (const route of ['auth', 'admin-auth']) {
  test(`${route}: distinguish password, confirmation, throttle and service errors without granting access`, async () => {
    for (const [error, status, message] of [
      [{code: 'invalid_credentials', status: 400}, 401, /E-Mail-Adresse oder Passwort/],
      [{code: 'email_not_confirmed', status: 400}, 401, /bestätige zuerst/],
      [{code: 'over_request_rate_limit', status: 429}, 429, /Zu viele/],
      [{status: 429}, 429, /Zu viele/],
      [{code: 'unexpected_failure', status: 500, message: 'private database detail'}, 503, /vorübergehend/],
      [{name: 'AuthRetryableFetchError', status: 0}, 503, /vorübergehend/],
      [{status: 401, message: 'Invalid API key'}, 503, /vorübergehend/],
      [{code: 'email_provider_disabled', status: 422}, 503, /vorübergehend/],
    ]) {
      let checks = 0
      const scope = vm.createContext({
        NextResponse: {json: (body, options) => ({body, status: options.status})},
        signInError,
        prepareLegacyPassword: async () => null,
    authClient: async () => ({auth: {signInWithPassword: async () => ({error})}}),
        loginPrincipalFor: async () => {checks++; return {role: 'ADMIN'}},
        adminPrincipalFor: async () => {checks++; return {role: 'ADMIN'}},
        sameOrigin: () => true, validCredentials: () => true, loginRateLimit: async () => true,
      })
      const source = readFileSync(`app/api/${route}/signin/route.js`, 'utf8')
        .replace(/^import .*$/mg, '').replaceAll('export ', '')
      vm.runInContext(source + ';this.handler=POST', scope)
      const result = await scope.handler({headers: {get: () => null}, text: async () => JSON.stringify({email: 'test@example.invalid', password: 'test'})})
      assert.equal(result.status, status)
      assert.match(result.body.error, message)
      assert.equal(result.body.ok, undefined)
      assert.equal(result.body.redirect, undefined)
      assert.equal(checks, 0)
      assert.doesNotMatch(JSON.stringify(result.body), /private database detail|Invalid API key/)
    }
  })
}
