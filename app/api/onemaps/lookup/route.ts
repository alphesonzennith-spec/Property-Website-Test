// ONEMAPS: Replace with live API call when key is configured.
// This route proxies to https://www.onemap.gov.sg/api/common/elastic/search
// For now, it returns a deterministic mock for postal code 521123.
import { NextRequest, NextResponse } from 'next/server';

export interface OneMapResult {
    buildingName: string;
    address: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    block: string;
    road: string;
}

// ── Mock data: keyed by postal code ──────────────────────────────────────────
const MOCK_LOOKUP: Record<string, OneMapResult> = {
    '521123': {
        buildingName: 'TAMPINES STREET 11',
        address: 'BLK 123 TAMPINES STREET 11, SINGAPORE 521123',
        postalCode: '521123',
        latitude: 1.3537,
        longitude: 103.9437,
        block: '123',
        road: 'TAMPINES STREET 11',
    },
    '640055': {
        buildingName: 'JURONG WEST STREET 61',
        address: 'BLK 55 JURONG WEST STREET 61, SINGAPORE 640055',
        postalCode: '640055',
        latitude: 1.3404,
        longitude: 103.709,
        block: '55',
        road: 'JURONG WEST STREET 61',
    },
    '460012': {
        buildingName: 'BEDOK NORTH AVENUE 2',
        address: 'BLK 12 BEDOK NORTH AVENUE 2, SINGAPORE 460012',
        postalCode: '460012',
        latitude: 1.3247,
        longitude: 103.93,
        block: '12',
        road: 'BEDOK NORTH AVENUE 2',
    },
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const postalCode = (searchParams.get('postal') ?? '').replace(/\s/g, '');

    if (!postalCode || postalCode.length !== 6 || !/^\d+$/.test(postalCode)) {
        return NextResponse.json(
            { error: 'Invalid postal code. Must be a 6-digit number.' },
            { status: 400 }
        );
    }

    // ONEMAPS: Swap this block with a real fetch when API key is configured.
    // const token = process.env.ONEMAP_API_KEY;
    // const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    // const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    // const data = await res.json();
    // if (!data.results?.length) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
    // const hit = data.results[0];
    // return NextResponse.json({ ... });

    const mock = MOCK_LOOKUP[postalCode];
    if (!mock) {
        // Graceful fallback: generate a plausible placeholder for any unknown postal code.
        return NextResponse.json({
            buildingName: `BLK (POSTAL ${postalCode})`,
            address: `SINGAPORE ${postalCode}`,
            postalCode,
            latitude: 1.3521,
            longitude: 103.8198,
            block: '',
            road: '',
        } satisfies OneMapResult);
    }

    return NextResponse.json(mock satisfies OneMapResult);
}
