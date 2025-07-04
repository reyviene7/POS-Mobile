import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import Toast from 'react-native-toast-message';
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
  flavor: string;
};

export default function ProductModal({ visible, onClose, product, onSave }: ProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState('Select Category');
  const [isVariant, setIsVariant] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([{ size: '', price: '', flavor: '' }]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get('/categories');
        const catList = res.data.map((cat: any) => ({ id: cat.categoryId, name: cat.categoryName }));
        setCategories(catList);

        if (product?.categoryId) {
          const matched = catList.find((c: Category) => c.id === product.categoryId);
          if (matched) {
            setCategoryId(String(matched.id));
            setCategoryName(matched.name);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        Toast.show({ type: 'error', text1: '⚠️ Error', text2: 'Failed to load categories.', topOffset: 40 });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [product]);

  // Fetch product variants and reset state for new product
  useEffect(() => {
    if (!visible) {
      // Reset state when modal is closed
      setName('');
      setPrice('');
      setCategoryId('');
      setCategoryName('Select Category');
      setIsVariant(false);
      setImageUri(null);
      setVariants([{ size: '', price: '', flavor: '' }]);
      setFormErrors([]);
      return;
    }

    if (product?.id) {
      setLoading(true);
      setName(product.name || '');
      setPrice(product.price?.toString() || '0');
      setImageUri(product.image ?? null);
      setIsVariant(product.isVariant ?? false);

      // Fetch variants for the specific product
      api.get(`/products/with-price?productId=${product.id}`)
        .then(res => {
          const productData = res.data;
          if (!Array.isArray(productData)) {
            throw new Error('Invalid API response: Expected an array');
          }

          // Ensure only variants for the current productId are processed
          const filteredVariants = productData.filter((v: any) => v.productId === product.id);
          if (filteredVariants.length === 0 && product.isVariant) {
            Toast.show({
              type: 'error',
              text1: '⚠️ Error',
              text2: 'No variants found for this product.',
              topOffset: 40,
            });
            setVariants([{ size: '', price: '', flavor: '' }]);
            return;
          }

          setName(filteredVariants[0]?.productName || product.name || '');
          setPrice(filteredVariants[0]?.price?.toString() || product.price?.toString() || '0');
          setImageUri(filteredVariants[0]?.image || product.image || null);

          const matchedCategory = categories.find(c => c.id === filteredVariants[0]?.categoryId || product.categoryId);
          if (matchedCategory) {
            setCategoryId(String(matchedCategory.id));
            setCategoryName(matchedCategory.name);
          }

          if (product.isVariant) {
            const variantList = filteredVariants.map((v: any) => ({
              size: v.size || '',
              price: v.price?.toString() || '',
              flavor: v.flavorName || '',
            }));
            setVariants(variantList.length > 0 ? variantList : [{ size: '', price: '', flavor: '' }]);
          } else {
            setVariants([{ size: '', price: '', flavor: '' }]);
          }
        })
        .catch(err => {
          console.error('Error fetching product variants:', err);
          Toast.show({
            type: 'error',
            text1: '⚠️ Error',
            text2: 'Failed to load product variants.',
            topOffset: 40,
          });
          setVariants([{ size: '', price: '', flavor: '' }]);
        })
        .finally(() => setLoading(false));
    } else {
      // Reset for new product
      setName('');
      setPrice('');
      setCategoryId('');
      setCategoryName('Select Category');
      setIsVariant(false);
      setImageUri(null);
      setVariants([{ size: '', price: '', flavor: '' }]);
      setFormErrors([]);
    }
  }, [product, categories, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const addVariant = () => setVariants([...variants, { size: '', price: '', flavor: '' }]);

  const updateVariant = (index: number, key: keyof Variant, value: string) => {
    const copy = [...variants];
    copy[index][key] = value;
    setVariants(copy);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('Product name is required');
    if (!categoryId) errors.push('Category is required');
    if (!isVariant && (!price || isNaN(+price) || +price <= 0)) {
      errors.push('Price is required and must be greater than 0 for non-variant products');
    }
    if (isVariant) {
      if (variants.length === 0) {
        errors.push('At least one variant is required');
      }
      variants.forEach((v, i) => {
        if (!v.size) errors.push(`Size is required for variant ${i + 1}`);
        if (!v.price || isNaN(+v.price) || +v.price <= 0) errors.push(`Price is required and must be greater than 0 for variant ${i + 1}`);
        if (!v.flavor) errors.push(`Flavor is required for variant ${i + 1}`);
      });
    }
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: '⚠️ Validation Error',
        text2: formErrors[0],
        topOffset: 40,
      });
      return;
    }

    setLoading(true);
    try {
      let uploadedImage = imageUri || DEFAULT_IMAGE_URL;
      if (uploadedImage && !uploadedImage.startsWith('https://') && uploadedImage !== DEFAULT_IMAGE_URL) {
        uploadedImage = await uploadToCloudinary(uploadedImage);
      }

      const payload = {
        productName: name.trim(),
        categoryId: parseInt(categoryId),
        isVariant,
        price: isVariant ? 0 : parseFloat(price),
        image: uploadedImage,
        size: null,
        flavorName: null,
      };

      let productId = product?.id;

      if (productId) {
        await api.put(`/products/${productId}`, payload);
        await api.delete(`/product-variants/product/${productId}`);
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.productId;
      }

      if (isVariant && productId) {
        for (const v of variants) {
          if (v.size && v.price && v.flavor) {
            await api.post('/product-variants', {
              product: { productId },
              size: v.size,
              price: parseFloat(v.price),
              flavorName: v.flavor,
            });
          }
        }
      }

      Toast.show({
        type: 'success',
        text1: '✅ Success',
        text2: `Product ${productId ? 'updated' : 'created'} successfully!`,
        topOffset: 40,
      });
      onSave(payload);
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      Toast.show({
        type: 'error',
        text1: '⚠️ Error',
        text2: 'Failed to save product.',
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const openCategoryModal = () => {
    setCategoryModalVisible(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const closeCategoryModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setCategoryModalVisible(false);
    });
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
          {loading && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#F59E0B" /></View>}
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{product ? 'Edit Product' : 'Add New Product'}</Text>

            {formErrors.length > 0 && (
              <View style={styles.errorContainer}>
                {formErrors.map((error, i) => (
                  <Text key={i} style={styles.errorText}>{error}</Text>
                ))}
              </View>
            )}

            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri || DEFAULT_IMAGE_URL }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#92400E" />
                <Text style={styles.uploadText}>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, formErrors.includes('Product name is required') && styles.inputError]}
              placeholder="Product Name"
              placeholderTextColor="#4B5563"
              value={name}
              onChangeText={setName}
            />

            {!isVariant && (
              <TextInput
                style={[styles.input, formErrors.includes('Price is required and must be greater than 0 for non-variant products') && styles.inputError]}
                placeholder="Price (₱)"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            )}

            <TouchableOpacity
              style={[styles.dropdownButton, !categoryId && formErrors.length > 0 && styles.inputError]}
              onPress={openCategoryModal}
            >
              <Text style={styles.dropdownText}>{categoryName}</Text>
              <Ionicons name="chevron-down" size={20} color="#92400E" />
            </TouchableOpacity>

            <Modal transparent visible={isCategoryModalVisible}>
              <View style={styles.categoryModalOverlay}>
                <Animated.View style={[styles.categoryModalContent, { opacity: fadeAnim }]}>
                  <View style={styles.categoryModalHeader}>
                    <Text style={styles.categoryModalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={closeCategoryModal}>
                      <Ionicons name="close" size={24} color="#92400E" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryItem, categoryId === String(cat.id) && styles.categoryItemSelected]}
                        onPress={() => selectCategory(cat)}
                      >
                        <Text style={styles.categoryItemText}>{cat.name}</Text>
                        {categoryId === String(cat.id) && <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </Modal>

            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Has Variants</Text>
              <TouchableOpacity
                style={[styles.checkboxBox, isVariant && styles.checkboxBoxChecked]}
                onPress={() => setIsVariant(!isVariant)}
              >
                {isVariant && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>

            {isVariant && (
              <>
                <Text style={styles.sectionHeader}>Variants & Flavors</Text>
                {variants.map((v, i) => (
                  <View key={i} style={styles.variantGroup}>
                    <TextInput
                      style={[styles.input, formErrors.includes(`Size is required for variant ${i + 1}`) && styles.inputError]}
                      placeholder="Size (e.g., 16oz)"
                      placeholderTextColor="#4B5563"
                      value={v.size}
                      onChangeText={(val) => updateVariant(i, 'size', val)}
                    />
                    <TextInput
                      style={[styles.input, formErrors.includes(`Price is required and must be greater than 0 for variant ${i + 1}`) && styles.inputError]}
                      placeholder="Price (₱)"
                      placeholderTextColor="#4B5563"
                      keyboardType="numeric"
                      value={v.price}
                      onChangeText={(val) => updateVariant(i, 'price', val)}
                    />
                    <TextInput
                      style={[styles.input, formErrors.includes(`Flavor is required for variant ${i + 1}`) && styles.inputError]}
                      placeholder="Flavor"
                      placeholderTextColor="#4B5563"
                      value={v.flavor}
                      onChangeText={(val) => updateVariant(i, 'flavor', val)}
                    />
                    {variants.length > 1 && (
                      <TouchableOpacity style={styles.removeButton} onPress={() => removeVariant(i)}>
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.addVariantButton} onPress={addVariant}>
                  <Ionicons name="add-circle-outline" size={20} color="#D97706" />
                  <Text style={styles.addVariantText}>Add Another Variant</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, formErrors.length > 0 && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={formErrors.length > 0}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF7ED',
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
    borderColor: '#F59E0B',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 4,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderColor: '#FBBF24',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
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
    borderWidth: 2,
    borderColor: '#F59E0B',
    maxHeight: '60%',
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
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FEF3C7',
  },
  categoryItemSelected: {
    backgroundColor: '#FCD34D',
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
  },
  sectionHeader: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 12,
    color: '#92400E',
  },
  variantGroup: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  addVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addVariantText: {
    color: '#D97706',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginLeft: 12,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1F2937',
  },
  saveButtonText: {
    color: '#FFF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});