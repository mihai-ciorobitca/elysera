import assert from 'node:assert/strict'
import test from 'node:test'
import { crmReturnPath, crmSignInPath } from './crm-login'
test('CRM login stays on Elysera and only accepts the two CRM destinations', () => {
  assert.equal(crmSignInPath('/admin/crm'), '/auth/admin?next=%2Fadmin%2Fcrm')
  assert.equal(crmSignInPath('/dashboard/crm'), '/auth/signin?next=%2Fdashboard%2Fcrm')
  for (const value of ['https://attacker.example', '//attacker.example', '/api/admin', '', null]) assert.equal(crmReturnPath(value), '/dashboard/crm')
})
