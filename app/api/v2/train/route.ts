
import puppeteer from "puppeteer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    if (!start || !destination || !date) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the website
        await page.goto("https://www.dumriya.com/");

        // Fill in the form fields
        await page.type('input[placeholder="Starting Location"]', start);
        await page.type('input[placeholder="Search destinations"]', destination);
        // Handle date input or dropdown appropriately
        // e.g., if it's a date picker, you might need to click the field and select a date
        await page.click('button:contains("Search")');

        // Wait for results
        await page.waitForSelector(".results-class"); // Replace with actual class from the website

        // Extract train times
        const trainTimes = await page.evaluate(() => {
            const results: { time: string | null, destination: string | null }[] = [];
            document.querySelectorAll(".train-time-row").forEach((row) => {
                results.push({
                    time: row.querySelector(".time-class")?.textContent ?? null,
                    destination: row.querySelector(".destination-class")?.textContent ?? null,
                });
            });
            return results;
        });

        // Close Puppeteer
        await browser.close();

        // Respond with data
        return NextResponse.json({ trainTimes }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch train times", details: (error as Error).message }, { status: 500 });
    }
}
