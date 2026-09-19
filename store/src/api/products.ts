import type { Product } from '../types/product';

const BASE_URL = 'https://dummyjson.com/products';

export const getProducts = async (limit: number = 30, skip: number = 0): Promise<Product[]> => {
  const response = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
  if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
  const text = await response.text();
  if (!text) return []; 
  const data = JSON.parse(text);
  return data.products || [];
};

export const searchProducts = async (query: string, limit: number = 30, skip: number = 0): Promise<Product[]> => {
  const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`);
  if (!response.ok) throw new Error(`Ошибка поиска: ${response.status}`);
  const text = await response.text();
  if (!text) return []; 
  const data = JSON.parse(text);
  return data.products || [];
};