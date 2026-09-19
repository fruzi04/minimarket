import { useState, useEffect } from 'react';
import type { Product } from './types/product';
import { getProducts, searchProducts } from './api/products';
import { ProductList } from './components/ProductList';
import { CartModal } from './components/CartModal';
import './App.css';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Поиск
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Пагинация 
  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const LIMIT = 30;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch((prev) => {
        
        if (prev !== searchQuery) {
          setProducts([]);   
          setSkip(0);        
          setHasMore(true);
          return searchQuery;
        }
        return prev;
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка товаров
  useEffect(() => {
    const fetchItems = async () => {
      if (!hasMore && skip !== 0) return;
      setLoading(true);
      try {
        const trimmed = debouncedSearch.trim();
        let newItems = [];

        if (trimmed) {
          newItems = await searchProducts(trimmed, LIMIT, skip);
        } else {
          newItems = await getProducts(LIMIT, skip);
        }

        if (newItems.length < LIMIT) {
          setHasMore(false);
        }

        setProducts((prev) => (skip === 0 ? newItems : [...prev, ...newItems]));
      } catch (err) {
        console.error('Ошибка при загрузке:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [debouncedSearch, skip]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 150
      ) {
        if (!loading && hasMore) {
          setSkip((prev) => prev + LIMIT);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const handleAddToCart = (product: Product) => {
    setCart((prev = []) => [...prev, product]);
  };

  const handleRemoveFromCart = (id: number) => {
    setCart((prev = []) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🛒 Мини-Маркет</h1>

        <input
          type="text"
          className="search-input"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          Корзина ({cart?.length || 0})
        </button>
      </header>

      <main>
        <ProductList products={products} onAddToCart={handleAddToCart} />
        
        {/* Индикатор загрузки внизу списка */}
        {loading && <div className="loader">Загрузка...</div>}
        
        {!loading && products?.length === 0 && (
          <div className="no-results">
            {debouncedSearch.trim()
              ? `Ничего не найдено по запросу "${debouncedSearch}"`
              : 'Товары не найдены'}
          </div>
        )}
      </main>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart || []}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
}

export default App;