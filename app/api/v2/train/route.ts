import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    const { startStation, endStation, searchDate } = await req.json();

    if (!startStation || !endStation || !searchDate) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        const response = await axios.post('https://trainschedule.lk/backend-endpoint', {
            drStartStation: startStation,
            drEndStation: endStation,
            SearchDate: searchDate,
        });

        const $ = cheerio.load(response.data);

        const schedules: { trainName: string; startTime: string; endTime: string; duration: string }[] = [];
        $('table#schedule-table > tbody > tr').each((_index, element) => {
            const trainName = $(element).find('td.train-name').text().trim();
            const startTime = $(element).find('td.start-time').text().trim();
            const endTime = $(element).find('td.end-time').text().trim();
            const duration = $(element).find('td.duration').text().trim();

            schedules.push({ trainName, startTime, endTime, duration });
        });

        return NextResponse.json(schedules, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch train schedules' }, { status: 500 });
    }
}
