import ProductModal from '@/src/components/modals/ProductModal';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../api';
import { uploadToCloudinary } from '../CloudinaryConfig';
import DeleteModal from '../src/components/modals/DeleteModal';

const screenWidth = Dimensions.get('window').width;

type ProductItem = {
  id: string;
  name: string;
  price: number;
  size?: string | null;
  categoryId: number;
  flavorName?: string | null;
  image?: string | null;
  categoryName?: string | null;
  isVariant?: boolean;
};

export default function ProductList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);

  const defaultImage = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/with-price');
      const apiProducts = response.data;

      if (!Array.isArray(apiProducts)) {
        throw new Error('API response is not an array');
      }

      // Group products by productId
      const productMap = new Map<string, any[]>();
      apiProducts.forEach((product: any) => {
        const productId = product.productId.toString();
        if (!productMap.has(productId)) {
          productMap.set(productId, []);
        }
        productMap.get(productId)!.push(product);
      });

      const mappedProducts: ProductItem[] = Array.from(productMap.entries()).map(([id, productGroup]) => {
        const product = productGroup[0];
        const hasVariants = productGroup.length > 1 || productGroup.some(p => p.size || p.flavorName);
        return {
          id: id,
          name: product.productName || 'Unknown Product',
          price: hasVariants ? 0 : Number(product.price) || 0, // No price for variant products
          size: product.size || null,
          categoryId: product.categoryId || 0,
          categoryName: product.categoryName || 'Uncategorized',
          flavorName: product.flavorName || null,
          image: product.image || defaultImage,
          isVariant: hasVariants,
        };
      });

      setProducts(mappedProducts);
      if (!hasShownInitialToast) {
        Toast.show({
          type: 'success',
          text1: '🥪 Freshly Baked!',
          text2: 'Products loaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        setHasShownInitialToast(true);
      }
    } catch (error: any) {
      console.error('Fetch products error:', error.message, error.response?.data, error.response?.status);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: error.response?.status === 404 ? 'API endpoint not found.' : 'Failed to load product list.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteConfirmVisible(false);
    setLoading(true);
    try {
      await api.delete(`/products/${productToDelete}`);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Product removed successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: err.response?.status === 404 ? 'Product not found.' : 'Failed to delete product.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  const handleEditProduct = (item: ProductItem) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setProductToDelete(null);
  };

  const handleSaveProduct = async (productData: any) => {
    setLoading(true);
    try {
      let imageUrl: string | null = selectedProduct ? (selectedProduct.image ?? null) : defaultImage;

      if (productData.image && !productData.image.startsWith('https://') && productData.image !== defaultImage) {
        imageUrl = await uploadToCloudinary(productData.image);
      }

      const payload = {
        productName: productData.productName,
        categoryId: productData.categoryId,
        isVariant: productData.isVariant || false,
        price: productData.isVariant ? 0 : productData.price,
        image: imageUrl,
        size: null,
        flavorName: null,
      };

      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, payload);
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Product updated successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      } else {
        await api.post('/products', payload);
        Toast.show({
          type: 'success',
          text1: '🥪 Yum!',
          text2: 'Product created successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      }

      fetchProducts();
      setModalVisible(false);
    } catch (error: any) {
      console.error('Error saving product:', error.message, error.response?.data, error.response?.status);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: error.message.includes('Cloudinary') ? 'Failed to upload image to Cloudinary.' : 'Failed to save product.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map((item) => item.categoryName || 'Uncategorized')))];

  const filteredProducts =
    filterCategory === 'All'
      ? products
      : products.filter((product) => product.categoryName === filterCategory);

  const renderProductItem = ({ item }: { item: ProductItem }) => {
    const imageSource: ImageSourcePropType = {
      uri: item.image || defaultImage,
    };

    if (viewMode === 'list') {
      return (
        <TouchableOpacity style={styles.card} onPress={() => handleEditProduct(item)}>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.details}>
            <Text style={styles.productName}>
              {item.name}
            </Text>
            <Text style={styles.productDetails}>
              {item.isVariant ? 'Multiple Variants' : `₱${item.price.toFixed(2)}`} | Category: {item.categoryName}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.gridCard} onPress={() => handleEditProduct(item)}>
        <Image
          source={imageSource}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <View style={styles.gridDetails}>
          <Text style={styles.productName}>
            {item.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productDetails}>
              {item.isVariant ? 'Multiple Variants' : `₱${item.price.toFixed(2)}`}
            </Text>
            <Text style={styles.productDetails}>Category: {item.categoryName}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
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
      <Text style={styles.title}>🍽️ Fresh Fillings</Text>
      <Text style={styles.subtitle}>
        Manage your tasty products below!
      </Text>
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
      <DeleteModal
        visible={deleteConfirmVisible}
        itemType="product"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
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
                isVariant: selectedProduct.isVariant ?? false,
                image: selectedProduct.image ?? undefined,
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
    paddingTop: 38,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 16,
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
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
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