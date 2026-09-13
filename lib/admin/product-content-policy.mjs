import {createHash} from 'node:crypto'
import {productContentIds,productContentDefault,pickProductContent,validateProductContent} from '../product-content.mjs'
export class ProductContentError extends Error {constructor(message,status=400,code='INVALID_INPUT'){super(message);this.status=status;this.code=code}}
export function productContentScope(id){if(!productContentIds.includes(id))throw new ProductContentError('ELYSERA-Produkt nicht gefunden.',404,'OUT_OF_SCOPE')}
export function productContentSnapshot(content){return createHash('sha256').update(JSON.stringify(pickProductContent(content))).digest('hex')}
export function productContentState(id,row,erpName=null){const base=productContentDefault(id),content=row?validateProductContent(row.content):pickProductContent(base);return {id,slug:base.slug,step:base.step,image:base.image,erpName,version:row?.version??0,snapshot:productContentSnapshot(content),content,source:row?'custom':'default'}}
export function productContentInput(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['actorId','productId','requestId','expectedVersion','expectedSnapshot','content','reason'].includes(k)))throw new ProductContentError('Ungültige Eingabe.')
 for(const k of ['actorId','productId','requestId'])if(typeof raw[k]!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(raw[k]))throw new ProductContentError('Ungültige Anfragekennung.')
 productContentScope(raw.productId)
 if(raw.requestId.length<16||!Number.isSafeInteger(raw.expectedVersion)||raw.expectedVersion<0||typeof raw.expectedSnapshot!=='string'||!/^[a-f0-9]{64}$/.test(raw.expectedSnapshot))throw new ProductContentError('Produktversion erforderlich.')
 if(typeof raw.reason!=='string'||!raw.reason.trim()||raw.reason.length>500)throw new ProductContentError('Begründung mit maximal 500 Zeichen erforderlich.')
 let content;try{content=validateProductContent(raw.content)}catch{throw new ProductContentError('Bitte alle Textfelder und 1–40 Wirkstoffschwerpunkte innerhalb der angegebenen Grenzen ausfüllen.')}
 return {actorId:raw.actorId,productId:raw.productId,requestId:raw.requestId,expectedVersion:raw.expectedVersion,expectedSnapshot:raw.expectedSnapshot,content,reason:raw.reason.trim()}
}
