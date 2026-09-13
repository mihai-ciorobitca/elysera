import 'server-only'
import {connection} from 'next/server'
import {prisma} from './prisma'
import {loadPublicProductContent} from './product-content.mjs'
import {products} from '../app/catalog'

export async function getPublishedProductCatalog(){
 await connection()
 try{return await loadPublicProductContent(prisma)}catch{return products}
}
