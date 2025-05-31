import { useProduct } from '@/context/ProductContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Types
interface ProductImage {
  public_id: string;
  url: string;
}

interface Category {
  _id: string;
  category: string;
}

interface CatalogProduct {
  id: string | string[];
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: ProductImage[];
  category: Category;
  sellerId: string;
  boosted: number;
}

const Catalog = () => {
  const {
    products,
    categories,
    loading,
    error,
    lastUpdated,
    refreshData,
    fetchProductsByCategory,
  } = useProduct();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const displayedProducts = selectedCategory
    ? fetchProductsByCategory(selectedCategory)
    : products;

  const renderProductItem = ({ item }: { item: CatalogProduct }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8} onPress={() => router.push(`/Product/${item._id}`)}>
      {item.images.length > 0 ? (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.productImage, styles.emptyImage]}>
          <Text style={styles.emptyImageText}>No Image</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.productPrice}>{item.price.toFixed(2)} XAF</Text>
        <Text
          style={[
            styles.productStock,
            item.stock > 0 ? styles.inStock : styles.outOfStock,
          ]}>
          {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item._id && styles.selectedCategoryButton,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === item._id ? null : item._id)
      }>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item._id && styles.selectedCategoryText,
        ]}>
        {item.category}
      </Text>
    </TouchableOpacity>
  );

 

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Product Catalog</Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleString()}
          </Text>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          horizontal
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.categoryList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? `${categories.find(c => c._id === selectedCategory)?.category} Products`
            : 'All Products'}
        </Text>

        <FlatList
          data={displayedProducts as CatalogProduct[]}
          renderItem={renderProductItem}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007bff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No products found{selectedCategory ? ' in this category' : ''}
              </Text>
              <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    elevation: 2,
  },
  refreshButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  refreshButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6c757d',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 16,
  },
  categoryList: {
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  selectedCategoryButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryText: {
    color: '#495057',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  productList: {
    paddingBottom: 200,
    
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  productCard: {
    flex: 1,
    minWidth: '48%',
    maxWidth: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f1f3f5',
  },
  emptyImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImageText: {
    color: '#adb5bd',
    fontSize: 12,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    color: '#212529',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 6,
  },
  productStock: {
    fontSize: 13,
    fontWeight: '500',
  },
  inStock: {
    color: '#28a745',
  },
  outOfStock: {
    color: '#dc3545',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default Catalog;