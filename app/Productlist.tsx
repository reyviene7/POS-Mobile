import ProductModal from '@/src/components/ProductModal';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <ProductModal
          visible={true}
          onClose={() => setModalVisible(false)}
          product={selectedProduct} // important if you're editing
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB', // EggShell cream background
    padding: 16,
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
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  gridCard: {
    width: (screenWidth - 32 - 24) / 3,
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 4,
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
  productQuantity: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
    textAlign: 'center',
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

