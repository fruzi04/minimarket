import React from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const imageUrl = product.thumbnail || product.image;

  return (
    <div className="product-card">
      <img src={imageUrl} alt={product.title} />
      <h3>{product.title}</h3>
      <p className="price">{product.price} $</p>
      <button onClick={() => onAddToCart(product)}>В корзину</button>
    </div>
  );
};