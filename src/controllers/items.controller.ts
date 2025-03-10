import { Request, Response } from "express";
import { fetchItems } from "../services/skinport.service";
import { getCache, setCache } from "../services/redis.service";

export const getItems = async (req: Request, res: Response) => {
  const cacheKey = "skinport:items";
  
  try {
    // Check cache first
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      console.log('Serving from Redis cache');
      return res.json(JSON.parse(cachedData));
    }

    // Fetch fresh data if no cache
    console.log('Fetching fresh data from API');
    
    const items = await fetchItems();
    
    // Cache the new data with 5 minute TTL
    await setCache(cacheKey, JSON.stringify(items), 300);
    res.set("X-Cache-Status", cachedData ? "HIT" : "MISS");
    console.log('Data cached in Redis');

    res.json(items);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};