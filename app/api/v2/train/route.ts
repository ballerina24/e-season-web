import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    const { startStation, endStation, searchDate } = await req.json();

    if (!startStation || !endStation || !searchDate) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    try {
        // Construct the URL dynamically based on user input
        const url = `https://trainschedule.lk/schedule/${startStation.toLowerCase()}-to-${endStation.toLowerCase()}-train-timetable`;

        // Fetch the page HTML
        const { data } = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Array to hold train schedule data
        const schedules: Array<{
            departure: string;
            arrival: string;
            duration: string;
            trainEnd: string;
            trainNumber: string;
        }> = [];

        // Select and parse the rows of the table
        $('table > tbody > tr').each((_index, element) => {
            const departure = $(element).find('td:nth-child(1)').text().trim();
            const arrival = $(element).find('td:nth-child(2)').text().trim();
            const duration = $(element).find('td:nth-child(3)').text().trim();
            const trainEnd = $(element).find('td:nth-child(4)').text().trim();
            const trainNumber = $(element).find('td:nth-child(5) a').text().trim();

            if (departure && arrival && duration && trainEnd && trainNumber) {
                schedules.push({
                    departure,
                    arrival,
                    duration,
                    trainEnd,
                    trainNumber,
                });
            }
        });

        // Return the scraped data
        return NextResponse.json(schedules, { status: 200 });
    } catch (error) {
        console.error('Error fetching train schedules:', error);
        return NextResponse.json({ error: 'Failed to fetch train schedules' }, { status: 500 });
    }
}
