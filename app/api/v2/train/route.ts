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
    console.log(`Scraping train times for ${start} to ${destination} on ${date}`);

    // Launch Puppeteer with additional options for server environments
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://www.dumriya.com/");

    // Fill in the form fields
    await page.type('input[placeholder="Starting Location"]', start);
    await page.type('input[placeholder="Search destinations"]', destination);
    // Handle additional form interactions for the date if needed
    // Example: await page.type('input[placeholder="Date"]', date);
    await page.click('button:contains("Search")');

    // Wait for results
    await page.waitForSelector(".results-class", { timeout: 10000 });

    // Extract train times
    const trainTimes = await page.evaluate(() => {
      const results: { time: string | null; destination: string | null }[] = [];
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

    // Respond with the data
    return NextResponse.json({ trainTimes }, { status: 200 });
  } catch (error) {
    console.error("Error fetching train times:", error);
    return NextResponse.json(
      { error: "Failed to fetch train times", details: (error as Error).message },
      { status: 500 }
    );
  }
}
