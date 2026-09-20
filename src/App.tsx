import { useState, useEffect } from 'react';
import type { Product } from './types/product';
import { getProducts, searchProducts, getCategories, getProductsByCategory } from './api/products';
import { ProductList } from './components/ProductList';
import { CartModal } from './components/CartModal/CartModal';
import './App.css';

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [skip, setSkip] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const LIMIT = 30;

  // Загружаем список категорий при запуске
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // 1. Debounce поиска с безопасным сбросом состояния
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

  // 2. Сброс списка и пагинации при смене категории
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setProducts([]);
    setSkip(0);
    setHasMore(true);
  };

  // 3. Загрузка товаров (Учитывает и поиск, и категорию)
  useEffect(() => {
    const fetchItems = async () => {
      if (!hasMore && skip !== 0) return;

      setLoading(true);
      try {
        const trimmed = debouncedSearch.trim();
        let newItems: Product[] = [];

        if (trimmed) {
          newItems = await searchProducts(trimmed, LIMIT, skip);
          // Если также выбрана категория — фильтруем поиск
          if (selectedCategory) {
            newItems = newItems.filter((item) => item.category === selectedCategory);
          }
        } else if (selectedCategory) {
          newItems = await getProductsByCategory(selectedCategory, LIMIT, skip);
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
  }, [debouncedSearch, selectedCategory, skip]);

  // 4. Бесконечный скролл
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

  // Корзина
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
        <h1 className="logo">🛒 <span className="logo-text">Маркет</span></h1>

        <div className="search-filter-group">
          {/* Поиск */}
          <input
            type="text"
            className="search-input"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Обертка категорий (на смартфонах станет иконкой) */}
          <div className={`category-wrapper ${selectedCategory ? 'active' : ''}`}>
            <div className="category-icon">🏷️</div>
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Кнопка корзины (на смартфонах скрывает текст и оставляет иконку с бейджем) */}
        <button 
          className="cart-btn" 
          onClick={() => setIsCartOpen(true)}
          aria-label="Корзина"
        >
          <span className="cart-icon">🛒</span>
          <span className="cart-text">Корзина</span>
          {(cart?.length || 0) > 0 && (
            <span className="cart-badge">{cart.length}</span>
          )}
        </button>
      </header>

      <main>
        <ProductList products={products} onAddToCart={handleAddToCart} />

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