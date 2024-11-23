import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get('destination');
    const trainType = searchParams.get('trainType');
    const date = searchParams.get('date');

    try {
        const response = await fetch(`https://www.dumriya.com/api/trains`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                destination,
                trainType,
                date,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching train data: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export const config = {
    runtime: 'experimental-edge',
};
