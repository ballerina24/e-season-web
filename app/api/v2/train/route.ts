import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const fetchTrainTimes = async (startLocation: string, destination: string, date: string) => {
    const response = await axios.get("https://api.dumriya.com/train-times", {
        params: { start: startLocation, destination, date },
    });
    return response.data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { start, destination, date } = req.query;

    if (typeof start !== 'string' || typeof destination !== 'string' || typeof date !== 'string') {
        res.status(400).json({ error: "Invalid query parameters" });
        return;
    }

    try {
        const data = await fetchTrainTimes(start, destination, date);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch train times" });
    }
}
