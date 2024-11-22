import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { startStationID, endStationID, startTime, endTime, searchDate } = await req.json();

    if (!startStationID || !endStationID || !searchDate) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const response = await axios.post(
            'https://eservices.railway.gov.lk/schedule/searchTrain.action',
            new URLSearchParams({
                'searchCriteria.startStationID': startStationID,
                'searchCriteria.endStationID': endStationID,
                'searchCriteria.startTime': startTime || '',
                'searchCriteria.endTime': endTime || '',
                'searchCriteria.searchDate': searchDate,
                lang: 'en',
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return NextResponse.json({ data: response.data });
    } catch (error) {
        const errorMessage = (error as Error).message;
        return NextResponse.json({ error: 'Failed to fetch train schedules', details: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
