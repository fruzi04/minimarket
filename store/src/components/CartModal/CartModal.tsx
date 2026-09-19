import React from 'react';
import type { Product } from '../../types/product';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onRemoveFromCart: (id: number) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveFromCart,
}) => {
  // 1. Объявляем все хуки в самом верху функции
  const [quantity, setQuantity] = React.useState<{ [key: number]: number }>({});

  // 2. Условие выхода (return) располагаем ПОСЛЕ вызова хуков
  if (!isOpen) return null;

  // Расчет итоговой суммы с учетом количества каждого товара
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemQuantity = quantity[item.id] || 1;
    return sum + item.price * itemQuantity;
  }, 0);

  function changeQuantity(id: number, delta: number) {
    setQuantity((prev) => {
      const current = prev[id] || 1;
      const newQuantity = current + delta;
      return { ...prev, [id]: Math.max(1, newQuantity) };
    });
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Корзина</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p>Корзина пуста</p>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="cart-item">
                <img src={item.thumbnail || item.image} alt={item.title} />
                <div className="cart-item-info">
                  <h4>{item.title}</h4>
                  <p>{item.price} $</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => changeQuantity(item.id, -1)} className="quantity-btn">-</button>
                  <span className="quantity">{quantity[item.id] || 1}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="quantity-btn">+</button>
                </div>
                <button 
                  className="remove-btn" 
                  onClick={() => onRemoveFromCart(item.id)}
                >
                  <img src="https://img.icons8.com/ios-glyphs/30/000000/trash--v1.png" alt="Удалить" />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <h3>Итого: {totalPrice.toFixed(2)} $</h3>
            <button className="checkout-btn"
              onClick={() => {
                alert("Это демонстрация. Реальная оплата не реализована.");
                onClose();
              }}
            >Оформить заказ</button>
          </div>
        )}
      </div>
    </div>
  );
};