import sharp from 'sharp'
import {createHash} from 'node:crypto'
import {evidenceMaxBytes,EvidenceError} from './review-evidence-policy.mjs'
export async function normalizeEvidence(bytes,type){const input=Buffer.from(bytes);if(!input.length||input.length>evidenceMaxBytes)throw new EvidenceError('Bild muss zwischen 1 Byte und 3 MiB groß sein.',413)
 const detected=input[0]===0xff&&input[1]===0xd8&&input[2]===0xff?'image/jpeg':input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':input.subarray(0,4).toString()==='RIFF'&&input.subarray(8,12).toString()==='WEBP'?'image/webp':null
 if(!detected||type!==detected)throw new EvidenceError('Nur echte JPEG-, PNG- oder WebP-Bilder sind erlaubt.',415)
 let webp;try{webp=await sharp(input,{animated:false,failOn:'error',limitInputPixels:20_000_000}).rotate().resize(1600,1600,{fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer()}catch{throw new EvidenceError('Bild konnte nicht sicher gelesen werden.')}
 if(webp.length>evidenceMaxBytes)throw new EvidenceError('Bild ist nach der Verarbeitung zu groß.',413)
 return {bytes:webp,sha:createHash('sha256').update(webp).digest('hex'),fileHash:createHash('sha256').update(input).digest('hex')}
}
