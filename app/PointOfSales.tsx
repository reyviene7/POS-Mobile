import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Link, Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../api';


type Product = {
  productId: string;
  productName: string;
  categoryName: string;
  size: string | null;
  price: number;
  image: string | null;
  flavorName: string | null;
};

type GroupedProduct = {
  productName: string;
  categoryName: string;
  variants: Product[];
};

type Addon = {
  addonId: number;
  addonName: string;
  categoryName: string;
  categoryId: number;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
  addons: { [addonId: string]: number };
  addonDetails: Addon[];
};

const defaultImage = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg';

export default function PointOfSales() {
  const { cart: cartString } = useLocalSearchParams();
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductGroup, setSelectedProductGroup] = useState<GroupedProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addonQuantities, setAddonQuantities] = useState<{ [addonId: string]: number }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const navigation = useNavigation();
  const fetchData = async () => {
    setLoading(true);
    try {
      const productResponse = await api.get('/products/with-price');
      const apiProducts = productResponse.data;
      if (!Array.isArray(apiProducts)) {
        throw new Error('Products response is not an array');
      }

      const mappedProducts: Product[] = apiProducts.map((product: any) => ({
        productId: product.productId.toString(),
        productName: product.productName || 'Unknown Product',
        categoryName: product.categoryName || 'Uncategorized',
        size: product.size || null,
        price: Number(product.price) || 0,
        image: product.image || null,
        flavorName: product.flavorName || null,
      }));

      // Group products by productName
      const productMap = new Map<string, GroupedProduct>();
      mappedProducts.forEach((product) => {
        if (!productMap.has(product.productName)) {
          productMap.set(product.productName, {
            productName: product.productName,
            categoryName: product.categoryName,
            variants: [],
          });
        }
        productMap.get(product.productName)!.variants.push(product);
      });

      const grouped = Array.from(productMap.values());
      setGroupedProducts(grouped);

      const addonResponse = await api.get('/categories/with-addons');
      const apiAddons = addonResponse.data;
      if (!Array.isArray(apiAddons)) {
        throw new Error('Add-ons response is not an array');
      }

      const mappedAddons: Addon[] = apiAddons.map((addon: any) => ({
        addonId: addon.addonId,
        addonName: addon.addonName,
        categoryName: addon.categoryName,
        categoryId: addon.categoryId,
        price: Number(addon.price) || 0,
      }));

      setAddons(mappedAddons);
      const uniqueCategories = ['All', ...new Set(mappedAddons.map((addon: Addon) => addon.categoryName))];
      setCategories(uniqueCategories);

      Toast.show({
        type: 'success',
        text1: '🥪 Freshly Loaded!',
        text2: 'Menu and add-ons loaded successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (error: any) {
      console.error('Fetch error:', error.message, error.response?.data, error.response?.status);
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: error.response?.status === 404 ? 'API endpoint not found.' : 'Failed to load menu.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollPromptOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const checkLogin = async () => {
      const status = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(status === 'true');
    };
    checkLogin();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace('/Home');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      navigation.setOptions?.({ gestureEnabled: false });

      return () => backHandler.remove();
    }, [])
  );
  
  useEffect(() => {
    const initializeCart = async () => {
      try {
        console.log('PointOfSales: cartString received:', cartString);
        if (cartString) {
          const parsedCart =
            typeof cartString === 'string'
              ? JSON.parse(cartString)
              : Array.isArray(cartString) && cartString.length > 0
              ? JSON.parse(cartString[0])
              : [];
          setCart(parsedCart);
          console.log('PointOfSales: Cart set from cartString:', parsedCart);
        } else {
          await AsyncStorage.removeItem('cart');
          setCart([]);
          console.log('PointOfSales: Cart cleared and set to []');
        }
        const storedCart = await AsyncStorage.getItem('cart');
        console.log('PointOfSales: AsyncStorage cart after init:', storedCart);
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        setCart([]);
      }
    };
    initializeCart();
    fetchData();
  }, [cartString]);

  useEffect(() => {
    if (selectedProductGroup && selectedProductGroup.variants.length === 1) {
      setSelectedVariant(selectedProductGroup.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedProductGroup]);

  if (isLoggedIn === null) {
    return (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingText}>Checking login...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  
  const filteredProducts =
    selectedCategory === 'All'
      ? groupedProducts
      : groupedProducts.filter((p) => p.categoryName === selectedCategory);

  const getAddonsForCategory = (categoryName: string): Addon[] => {
    return addons.filter((addon) => addon.categoryName === categoryName);
  };

  const toggleAddon = (addonId: number) => {
    setAddonQuantities((prev) => ({
      ...prev,
      [addonId]: prev[addonId] ? prev[addonId] + 1 : 1,
    }));
  };

  const decreaseAddonQuantity = (addonId: number) => {
    setAddonQuantities((prev) => {
      const newQuantity = (prev[addonId] || 1) - 1;
      if (newQuantity <= 0) {
        const { [addonId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [addonId]: newQuantity,
      };
    });
  };

  const addToCart = async () => {
    if (!selectedVariant) {
      Toast.show({
        type: 'error',
        text1: '📋 No Variant Selected',
        text2: 'Please select a product variant.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }
    const selectedAddons = getAddonsForCategory(selectedVariant.categoryName).filter(
      (addon) => addonQuantities[addon.addonId]
    );
    const newCartItem = {
      product: selectedVariant,
      quantity,
      addons: { ...addonQuantities },
      addonDetails: selectedAddons.map(({ addonId, addonName, price, categoryName, categoryId }) => ({
        addonId,
        addonName,
        price,
        categoryName,
        categoryId,
      })),
    };
    const newCart = [...cart, newCartItem];
    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      console.log('PointOfSales: Cart saved to AsyncStorage:', newCart);
      Toast.show({
        type: 'success',
        text1: '✅ Added to Cart',
        text2: `${selectedVariant.productName} ${selectedVariant.size ? `(${selectedVariant.size})` : ''} ${selectedVariant.flavorName ? `- ${selectedVariant.flavorName}` : ''} added!`,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage:', error);
      Toast.show({
        type: 'error',
        text1: '⚠️ Error',
        text2: 'Failed to add to cart.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    }
    setSelectedProductGroup(null);
    setSelectedVariant(null);
    setQuantity(1);
    setAddonQuantities({});
  };

  const handleAdjustQuantity = async (index: number, change: number) => {
    const newCart = [...cart];
    const newQuantity = newCart[index].quantity + change;
    if (newQuantity <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQuantity;
    }
    setCart(newCart);
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      console.log('PointOfSales: Cart updated in AsyncStorage:', newCart);
    } catch (error) {
      console.error('Failed to save cart to AsyncStorage:', error);
    }
  };

  const calculateCartSummary = () => {
    let totalAmount = 0;
    let totalQuantity = 0;

    cart.forEach((item) => {
      const productCost = item.product.price * item.quantity;
      const addonCost = Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
        const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
        return sum + (addon ? addon.price * qty : 0);
      }, 0);
      totalAmount += productCost + addonCost;
      totalQuantity += item.quantity;
    });

    return { totalAmount, totalQuantity };
  };

  const { totalAmount, totalQuantity } = calculateCartSummary();

  const renderVariantItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.variantItem,
        selectedVariant?.productId === item.productId &&
        selectedVariant?.size === item.size &&
        selectedVariant?.flavorName === item.flavorName &&
        styles.variantItemActive,
      ]}
      onPress={() => setSelectedVariant(item)}
    >
      <Text style={styles.variantText}>
        {item.size ? `${item.size}` : 'Standard'}
        {item.flavorName ? ` - ${item.flavorName}` : ''}
      </Text>
      <Text style={styles.variantPrice}>₱{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading Menu...</Text>
        </View>
      )}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterButton, selectedCategory === cat && styles.activeFilterButton]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.filterText, selectedCategory === cat && styles.activeFilterText]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: Platform.OS === 'ios' ? 250 : 200, }]}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true ,
        })}
      >
        {filteredProducts.map((group) => (
          <TouchableOpacity
            key={group.productName}
            style={styles.card}
            onPress={() => {
              setSelectedProductGroup(group);
              setQuantity(1);
              setAddonQuantities({});
            }}
          >
            <Image
              source={{ uri: group.variants[0].image || defaultImage }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoRow}>
              <View style={styles.leftCol}>
                <Text style={styles.cardText}>{group.productName}</Text>
                <Text style={styles.priceText}>
                  {group.variants.length > 1
                    ? `₱${Math.min(...group.variants.map((v) => v.price))} - ₱${Math.max(...group.variants.map((v) => v.price))}`
                    : `₱${group.variants[0].price}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {filteredProducts.length > 0 && (
        <Animated.View style={[styles.scrollPrompt, { opacity: scrollPromptOpacity }]}>
          <Text style={styles.scrollText}>Scroll down to see more items</Text>
          <Text style={styles.scrollArrow}>↓</Text>
        </Animated.View>
      )}

      <View style={styles.cartReviewContainer}>
        <Text style={styles.cartReviewTitle}>Cart Summary</Text>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <View
              key={`${item.product.productId}-${item.product.size || ''}-${item.product.flavorName || ''}`}
              style={styles.cartItem}
            >
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemText}>
                  {item.product.productName} {item.product.size ? `(${item.product.size})` : ''}{' '}
                  {item.product.flavorName ? `- ${item.product.flavorName}` : ''}
                </Text>
                {Object.entries(item.addons).map(([addonId, qty]) => {
                  const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
                  return addon ? (
                    <Text key={addonId} style={styles.cartAddonText}>
                      {addon.addonName} x{qty} (₱{addon.price * qty})
                    </Text>
                  ) : null;
                })}
                <Text style={styles.cartSubtotal}>
                  Subtotal: ₱{(
                    item.product.price * item.quantity +
                    Object.entries(item.addons).reduce((sum, [addonId, qty]) => {
                      const addon = item.addonDetails?.find((a) => a.addonId === Number(addonId));
                      return sum + (addon ? addon.price * qty : 0);
                    }, 0)
                  ).toFixed(2)}
                </Text>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleAdjustQuantity(index, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyCartText}>No items in cart</Text>
        )}
      </View>

      <View style={styles.previewContainer}>
        <Link
          href={{
            pathname: '/ConfirmOrder',
            params: { cart: JSON.stringify(cart) },
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

      {selectedProductGroup && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedProductGroup}
          onRequestClose={() => {
            setSelectedProductGroup(null);
            setSelectedVariant(null);
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setSelectedProductGroup(null);
                  setSelectedVariant(null);
                }}
              >
                <Ionicons name="close" size={24} color="#FBBF24" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{selectedProductGroup.productName}</Text>

              {selectedProductGroup.variants.length > 1 && (
                <>
                  <Text style={styles.modalSubtitle}>Select a variant:</Text>
                  <FlatList
                    data={selectedProductGroup.variants}
                    keyExtractor={(item) =>
                      `${item.productId}-${item.size || ''}-${item.flavorName || ''}`
                    }
                    renderItem={renderVariantItem}
                    style={styles.variantList}
                  />
                </>
              )}

              {selectedVariant && (
                <>
                  <Text style={styles.modalPrice}>
                    ₱{selectedVariant.price} (
                    {selectedVariant.size ? `${selectedVariant.size}` : 'Standard'}
                    {selectedVariant.flavorName ? ` - ${selectedVariant.flavorName}` : ''})
                  </Text>

                  <View style={styles.quantityRow}>
                    <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
                      <Text style={styles.qtyBtn}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalQuantityText}>{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
                      <Text style={styles.qtyBtn}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {getAddonsForCategory(selectedProductGroup.categoryName).length > 0 && (
                    <View style={styles.addonContainer}>
                      <Text style={styles.addonTitle}>Select Add-ons:</Text>
                      <View style={styles.addonList}>
                        {getAddonsForCategory(selectedProductGroup.categoryName).map((addon) => (
                          <View key={addon.addonId} style={styles.addonItemWrapper}>
                            <Pressable
                              style={[
                                styles.addonItem,
                                (addonQuantities[addon.addonId] || 0) > 0 && styles.addonItemActive,
                              ]}
                              onPress={() => toggleAddon(addon.addonId)}
                            >
                              <Text style={styles.addonText}>
                                {addon.addonName} - ₱{addon.price}
                              </Text>
                            </Pressable>
                            {(addonQuantities[addon.addonId] || 0) > 0 && (
                              <View style={styles.addonQuantityRow}>
                                <Text style={styles.addonQuantityText}>
                                  {addonQuantities[addon.addonId]} pcs
                                </Text>
                                <TouchableOpacity
                                  onPress={() => decreaseAddonQuantity(addon.addonId)}
                                  style={styles.minusButton}
                                >
                                  <Text style={styles.minusText}>-</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity style={styles.confirmButton} onPress={addToCart}>
                <Text style={styles.confirmText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDEB',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios'
      ? 0
      : Platform.OS === 'android'
      ? StatusBar.currentHeight || 12
      : 12,
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
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
    backgroundColor: '#FEF9C3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#F59E0B',
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
    paddingBottom: Platform.OS === 'ios' ? 250 : 200,
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
    elevation: Platform.OS === 'android' ? 4 : 2,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
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
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, 
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Platform.select({ ios: 20, android: 16 }),
    width: '90%',
    maxWidth: 400,
    maxHeight: Platform.OS === 'android' ? '80%' : '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#FBBF24',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  variantList: {
    maxHeight: 150,
    marginBottom: 12,
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginBottom: 4,
  },
  variantItemActive: {
    backgroundColor: '#F59E0B',
  },
  variantText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  variantPrice: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#FBBF24',
  },
  modalQuantityText: {
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
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
  },
  addonItemActive: {
    backgroundColor: '#F59E0B',
  },
  addonText: {
    color: '#1F2937',
    fontWeight: '600',
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
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'android' ? 12 : 10,
    backgroundColor: '#E5E7EB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 5,
    height: Platform.OS === 'android' ? 70 : 60,
  },
  reviewButton: {
    backgroundColor: '#FBBF24',
    paddingVertical: Platform.OS === 'android' ? 12 : 10,
    minHeight: Platform.OS === 'android' ? 48 : 44, 
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  reviewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
    position: 'absolute',
    bottom: 190,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    marginHorizontal: 60,
    zIndex: 10,
    elevation: 3,
  },
  scrollText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  scrollArrow: {
    fontSize: 14,
    marginLeft: 6,
    color: '#4B5563',
  },
  cartReviewContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginBottom: Platform.OS === 'android' ? 90 : 80,
    marginHorizontal: 8,
  },
  cartReviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartAddonText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cartSubtotal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B91C1C',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 6,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
  },
  quantityButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#1F2937',
    marginHorizontal: 8,
    fontWeight: '600',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 12,
  },
});