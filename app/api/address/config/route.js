import {NextResponse} from 'next/server'
export const dynamic = 'force-dynamic'
export function GET() {
 // Intentionally public browser key. Restrict by HTTP referrer in the Geoapify project.
 const key = process.env.GEOAPIFY_BROWSER_KEY;
 return NextResponse.json(key ? {key} : {error:'unavailable'}, {
  status:key ? 200 : 503, headers:{'Cache-Control':'no-store'},
 });
}
