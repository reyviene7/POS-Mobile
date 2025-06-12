import { Link } from 'expo-router'; // Using expo-router for navigation
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import rawProductsData from '../src/scripts/products.json';

type Variant = {
  size: string;
  price: number;
  quantity: number;
};

type Product = {
  name: string;
  price?: number;
  quantity?: number;
  variants?: Variant[];
  flavors?: string[];
  image?: string;
};

type Category = {
  name: string;
  products: Product[];
  addons?: string[];
};

type ProductsData = {
  store: string;
  categories: Category[];
};

type CartItem = {
  product: any;
  quantity: number;
  addons: { [key: string]: number };
};

const productsData: ProductsData = rawProductsData;
const categories = ['All', ...productsData.categories.map(c => c.name)];

export default function PointOfSales() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addonQuantities, setAddonQuantities] = useState<{ [key: string]: number }>({});
  const [cart, setCart] = useState<CartItem[]>([]); // Track cart items

  const flattenedProducts = productsData.categories.flatMap(category => {
    return category.products.flatMap(product => {
      if (product.variants) {
        return product.variants.map(variant => ({
          name: `${product.name} - ${variant.size}`,
          price: variant.price,
          quantity: variant.quantity,
          category: category.name,
          image: product.image || null,
          baseName: product.name,
        }));
      } else {
        return [{
          name: product.name,
          price: product.price || 0,
          quantity: product.quantity || 0,
          category: category.name,
          image: product.image || null,
          baseName: product.name,
        }];
      }
    });
  });

  const filteredProducts =
    selectedCategory === 'All'
      ? flattenedProducts
      : flattenedProducts.filter(p => p.category === selectedCategory);

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

  const getAddonsForCategory = (category: string): string[] => {
    const cat = productsData.categories.find(c => c.name === category);
    return cat?.addons || [];
  };

  const toggleAddon = (addon: string) => {
    setAddonQuantities(prev => ({
      ...prev,
      [addon]: prev[addon] ? prev[addon] + 1 : 1,
    }));
  };

  const decreaseAddonQuantity = (addon: string) => {
    setAddonQuantities(prev => {
      const newQuantity = (prev[addon] || 1) - 1;
      if (newQuantity <= 0) {
        const { [addon]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [addon]: newQuantity,
      };
    });
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    setCart(prev => [
      ...prev,
      { product: selectedProduct, quantity, addons: { ...addonQuantities } },
    ]);
    setSelectedProduct(null);
    setQuantity(1);
    setAddonQuantities({});
  };

  const calculateCartSummary = () => {
    let totalAmount = 0;
    let totalQuantity = 0;

    cart.forEach(item => {
      const productCost = item.product.price * item.quantity;
      const addonCost = Object.entries(item.addons).reduce((sum, [_, qty]) => {
        return sum + qty * 5; // Assume ₱5 per add-on piece
      }, 0);
      totalAmount += productCost + addonCost;
      totalQuantity += item.quantity;
    });

    return { totalAmount, totalQuantity };
  };

  const { totalAmount, totalQuantity } = calculateCartSummary();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                selectedCategory === cat && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedCategory(cat)}>
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === cat && styles.activeFilterText,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {filteredProducts.map((p, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => {
              setSelectedProduct(p);
              setQuantity(1);
              setAddonQuantities({});
            }}>
            <Image
              source={p.image ? { uri: p.image } : getDefaultImage(p.category)}
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
        <View style={styles.scrollPrompt}>
          <Text style={styles.scrollText}>Scroll down to see more items</Text>
          <Text style={styles.scrollArrow}>↓</Text>
        </View>
      </ScrollView>

      <View style={styles.previewContainer}>
        <Link
          href={{
            pathname: '/ConfirmOrder',
            query: { cart: JSON.stringify(cart) }, // Pass cart as a query parameter
          }}
          asChild
        >
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewText}>Review</Text>
          </TouchableOpacity>
        </Link>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₱{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.qtySection}>
          <Text style={styles.qtyLabel}>Product Qty</Text>
          <Text style={styles.qtyValue}>{totalQuantity}</Text>
        </View>
      </View>

      {selectedProduct && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedProduct}
          onRequestClose={() => setSelectedProduct(null)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedProduct(null)}>
                <Text style={styles.closeText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalPrice}>₱{selectedProduct.price}</Text>

              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Text style={styles.qtyBtn}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(q => q + 1)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </TouchableOpacity>
              </View>

              {getAddonsForCategory(selectedProduct.category).length > 0 && (
                <View style={styles.addonContainer}>
                  <Text style={styles.addonTitle}>Select Add-ons:</Text>
                  <View style={styles.addonList}>
                    {getAddonsForCategory(selectedProduct.category).map(addon => (
                      <View key={addon} style={styles.addonItemWrapper}>
                        <Pressable
                          style={[
                            styles.addonItem,
                            (addonQuantities[addon] || 0) > 0 && styles.addonItemActive,
                          ]}
                          onPress={() => toggleAddon(addon)}>
                          <Text style={styles.addonText}>{addon}</Text>
                        </Pressable>
                        {(addonQuantities[addon] || 0) > 0 && (
                          <View style={styles.addonQuantityRow}>
                            <Text style={styles.addonQuantityText}>
                              {addonQuantities[addon]} pcs
                            </Text>
                            <TouchableOpacity
                              onPress={() => decreaseAddonQuantity(addon)}
                              style={styles.minusButton}>
                              <Text style={styles.minusText}>-</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.confirmButton} onPress={addToCart}>
                <Text style={styles.confirmText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

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
    marginHorizontal: '1%',
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qtyBtn: {
    fontSize: 24,
    paddingHorizontal: 16,
    color: '#4F46E5',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  addonContainer: {
    marginBottom: 12,
  },
  addonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  addonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addonItemWrapper: {
    marginBottom: 8,
  },
  addonItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginRight: 6,
  },
  addonItemActive: {
    backgroundColor: '#4F46E5',
  },
  addonText: {
    color: 'white',
  },
  addonQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addonQuantityText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  minusButton: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  minusText: {
    fontSize: 16,
    color: '#4F46E5',
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
  },
  reviewButton: {
    backgroundColor: '#4F46E5',
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reviewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  totalSection: {
    flex: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  qtySection: {
    flex: 1,
    alignItems: 'center',
  },
  qtyLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  scrollPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  scrollText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scrollArrow: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
  },
});