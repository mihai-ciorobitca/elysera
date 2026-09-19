import test from 'node:test'
import assert from 'node:assert/strict'
import {countries,countryCode,matchesOption} from '../lib/auth/countries.mjs'
import {matchesAddress,applyAddress} from '../lib/auth/address-options.mjs'
import {formRequest} from '../lib/auth/form-request.mjs'

test('every supported country round-trips to its exact ISO code, without alias collisions',()=>{
 assert.equal(countries.length,249);
 assert.equal(new Set(countries.map(x=>x.value)).size,249);
 for(const country of countries){assert.equal(countryCode(country.value),country.code);assert.equal(countryCode(country.code.toUpperCase()),country.code)}
 assert.equal(countryCode('Vereinigtes Königreich'),'gb');
 assert.equal(countryCode('not a country'),undefined);
});
test('country search accepts accents, plain letters, German transliteration, English and codes',()=>{
 for(const [code,terms] of [['at',['Österreich','Osterreich','Oesterreich','Austria','AT']],['gb',['UK','Grossbritannien','United Kingdom']],['ch',['Schweiz','Switzerland','CH']],['tr',['Türkei','Turkei','Tuerkei']],['us',['USA','United States']]]){
  const country=countries.find(x=>x.code===code);
  for(const term of terms)assert.ok(matchesOption(country,term),`${code}: ${term}`);
 }
 assert.equal(countries.filter(x=>matchesOption(x,'zzzzzz')).length,0);
 for(const [term,code] of [['UK','gb'],['AT','at'],['CH','ch'],['US','us'],['DE','de']])assert.deepEqual(countries.filter(x=>matchesOption(x,term)).map(x=>x.code),[code]);
});
test('postcode and street suggestions cannot cross country boundaries',()=>{
 const value={country:'Österreich',postalCode:'1010'};
 for(const postal of [true,false]){
  assert.ok(matchesAddress({country_code:'at',postcode:'1010',street:'Testgasse'},value,'101',postal));
  assert.equal(matchesAddress({country_code:'de',postcode:'1010',street:'Testgasse'},value,'101',postal),false);
  assert.equal(matchesAddress({postcode:'1010',street:'Testgasse'},value,'101',postal),false);
 }
 assert.equal(matchesAddress({country_code:'at',postcode:'2020',street:'Testgasse'},value,'101',false),false);
 assert.ok(matchesAddress({country_code:'gb',postcode:'SW1A 1AA',street:'Test Street'},{country:'Vereinigtes Königreich',postalCode:'sw1a1aa'},'',false));
});
test('address suggestions preserve selected country and manually entered house number/city',()=>{
 const value={country:'Österreich',postalCode:'1010',city:'Wien',houseNumber:'12b',street:'Testgasse'};
 assert.deepEqual(applyAddress(value,{street:'Neue Gasse',country:'Deutschland',city:'',houseNumber:''},false),{...value,street:'Neue Gasse'});
 assert.deepEqual(applyAddress(value,{postalCode:'1020',country:'Deutschland',city:''},true),{...value,postalCode:'1020'});
});
test('forms preserve actionable server errors and tolerate non-JSON service outages',async()=>{
 await assert.rejects(formRequest('/test',{}, {fetcher:async()=>new Response('<html>offline</html>',{status:503})}),/Dienst.*nicht erreichbar/);
 await assert.rejects(formRequest('/test',{}, {fetcher:async()=>new Response('{}',{status:429})}),/Zu viele Versuche/);
 await assert.rejects(formRequest('/test',{}, {fetcher:async()=>new Response(JSON.stringify({error:'E-Mail noch nicht bestätigt.'}),{status:401})}),/E-Mail noch nicht bestätigt/);
 await assert.rejects(formRequest('/test',{}, {fetcher:async()=>{throw new TypeError('Failed to fetch')}}),/Internetverbindung/);
 await assert.rejects(formRequest('/test',{}, {fetcher:async()=>new Response('not-json')}),/Antwort konnte nicht verarbeitet/);
 assert.deepEqual(await formRequest('/test',{country:'Österreich'},{fetcher:async(_url,options)=>{assert.equal(JSON.parse(options.body).country,'Österreich');return new Response('{"message":"ok"}')}}),{message:'ok'});
});
test('a stalled form request times out and can be retried',async()=>{
 await assert.rejects(formRequest('/test',{}, {timeout:5,fetcher:async(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError'))))}),/dauert zu lange/);
 assert.deepEqual(await formRequest('/test',{}, {fetcher:async()=>new Response('{"message":"retry succeeded"}')}),{message:'retry succeeded'});
});
