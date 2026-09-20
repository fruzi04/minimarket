import type { Product } from '../types/product';

const BASE_URL = 'https://dummyjson.com/products';

export const getProducts = async (limit: number = 30, skip: number = 0): Promise<Product[]> => {
  const response = await fetch(`${BASE_URL}?limit=${limit}&skip=${skip}`);
  if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
  const text = await response.text();
  if (!text) return []; 
  const data = JSON.parse(text);
  console.log(data.products); 
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

export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${BASE_URL}/category-list`);
  if (!response.ok) throw new Error(`Ошибка загрузки категорий: ${response.status}`);
  const text = await response.text();
  if (!text) return [];
  return JSON.parse(text);
};

export const getProductsByCategory = async (category: string, limit: number = 30, skip: number = 0): Promise<Product[]> => {
  const response = await fetch(`${BASE_URL}/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`);
  if (!response.ok) throw new Error(`Ошибка загрузки категории: ${response.status}`);
  const text = await response.text();
  if (!text) return [];
  const data = JSON.parse(text);
  return data.products || [];
};