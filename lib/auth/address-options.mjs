import {countryCode} from './countries.mjs'

const postalKey=value=>String(value||'').replace(/\s/g,'').toLowerCase();

export function matchesAddress(item,value,query,postal){
 const expected=countryCode(value.country);
 if(expected&&item.country_code?.toLowerCase()!==expected)return false;
 return postal?!!item.postcode&&postalKey(item.postcode).startsWith(postalKey(query)):
  !!item.street&&(!item.postcode||postalKey(item.postcode)===postalKey(value.postalCode));
}

export function applyAddress(value,address,postal){
 // Explicit country selection is authoritative; missing provider data must not
 // erase manually entered address fields.
 return postal?{...value,postalCode:address.postalCode,city:address.city||value.city}:
  {...value,street:address.street,houseNumber:address.houseNumber||value.houseNumber,city:address.city||value.city};
}
