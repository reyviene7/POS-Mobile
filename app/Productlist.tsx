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
import productsData from '../src/scripts/products.json'; // ✅ Adjust path if needed

// Get the screen width for calculating grid item width
const screenWidth = Dimensions.get('window').width;

// ✅ Define the item type
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
  const [listFilterCategory, setListFilterCategory] = useState<string>('All');
  const [gridFilterCategory, setGridFilterCategory] = useState<string>('All');

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
      case 'Sandwiches':
        return require('../assets/images/default-product.jpg');
      case 'Drinks':
        return require('../assets/images/default-drink.jpg');
      default:
        return require('../assets/images/default-product.jpg');
    }
  };

  // Get unique categories for the filter
  const categories = ['All', ...Array.from(new Set(products.map((item) => item.category)))];

  // Filter products for List View based on selected category
  const filteredListProducts =
    listFilterCategory === 'All'
      ? products
      : products.filter((product) => product.category === listFilterCategory);

  // Filter products for Grid View based on selected category
  const filteredGridProducts =
    gridFilterCategory === 'All'
      ? products
      : products.filter((product) => product.category === gridFilterCategory);

  const renderListView = () => (
    <>
      {/* Category Filter for List View */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={listFilterCategory}
          onValueChange={(itemValue) => setListFilterCategory(itemValue)}
          style={styles.filterPicker}>
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredListProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : getDefaultImage(item.category)
              }
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
              <Text style={styles.productQuantity}>
                Qty: {item.quantity}
              </Text>
            </View>
          </View>
        )}
      />
    </>
  );

  const renderGridView = () => (
    <>
      {/* Category Filter for Grid View */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={gridFilterCategory}
          onValueChange={(itemValue) => setGridFilterCategory(itemValue)}
          style={styles.filterPicker}>
          {categories.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredGridProducts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <View style={styles.gridCard}>
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : getDefaultImage(item.category)
              }
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
          </View>
        )}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* View Mode Selection */}
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

      {/* Render Selected View */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'grid' && renderGridView()}
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
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  gridContent: {
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
  },
  gridCard: {
    width: (screenWidth - 32 - 16) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    fontSize: 14, // Reduced for better fit in 3-column grid
    fontWeight: '600',
    color: '#1F2937',
  },
  productDetails: {
    fontSize: 12, // Reduced for better fit
    color: '#6B7280',
  },
  productQuantity: {
    fontSize: 12, // Reduced for better fit
    color: '#374151',
  },
});