import {siteUrl,indexable} from '../lib/seo.mjs'
export default function robots(){return {rules:{userAgent:'*',...(indexable?{allow:'/',disallow:['/api/']}:{disallow:'/'})},sitemap:siteUrl+'/sitemap.xml',host:siteUrl}}
