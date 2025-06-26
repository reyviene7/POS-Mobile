import ProductModal from '@/src/components/ProductModal';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../api';

const screenWidth = Dimensions.get('window').width;

type ProductItem = {
  id: string;
  name: string;
  price: number;
  size?: string;
  categoryId: number;
  flavorName?: string;
  image?: string;
  categoryName?: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/with-price');
      const apiProducts = response.data;
      console.log('Fetched products:', apiProducts); // Debug duplicates

      // Ensure unique products by ID
      const uniqueProducts = Array.from(
        new Map(apiProducts.map((product: any) => [product.productId, product])).values()
      );

      const mappedProducts: ProductItem[] = uniqueProducts.map((product: any) => ({
        id: product.productId.toString(),
        name: product.productName,
        price: parseFloat(product.price),
        size: product.size || undefined,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        flavorName: product.flavorName || undefined,
        image: product.image || 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg',
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/products/${id}`);
            Alert.alert('Success', 'Product deleted successfully!');
            fetchProducts();
          } catch (err) {
            console.error('Error deleting product:', err);
            Alert.alert('Error', 'Failed to delete product. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleEditProduct = (item: ProductItem) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  const handleSaveProduct = async (productData: any) => {
    setLoading(true);
    try {
      const payload = {
        productName: productData.name,
        categoryId: productData.categoryId,
        isVariant: productData.isVariant || false,
        price: productData.price,
        image: productData.image,
      };

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, payload);
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        await api.post('/products', payload);
        Alert.alert('Success', 'Product created successfully!');
      }

      fetchProducts();
      setModalVisible(false);
    } catch (err) {
      console.error('Error saving product:', err);
      Alert.alert('Error', 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map((item) => item.categoryName)))];

  const filteredProducts =
    filterCategory === 'All'
      ? products
      : products.filter((product) => product.categoryName === filterCategory);

  const renderProductItem = ({ item }: { item: ProductItem }) => {
    if (viewMode === 'list') {
      return (
        <TouchableOpacity style={styles.card} onPress={() => handleEditProduct(item)}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.details}>
            <Text style={styles.productName}>
              {item.name} {item.size ? `(${item.size})` : ''} {item.flavorName ? `- ${item.flavorName}` : ''}
            </Text>
            <Text style={styles.productDetails}>
              ₱{item.price} | Category: {item.categoryName}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.gridCard} onPress={() => handleEditProduct(item)}>
        <Image
          source={{ uri: item.image }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <View style={styles.gridDetails}>
          <Text style={styles.productName}>
            {item.name} {item.size ? `(${item.size})` : ''} {item.flavorName ? `- ${item.flavorName}` : ''}
          </Text>
          <View style={styles.priceQuantityContainer}>
            <Text style={styles.productDetails}>₱{item.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Ionicons name="trash" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
          onPress={() => setViewMode('list')}
        >
          <Text style={styles.viewModeText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
          onPress={() => setViewMode('grid')}
        >
          <Text style={styles.viewModeText}>Grid</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={filterCategory}
          onValueChange={(value) => setFilterCategory(value)}
          style={styles.filterPicker}
        >
          {categories.map((cat, index) => (
            <Picker.Item key={`cat-${index}`} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 3 : 1}
        contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
        renderItem={renderProductItem}
      />

      <TouchableOpacity style={styles.floatingButton} onPress={handleAddProduct}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <ProductModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProduct}
        product={
          selectedProduct
            ? {
                id: Number(selectedProduct.id),
                name: selectedProduct.name,
                price: selectedProduct.price,
                categoryId: selectedProduct.categoryId,
                isVariant: false,
              }
            : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#FDE68A',
  },
  activeViewMode: {
    backgroundColor: '#F59E0B',
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350F',
    marginRight: 12,
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#FEF9C3',
    color: '#1F2937',
  },
  listContent: {
    paddingBottom: 100,
  },
  gridContent: {
    paddingBottom: 100,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  gridCard: {
    width: (screenWidth - 32 - 26) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 2,
    marginVertical: 4,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  gridImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  gridDetails: {
    padding: 8,
    alignItems: 'center',
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  productDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 24,
    right: 2,
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#F59E0B',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});