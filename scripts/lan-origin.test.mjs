import test from 'node:test'
import assert from 'node:assert/strict'
import {sameOrigin} from '../lib/auth/policy.mjs'

test('LAN development accepts only the configured host and preserves production origin checks',()=>{
 const before={mode:process.env.NODE_ENV,hosts:process.env.ELYSERA_DEV_HOSTS}
 const request=(origin,host='192.168.101.37:3001',site=null)=>({url:'http://localhost:3001/api/auth/signin',headers:new Headers({origin,host,...(site?{'sec-fetch-site':site}:{})})})
 try{
  process.env.NODE_ENV='development';process.env.ELYSERA_DEV_HOSTS='192.168.101.37'
  assert.equal(sameOrigin(request('http://192.168.101.37:3001')),true)
  assert.equal(sameOrigin(request('http://192.168.101.37:3001','localhost:3001')),false)
  assert.equal(sameOrigin(request('http://192.168.101.38:3001','192.168.101.38:3001')),false)
  assert.equal(sameOrigin(request('http://192.168.101.37:3002','192.168.101.37:3002')),false)
  assert.equal(sameOrigin(request('https://192.168.101.37:3001')),false)
  assert.equal(sameOrigin(request('http://192.168.101.37:3001','192.168.101.37:3001','cross-site')),false)
  assert.equal(sameOrigin(request('null')),false)
  process.env.NODE_ENV='production'
  assert.equal(sameOrigin(request('http://192.168.101.37:3001')),false)
  assert.equal(sameOrigin(request('http://localhost:3001')),true)
 }finally{
  if(before.mode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=before.mode
  if(before.hosts===undefined)delete process.env.ELYSERA_DEV_HOSTS;else process.env.ELYSERA_DEV_HOSTS=before.hosts
 }
})
