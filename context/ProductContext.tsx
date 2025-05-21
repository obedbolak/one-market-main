import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: Array<{
    public_id: string;
    url: string;
  }>;
  category: {
    _id: string;
    category: string;
  };
  sellerId: string;
  boosted: number;
}

interface Category {
  _id: string;
  category: string;
}

interface Order {
  Uid: string;
  _id: string;
  // Add your order properties here
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  fetchProductsByCategory: (categoryId: string) => Product[];
  deleteProduct: (productId: string) => Promise<void>;

}

const ProductContext = createContext<ProductContextType>({
  products: [],
  categories: [],
  orders: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refreshData: async () => {},
  fetchProductsByCategory: () => [],
  deleteProduct: async () => {},
});

const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('https://onemarketapi.xyz/api/v1/product/get-all'),
        fetch('https://onemarketapi.xyz/api/v1/cat/get-all'),
        fetch('https://onemarketapi.xyz/api/v1/orders/all-orders')
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      const [productsData, categoriesData, ordersData] = await Promise.all([
        productsRes.json(),
        
        categoriesRes.json(),
        ordersRes.json()
      ]);
      // Validate and transform data
    //   const validatedProducts = Array.isArray(productsData) ? productsData : [];
    const validatedProducts = Array.isArray(productsData?.products)
  ? productsData.products
  : [];
      const validatedCategories = Array.isArray(categoriesData.categories) ? categoriesData.categories: [];
      const validatedOrders = Array.isArray(ordersData) ? ordersData : [];
      // Update state
      setProducts(validatedProducts);
      setCategories(validatedCategories);
      setOrders(validatedOrders);
      setLastUpdated(new Date());

      // Update cache
      await Promise.all([
        AsyncStorage.setItem('products', JSON.stringify(validatedProducts)),
        AsyncStorage.setItem('categories', JSON.stringify(validatedCategories)),
        AsyncStorage.setItem('orders', JSON.stringify(validatedOrders)),
        AsyncStorage.setItem('lastUpdated', new Date().toISOString())
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCachedData = useCallback(async () => {
    try {
      const [
        cachedProducts,
        cachedCategories,
        cachedOrders,
        cachedLastUpdated
      ] = await Promise.all([
        AsyncStorage.getItem('products'),
        AsyncStorage.getItem('categories'),
        AsyncStorage.getItem('orders'),
        AsyncStorage.getItem('lastUpdated')
      ]);

      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        if (Array.isArray(parsedProducts)) {
          setProducts(parsedProducts);
        }
      }

      if (cachedCategories) {
        const parsedCategories = JSON.parse(cachedCategories);
        if (Array.isArray(parsedCategories)) {
          setCategories(parsedCategories);
        }
      }

      if (cachedOrders) {
        const parsedOrders = JSON.parse(cachedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      }

      if (cachedLastUpdated) {
        setLastUpdated(new Date(cachedLastUpdated));
      }
    } catch (err) {
      console.error('Cache load error:', err);
    }
  }, []);

  const fetchProductsByCategory = useCallback((categoryId: string): Product[] => {
    return products.filter(product => product.category._id === categoryId);
  }, [products]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const init = async () => {
      // Load cached data first for quick display
      await loadCachedData();
      
      // Check network status
      const { isConnected } = await NetInfo.fetch();
      
      if (isConnected && isMounted) {
        // Fetch fresh data
        await fetchData();
        
        // Set up polling for live updates (every 5 minutes)
        intervalId = setInterval(fetchData, 5 * 60 * 1000);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, loadCachedData]);

  const refreshData = async () => {
    await fetchData();
  };

    const deleteProduct = useCallback(async (productId: string) => {
    try {
      // Optimistically remove from local state
      setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
      
      // Remove from AsyncStorage cache
      const cachedProducts = await AsyncStorage.getItem('products');
      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        const updatedProducts = parsedProducts.filter((p: Product) => p._id !== productId);
        await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      }

      // Send delete request to server
      const response = await fetch(`https://onemarketapi.xyz/api/v1/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product on server');
      }

      // Optionally refresh data to ensure consistency
      await refreshData();
    } catch (err) {
      // Revert optimistic update if deletion failed
      await refreshData();
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      throw err; // Re-throw to allow component to handle the error
    }
  }, [refreshData]);

  return (
    <ProductContext.Provider 
      value={{ 
        deleteProduct,
        products, 
        categories, 
        orders, 
        loading, 
        error,
        lastUpdated,
        refreshData,
        fetchProductsByCategory
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useProduct = () => useContext(ProductContext);

export { ProductContext, ProductProvider, useProduct };

