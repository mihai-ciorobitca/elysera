import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ELYSERA_PRODUCTS } from '@/lib/elysera-products'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await prisma.product.findMany({
      where: {
        id: { in: ELYSERA_PRODUCTS.map((product) => product.id) },
        active: true,
        staffOnly: false,
      },
      select: {
        id: true,
        name: true,
        price: true,
        priceUsd: true,
        stock: true,
        marketRegions: true,
      },
    })
    const products = rows
      .filter((product) => product.price > 0)
      .map((product) => ({
        ...product,
        ...ELYSERA_PRODUCTS.find((item) => item.id === product.id),
      }))
    return NextResponse.json({ products }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[elysera/products]', error)
    return NextResponse.json(
      { error: 'Product availability could not be loaded. Please try again.' },
      { status: 503 },
    )
  }
}
