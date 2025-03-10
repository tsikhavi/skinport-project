import axios from "axios";

interface SkinportItemResponse {
  market_hash_name: string;
  min_price: string;
  min_price_tradable: string;
}

interface ProcessedItem {
  market_hash_name: string;
  min_price_tradable: number | null;
  min_price_non_tradable: number | null;
}

export const fetchItems = async (): Promise<ProcessedItem[]> => {
  const response = await axios.get<SkinportItemResponse[]>(
    "https://api.skinport.com/v1/items",
    {
      params: {
        app_id: 730,
        currency: "EUR",
      },
    }
  );

  return response.data.map((item) => ({
    market_hash_name: item.market_hash_name,
    min_price_tradable: parseFloat(item.min_price_tradable) || null,
    min_price_non_tradable: parseFloat(item.min_price) || null,
  }));
};
