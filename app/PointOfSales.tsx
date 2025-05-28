import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import rawProductsData from '../src/scripts/products.json';

// ✅ TypeScript type definitions
type Variant = {
  size: string;
  price: number;
};

type Product = {
  name: string;
  price?: number;
  variants?: Variant[];
  image?: string;
};

type Category = {
  name: string;
  products: Product[];
};

type ProductsData = {
  store: string;
  categories: Category[];
};

// ✅ Cast JSON import to typed object
const productsData: ProductsData = rawProductsData;

// ✅ Build category list
const categories = ['All', ...productsData.categories.map(c => c.name)];

export default function PointOfSales() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ✅ Flatten and include quantity
  const flattenedProducts = productsData.categories.flatMap(category => {
    return category.products.flatMap(product => {
      if (product.variants) {
        return product.variants.map(variant => ({
          name: `${product.name} - ${variant.size}`,
          price: variant.price,
          quantity: 100, // <- can be pulled dynamically if added in JSON
          category: category.name,
          image: product.image || null,
        }));
      } else {
        return [{
          name: product.name,
          price: product.price || 0,
          quantity: 100,
          category: category.name,
          image: product.image || null,
        }];
      }
    });
  });

  // ✅ Filter by selected category
  const filteredProducts =
    selectedCategory === 'All'
      ? flattenedProducts
      : flattenedProducts.filter(p => p.category === selectedCategory);

  // ✅ Default image per category
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                selectedCategory === cat && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === cat && styles.activeFilterText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {filteredProducts.map((p, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => {
              // TODO: Handle product press
            }}
          >
            <Image
              source={
                p.image
                  ? { uri: p.image }
                  : getDefaultImage(p.category)
              }
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoRow}>
              <View style={styles.leftCol}>
                <Text style={styles.cardText}>{p.name}</Text>
                <Text style={styles.priceText}>₱{p.price}</Text>
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.qtyText}>Qty: {p.quantity}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  filterRow: {
    height: 48,
    justifyContent: 'center',
  },
  filterScroll: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 100,
    backgroundColor: '#D1D5DB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  },
  leftCol: {
    flex: 1,
    paddingRight: 4,
  },
  rightCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  priceText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
});
