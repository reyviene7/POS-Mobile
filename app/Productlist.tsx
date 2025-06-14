import ProductModal from '@/src/components/ProductModal'; // Add this line
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import productsData from '../src/scripts/products.json';

const screenWidth = Dimensions.get('window').width;

type ProductItem = {
  id: string;
  name: string;
  price: number;
  size?: string;
  category: string;
  quantity: number;
  image?: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadedProducts: ProductItem[] = [];

    productsData.categories.forEach((category) => {
      category.products.forEach((product: any, index: number) => {
        const productImage = product.image || null;

        if (product.variants) {
          product.variants.forEach((variant: any, i: number) => {
            loadedProducts.push({
              id: `${category.name}-${index}-${i}`,
              name: product.name,
              price: variant.price,
              size: variant.size,
              category: category.name,
              quantity: variant.quantity || 0,
              image: productImage,
            });
          });
        } else {
          loadedProducts.push({
            id: `${category.name}-${index}`,
            name: product.name,
            price: product.price,
            category: category.name,
            quantity: product.quantity || 0,
            image: productImage,
          });
        }
      });
    });

    setProducts(loadedProducts);
  }, []);

  const getDefaultImage = (category: string) => {
    switch (category) {
      case 'Drinks':
        return require('../assets/images/default-drink.jpg');
      default:
        return require('../assets/images/default-product.jpg');
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map((item) => item.category)))];

  const filteredProducts =
    filterCategory === 'All'
      ? products
      : products.filter((product) => product.category === filterCategory);

  const handleEditProduct = (item: ProductItem) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  const renderProductItem = ({ item }: { item: ProductItem }) => {
    if (viewMode === 'list') {
      return (
        <TouchableOpacity style={styles.card} onPress={() => handleEditProduct(item)}>
          <Image
            source={item.image ? { uri: item.image } : getDefaultImage(item.category)}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.details}>
            <Text style={styles.productName}>
              {item.name} {item.size ? `(${item.size})` : ''}
            </Text>
            <Text style={styles.productDetails}>
              ₱{item.price} | Category: {item.category}
            </Text>
            <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.gridCard} onPress={() => handleEditProduct(item)}>
        <Image
          source={item.image ? { uri: item.image } : getDefaultImage(item.category)}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <View style={styles.gridDetails}>
          <Text style={styles.productName}>
            {item.name} {item.size ? `(${item.size})` : ''}
          </Text>
          <View style={styles.priceQuantityContainer}>
            <Text style={styles.productDetails}>₱{item.price}</Text>
            <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toggle View */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
          onPress={() => setViewMode('list')}>
          <Text style={styles.viewModeText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
          onPress={() => setViewMode('grid')}>
          <Text style={styles.viewModeText}>Grid</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Picker */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={filterCategory}
          onValueChange={(value) => setFilterCategory(value)}
          style={styles.filterPicker}>
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {/* List/Grid View */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 3 : 1}
        contentContainerStyle={
          viewMode === 'grid' ? styles.gridContent : styles.listContent
        }
        renderItem={renderProductItem}
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleAddProduct}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Product Modal */}
      <ProductModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 16,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activeViewMode: {
    backgroundColor: '#6366F1',
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginRight: 12,
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingBottom: 80,
  },
  gridContent: {
    paddingBottom: 80,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  gridCard: {
    width: (screenWidth - 32 - 16) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: '#D1D5DB',
  },
  gridImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#D1D5DB',
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  gridDetails: {
    padding: 8,
    alignItems: 'center',
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  productDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  productQuantity: {
    fontSize: 12,
    color: '#374151',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#6366F1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
