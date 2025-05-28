import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store'; // or your storage library
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
  orderItems: any;
  Uid: string;
  _id: string;
  // Add your order properties here
}

interface IImage {
  public_id: string;
  url: string;
  _id: string;
}

interface Service {
  boosted: number;
  _id: string;
  locationCity: string;
  name: string;
  description: string;
  location: string;
  contactInfo: string;
  email: string;
  images: IImage[];
  status: "active" | "inactive";
  createdAt: string;
  __v: number;
}

interface Job {
  id: string;
  title: string;
  rate: string;
  description: string;
}

interface JobApplication {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  jobType: string;
  briefWhy: string;
  yearsExperience: string;
  email: string;
  phone: string;
  images: IImage[];
}

interface LostItem {
  _id: string;
  itemName: string;
  description: string;
  location: string;
  status: "Lost" | "Found";
  contactInfo: string;
  images: IImage[];
  createdAt: string;
  updatedAt: string;
}

interface ProductContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  services: Service[];
  lostItems: LostItem[];
  jobs: Job[];
  jobApps: JobApplication[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  fetchProductsByCategory: (categoryId: string) => Product[];
  createProduct: (product: Omit<Product, "images"> & { images: string[] }, formData?: FormData) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  categories: [],
  orders: [],
  services: [],
  lostItems: [],
  jobs: [],
  jobApps: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refreshData: async () => {},
  fetchProductsByCategory: () => [],
  createProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
});

const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobApps, setJobApps] = useState<JobApplication[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Helper function to validate and normalize data
  const validateAndNormalizeData = <T,>(data: any, arrayKey?: string): T[] => {
    // If arrayKey is provided, check for nested array
    if (arrayKey && data && typeof data === 'object' && arrayKey in data) {
      return Array.isArray(data[arrayKey]) ? data[arrayKey] : [];
    }
    // Otherwise check if the data itself is an array
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await SecureStore.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        Alert.alert("Error", "Authentication token is missing.");
      }
    };

    fetchToken();
  }, []);




  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = [
        'https://onemarketapi.xyz/api/v1/product/get-all',
        'https://onemarketapi.xyz/api/v1/cat/get-all',
        'https://onemarketapi.xyz/api/v1/orders/all-orders',
        'https://onemarketapi.xyz/api/v1/service/services',
        'https://onemarketapi.xyz/api/v1/lost/lost-items',
        'https://onemarketapi.xyz/api/v1/job/all-jobs',
        'https://onemarketapi.xyz/api/v1/job/all'
      ];

      const responses = await Promise.all(endpoints.map(url => fetch(url)));

      // Check all responses
      const allOk = responses.every(res => res.ok);
      if (!allOk) {
        throw new Error('Failed to fetch data from one or more endpoints');
      }

      // Parse all responses
      const [
        productsData,
        categoriesData,
        ordersData,
        servicesData,
        lostItemsData,
        jobsData,
        jobAppsData
      ] = await Promise.all(responses.map(res => res.json()));

      // Validate and normalize data
      const validatedProducts = validateAndNormalizeData<Product>(productsData, 'products');
      const validatedCategories = validateAndNormalizeData<Category>(categoriesData, 'categories');
      const validatedOrders = validateAndNormalizeData<Order>(ordersData);
      const validatedServices = validateAndNormalizeData<Service>(servicesData, 'services');
      const validatedLostItems = validateAndNormalizeData<LostItem>(lostItemsData, 'items');
      const validatedJobs = validateAndNormalizeData<Job>(jobsData, 'jobCreations');
      const validatedJobApps = validateAndNormalizeData<JobApplication>(jobAppsData, 'jobApplications');

      // Update state
      setProducts(validatedProducts);
      setCategories(validatedCategories);
      setOrders(validatedOrders);
      setServices(validatedServices);
      setLostItems(validatedLostItems);
      setJobs(validatedJobs);
      setJobApps(validatedJobApps);
      setLastUpdated(new Date());

      // Update cache
      await AsyncStorage.multiSet([
        ['products', JSON.stringify(validatedProducts)],
        ['categories', JSON.stringify(validatedCategories)],
        ['orders', JSON.stringify(validatedOrders)],
        ['services', JSON.stringify(validatedServices)],
        ['lostItems', JSON.stringify(validatedLostItems)],
        ['jobs', JSON.stringify(validatedJobs)],
        ['jobApps', JSON.stringify(validatedJobApps)],
        ['lastUpdated', new Date().toISOString()]
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
      const keys = ['products', 'categories', 'orders', 'services', 'lostItems', 'jobs', 'jobApps', 'lastUpdated'];
      const values = await AsyncStorage.multiGet(keys);
      
      const [
        cachedProducts,
        cachedCategories,
        cachedOrders,
        cachedServices,
        cachedLostItems,
        cachedJobs,
        cachedJobApps,
        cachedLastUpdated
      ] = values.map(([_, value]) => value);

      if (cachedProducts) {
        const parsedProducts = JSON.parse(cachedProducts);
        setProducts(validateAndNormalizeData<Product>(parsedProducts));
      }

      if (cachedCategories) {
        const parsedCategories = JSON.parse(cachedCategories);
        setCategories(validateAndNormalizeData<Category>(parsedCategories));
      }

      if (cachedOrders) {
        const parsedOrders = JSON.parse(cachedOrders);
        setOrders(validateAndNormalizeData<Order>(parsedOrders));
      }

      if (cachedServices) {
        const parsedServices = JSON.parse(cachedServices);
        setServices(validateAndNormalizeData<Service>(parsedServices));
      }

      if (cachedLostItems) {
        const parsedLostItems = JSON.parse(cachedLostItems);
        setLostItems(validateAndNormalizeData<LostItem>(parsedLostItems));
      }

      if (cachedJobs) {
        const parsedJobs = JSON.parse(cachedJobs);
        setJobs(validateAndNormalizeData<Job>(parsedJobs));
      }

      if (cachedJobApps) {
        const parsedJobApps = JSON.parse(cachedJobApps);
        setJobApps(validateAndNormalizeData<JobApplication>(parsedJobApps));
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

const createProduct = useCallback(
  async (
    product: Omit<Product, "images"> & { images: string[] },
    formData?: FormData
  ) => {
    if (!token) {
      throw new Error("Authentication token is missing.");
    }

    // Move tempId to the outer scope so it's accessible in both try and catch
    const tempId = `temp-${Date.now()}`;

    try {
      // Create a temporary product object for the optimistic update
      const tempProduct: Product = {
        ...product,
        _id: tempId,
        images: product.images.map((uri) => ({
          url: uri,
          public_id: "",
          _id: "",
        })),
        boosted: 0,
        stock: product.stock || 0,
        sellerId: product.sellerId || "",
        category: product.category || { _id: "", category: "" }
      };

      // Optimistically update the local state
      setProducts(prev => [...prev, tempProduct]);

      // Update the cache
      const cachedProducts = await AsyncStorage.getItem('products');
      let updatedProducts: Product[] = [];
      if (cachedProducts) {
        try {
          const parsed = JSON.parse(cachedProducts);
          updatedProducts = Array.isArray(parsed) ? [...parsed, tempProduct] : [tempProduct];
        } catch (e) {
          updatedProducts = [tempProduct];
        }
      } else {
        updatedProducts = [tempProduct];
      }
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));

      // Prepare the request
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      let body: FormData | string;
      
      if (formData) {
        body = formData;
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(product);
      }

      // Send the actual request to the server
      const response = await fetch(
        "https://onemarketapi.xyz/api/v1/product/create",
        {
          method: "POST",
          headers,
          body,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      const responseData = await response.json();
      const createdProduct = responseData.product; // <-- get the product object
      
      // Verify the created product has an _id before proceeding
      if (!createdProduct?._id) {
        
        throw new Error("Server response is missing product ID");
      }
      
      // Replace the temporary product with the actual one from the server
      setProducts(prev => prev.map(p => p._id === tempId ? createdProduct : p));
      
      // Update the cache with the actual product
      const updatedCachedProducts = updatedProducts.map(p => 
        p?._id === tempId ? createdProduct : p
      ).filter(Boolean); // Remove any null/undefined entries
      
      await AsyncStorage.setItem('products', JSON.stringify(updatedCachedProducts));

      Alert.alert("Success", "Product created successfully!");
      
      return createdProduct;
    } catch (error) {
      // If there's an error, revert the optimistic update
      setProducts(prev => prev.filter(p => p?._id !== tempId));
      
      try {
        const cachedProducts = await AsyncStorage.getItem('products');
        if (cachedProducts) {
          const parsed = JSON.parse(cachedProducts);
          if (Array.isArray(parsed)) {
            const updatedProducts = parsed.filter((p: Product) => p?._id !== tempId);
            await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
          }
        }
      } catch (e) {
        console.error("Error reverting cache:", e);
      }
      
      console.error("Create product error:", error);
      Alert.alert("Error", "Failed to create product");
      throw error;
    }
  },
  [token]
);


  const updateProduct = useCallback(async (product: Product) => {
    // Optimistically update local state and cache
    setProducts(prev => prev.map(p => (p._id === product._id ? product : p)));
    const cachedProducts = await AsyncStorage.getItem('products');
    let updatedProducts = [];
    if (cachedProducts) {
      const parsed = JSON.parse(cachedProducts);
      updatedProducts = parsed.map((p: Product) => (p._id === product._id ? product : p));
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    }

    // Send to backend in background
    fetch(`https://onemarketapi.xyz/api/v1/product/${product._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to update product');
        await refreshData();
      })
      .catch(async err => {
        await refreshData();
        setError(err.message);
      });
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    // Optimistically remove from local state and cache
    setProducts(prev => prev.filter(p => p._id !== productId));
    const cachedProducts = await AsyncStorage.getItem('products');
    if (cachedProducts) {
      const parsed = JSON.parse(cachedProducts);
      const updatedProducts = parsed.filter((p: Product) => p._id !== productId);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    }

    // Send delete request to server in background
    fetch(`https://onemarketapi.xyz/api/v1/product/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to delete product');
        await refreshData();
      })
      .catch(async err => {
        await refreshData();
        setError(err.message);
      });
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const handleConnectivityChange = async (state: import('@react-native-community/netinfo').NetInfoState) => {
      if (state.isConnected === true && isMounted) {
        await fetchData();
        if (!intervalId) {
          intervalId = setInterval(fetchData, 5 * 60 * 1000); // 5 minutes
        }
      } else {
        // If disconnected, clear polling interval
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Initial load from cache
    loadCachedData();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    // Also check current connection on mount
    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      unsubscribe();
    };
  }, [fetchData, loadCachedData]);

  return (
    <ProductContext.Provider 
      value={{ 
        products, 
        categories, 
        orders, 
        services,
        lostItems,
        jobs,
        jobApps,
        loading, 
        error,
        lastUpdated,
        refreshData,
        fetchProductsByCategory,
        createProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useProduct = () => useContext(ProductContext);

export { ProductContext, ProductProvider, useProduct };

