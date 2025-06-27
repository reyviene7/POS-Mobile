import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../../api';
import { uploadToCloudinary } from '../../../CloudinaryConfig';

type ProductModalProps = {
  visible: boolean;
  onClose: () => void;
  product: {
    id?: number;
    name?: string;
    price?: number;
    categoryId?: number;
    isVariant?: boolean;
    image?: string;
    size?: string | null;
    flavorName?: string | null;
  } | null;
  onSave: (productData: any) => void;
};

type Category = {
  id: number;
  name: string;
};

type Variant = {
  size: string;
  price: string;
  quantity: string;
};

export default function ProductModal({ visible, onClose, product, onSave }: ProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('Select Category');
  const [isVariant, setIsVariant] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // For modal animation
  const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg';

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await api.get('/categories');
        const fetchedCategories = response.data.map((cat: any) => ({
          id: cat.categoryId,
          name: cat.categoryName,
        }));
        setCategories(fetchedCategories);

        if (product && product.categoryId) {
          const category = fetchedCategories.find((cat: Category) => cat.id === product.categoryId);
          if (category) {
            setCategoryId(product.categoryId.toString());
            setCategoryName(category.name);
          } else {
            setError('Selected category not found.');
            setCategoryId('');
            setCategoryName('Select Category');
          }
        }
      } catch {
        Alert.alert('Error', 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [product]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(product.price?.toString() || '');
      setIsVariant(!!product.isVariant);
      setImageUri(product.image ?? null);
      setVariants(
        product.size
          ? [{ size: product.size, price: product.price?.toString() || '', quantity: product.flavorName || '' }]
          : [{ size: '', price: '', quantity: '' }]
      );
    } else {
      setName('');
      setPrice('');
      setCategoryId('');
      setCategoryName('Select Category');
      setIsVariant(false);
      setImageUri(null);
      setVariants([{ size: '', price: '', quantity: '' }]);
    }
  }, [product]);

  const addVariantField = () => setVariants([...variants, { size: '', price: '', quantity: '' }]);

  const updateVariant = (index: number, key: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!name.trim()) return 'Product name is required.';
    if (!categoryId) return 'Category is required.';
    if (!isVariant && (!price.trim() || isNaN(+price))) return 'Valid price required for non-variant product.';
    if (isVariant) {
      for (const variant of variants) {
        if (!variant.size.trim() || !variant.price.trim() || isNaN(+variant.price)) {
          return 'Each variant must have a valid size and price.';
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = imageUri;

      if (!uploadedImageUrl && !product) {
        uploadedImageUrl = DEFAULT_IMAGE_URL;
      }

      if (uploadedImageUrl && !uploadedImageUrl.startsWith('https://')) {
        uploadedImageUrl = await uploadToCloudinary(uploadedImageUrl);
      }

      const baseProduct = {
        productName: name.trim(),
        categoryId: parseInt(categoryId),
        isVariant,
        price: isVariant ? 0 : parseFloat(price),
        image: uploadedImageUrl,
        size: isVariant ? null : variants[0]?.size || null,
        flavorName: isVariant ? null : variants[0]?.quantity || null,
      };

      let productId = product?.id;

      if (productId) {
        await api.put(`/products/${productId}`, baseProduct);
      } else {
        const response = await api.post('/products', baseProduct);
        productId = response.data.productId;
      }

      if (isVariant && productId) {
        for (const variant of variants) {
          await api.post('/product-variants', {
            product: { productId },
            size: variant.size,
            price: parseFloat(variant.price),
            quantity: parseInt(variant.quantity) || 0,
          });
        }
      }

      Alert.alert('Success', 'Product saved!');
      onSave({
        name,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        isVariant,
        image: uploadedImageUrl,
        size: isVariant ? null : variants[0]?.size || null,
        flavorName: isVariant ? null : variants[0]?.quantity || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const openCategoryModal = () => {
    setCategoryModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeCategoryModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setCategoryModalVisible(false));
  };

  const selectCategory = (category: Category) => {
    setCategoryId(category.id.toString());
    setCategoryName(category.name);
    closeCategoryModal();
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#F59E0B" />
            </View>
          )}

          <ScrollView>
            <Text style={styles.title}>{product ? 'Edit Product' : 'Add Product'}</Text>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 160, borderRadius: 12, marginBottom: 12 }}
              />
            )}

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadText}>{imageUri ? 'Replace Image' : 'Upload Image'}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={name}
              onChangeText={setName}
            />

            {!isVariant && (
              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            )}

            <TouchableOpacity style={styles.dropdownButton} onPress={openCategoryModal}>
              <Text style={styles.dropdownText}>{categoryName}</Text>
              <Ionicons name="chevron-down" size={20} color="#92400E" />
            </TouchableOpacity>

            <Modal
              transparent
              visible={isCategoryModalVisible}
              animationType="none"
              onRequestClose={closeCategoryModal}
            >
              <View style={styles.categoryModalOverlay}>
                <Animated.View style={[styles.categoryModalContent, { opacity: fadeAnim }]}>
                  <View style={styles.categoryModalHeader}>
                    <Text style={styles.categoryModalTitle}>🥪 Choose a Category</Text>
                    <TouchableOpacity onPress={closeCategoryModal}>
                      <Ionicons name="close" size={24} color="#92400E" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.categoryList}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryItem,
                          categoryId === cat.id.toString() && styles.categoryItemSelected,
                        ]}
                        onPress={() => selectCategory(cat)}
                      >
                        <Text style={styles.categoryItemText}>{cat.name}</Text>
                        {categoryId === cat.id.toString() && (
                          <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </Modal>

            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Has Variant</Text>
              <TouchableOpacity
                style={[styles.checkboxBox, isVariant && styles.checkboxBoxChecked]}
                onPress={() => setIsVariant(!isVariant)}
              >
                {isVariant && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>

            {isVariant &&
              variants.map((variant, idx) => (
                <View key={idx} style={styles.variantGroup}>
                  <TextInput
                    placeholder="Size (e.g. 16oz)"
                    style={styles.input}
                    value={variant.size}
                    onChangeText={(text) => updateVariant(idx, 'size', text)}
                  />
                  <TextInput
                    placeholder="Price"
                    style={styles.input}
                    keyboardType="numeric"
                    value={variant.price}
                    onChangeText={(text) => updateVariant(idx, 'price', text)}
                  />
                  <TextInput
                    placeholder="Quantity"
                    style={styles.input}
                    keyboardType="numeric"
                    value={variant.quantity}
                    onChangeText={(text) => updateVariant(idx, 'quantity', text)}
                  />
                </View>
              ))}

            {isVariant && (
              <TouchableOpacity onPress={addVariantField}>
                <Text style={{ color: '#D97706', marginBottom: 16 }}>+ Add another variant</Text>
              </TouchableOpacity>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: '#92400E',
    fontWeight: '600',
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModalContent: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D97706',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FDE68A',
  },
  categoryItemSelected: {
    backgroundColor: '#F59E0B',
  },
  categoryItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D97706',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  variantGroup: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
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
    marginBottom: 12,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#FDE68A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
});