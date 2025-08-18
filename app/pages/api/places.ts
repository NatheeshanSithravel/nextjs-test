export default async function handler(req:any, res:any) {
    const { query } = req.query; // Get query from request
    const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
    if (!API_KEY) {
      return res.status(500).json({ error: "API key is missing" });
    }
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${'AIzaSyAKG6VTLfpdRId7P25GJE1B3wyn418U4hs'}`
      );
      const data = await response.json();
  
      // Set CORS headers to allow frontend to call this API
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch data" });
    }
  }