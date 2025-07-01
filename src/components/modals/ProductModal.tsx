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
  const [categoryName, setCategoryName] = useState('Select Category');
  const [isVariant, setIsVariant] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([{ size: '', price: '', quantity: '' }]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const isFormInvalid = !name || !categoryId || (!isVariant && (!price || isNaN(+price)));

  const DEFAULT_IMAGE_URL = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750703171/EggCited/duaybsrpbbbbioafm3yo.jpg';

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get('/categories');
        const catList = res.data.map((cat: any) => ({
          id: cat.categoryId,
          name: cat.categoryName,
        }));
        setCategories(catList);

        if (product?.categoryId) {
          const matched = catList.find((c: Category) => c.id === product.categoryId);
          if (matched) {
            setCategoryId(String(matched.id));
            setCategoryName(matched.name);
          }
        }
      } catch {
        Toast.show({ type: 'error', text1: '⚠️ Error', text2: 'Failed to load categories.', topOffset: 40 });
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

      if (product.isVariant && product.id) {
        api.get(`/product-variants/product/${product.id}`).then(res => {
          const variantList = res.data.map((v: any) => ({
            size: v.size || '',
            price: v.price.toString() || '',
            quantity: v.quantity.toString() || '0',
          }));
          setVariants(variantList.length > 0 ? variantList : [{ size: '', price: '', quantity: '' }]);
        });
      } else {
        setVariants([{ size: '', price: '', quantity: '' }]);
      }

      // Match and show selected category
      if (product.categoryId && categories.length > 0) {
        const matched = categories.find(c => c.id === product.categoryId);
        if (matched) {
          setCategoryId(String(matched.id));
          setCategoryName(matched.name);
        }
      }
    } else {
      setName('');
      setPrice('');
      setIsVariant(false);
      setImageUri(null);
      setVariants([{ size: '', price: '', quantity: '' }]);
      setCategoryId('');
      setCategoryName('Select Category');
    }
  }, [product, categories]);


  const validateForm = () => {
    if (!name.trim()) return 'Product name is required.';
    if (!categoryId) return 'Category is required.';
    if (!isVariant && (!price.trim() || isNaN(+price))) return 'Valid price is required.';
    if (isVariant) {
      for (const v of variants) {
        if (!v.size || !v.price || isNaN(+v.price)) return 'All variants must have size and valid price.';
      }
    }
    return null;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets.length > 0) setImageUri(result.assets[0].uri);
  };

  const addVariant = () => setVariants([...variants, { size: '', price: '', quantity: '' }]);

  const updateVariant = (index: number, key: keyof Variant, value: string) => {
    const copy = [...variants];
    copy[index][key] = value;
    setVariants(copy);
  };

  const handleSubmit = async () => {
    const errorMsg = validateForm();
    if (errorMsg) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: errorMsg, topOffset: 40 });
      return;
    }

    setLoading(true);
    try {
      let uploadedImage = imageUri || DEFAULT_IMAGE_URL;

      if (
        uploadedImage &&
        !uploadedImage.startsWith('https://') && // only upload if local
        uploadedImage !== DEFAULT_IMAGE_URL // don't re-upload default
      ) {
        uploadedImage = await uploadToCloudinary(uploadedImage);
      }

      const payload = {
        productName: name.trim(),
        categoryId: parseInt(categoryId),
        isVariant,
        price: isVariant ? 0 : parseFloat(price),
        image: uploadedImage,
        size: isVariant ? null : variants[0]?.size,
        flavorName: isVariant ? null : variants[0]?.quantity,
      };

      let productId = product?.id;

      if (productId) {
        await api.put(`/products/${productId}`, payload);
      } else {
        const res = await api.post('/products', payload);
        productId = res.data.productId;
      }

      if (isVariant && productId) {
        for (const v of variants) {
          await api.post('/product-variants', {
            product: { productId },
            size: v.size,
            price: parseFloat(v.price),
            quantity: parseInt(v.quantity) || 0,
          });
        }
      }

      Toast.show({ type: 'success', text1: '✅ Product Saved', text2: 'Product saved successfully!', topOffset: 40 });
      onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      Toast.show({ type: 'error', text1: '⚠️ Error', text2: 'Failed to save product.', topOffset: 40 });
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
          <ScrollView>
            <Text style={styles.title}>{product ? 'Edit Product' : 'Add Product'}</Text>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Text style={styles.uploadText}>{imageUri ? 'Replace Image' : 'Upload Image'}</Text>
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
            {!isVariant && (
              <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />
            )}

            <TouchableOpacity style={styles.dropdownButton} onPress={openCategoryModal}>
              <Text style={styles.dropdownText}>{categoryName}</Text>
              <Ionicons name="chevron-down" size={20} color="#92400E" />
            </TouchableOpacity>

            <Modal transparent visible={isCategoryModalVisible}>
              <View style={styles.categoryModalOverlay}>
                <Animated.View style={[styles.categoryModalContent, { opacity: fadeAnim }]}>
                  <View style={styles.categoryModalHeader}>
                    <Text style={styles.categoryModalTitle}>🥪 Choose Category</Text>
                    <TouchableOpacity onPress={closeCategoryModal}><Ionicons name="close" size={24} color="#92400E" /></TouchableOpacity>
                  </View>
                  <ScrollView>
                    {categories.map((cat) => (
                      <TouchableOpacity key={cat.id} style={styles.categoryItem} onPress={() => selectCategory(cat)}>
                        <Text style={styles.categoryItemText}>{cat.name}</Text>
                        {categoryId === String(cat.id) && <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </Modal>

            <View style={styles.checkboxContainer}>
              <Text style={styles.checkboxLabel}>Has Variant</Text>
              <TouchableOpacity style={[styles.checkboxBox, isVariant && styles.checkboxBoxChecked]} onPress={() => setIsVariant(!isVariant)}>
                {isVariant && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>

            {isVariant && variants.map((v, idx) => (
              <View key={idx} style={styles.variantGroup}>
                <TextInput
                  placeholder="Size"
                  style={styles.input}
                  value={v.size}
                  onChangeText={(val) => updateVariant(idx, 'size', val)}
                />
                <TextInput
                  placeholder="Price"
                  style={styles.input}
                  keyboardType="numeric"
                  value={v.price}
                  onChangeText={(val) => updateVariant(idx, 'price', val)}
                />
                <TextInput
                  placeholder="Quantity"
                  style={styles.input}
                  keyboardType="numeric"
                  value={v.quantity}
                  onChangeText={(val) => updateVariant(idx, 'quantity', val)}
                />

                {variants.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      const newVariants = [...variants];
                      newVariants.splice(idx, 1);
                      setVariants(newVariants);
                    }}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {isVariant && <TouchableOpacity onPress={addVariant}><Text style={{ color: '#D97706', marginBottom: 16 }}>+ Add another variant</Text></TouchableOpacity>}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, isFormInvalid && { opacity: 0.5 }]}
                onPress={handleSubmit}
                disabled={isFormInvalid}
              >
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
  overlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 24 },
  modalContent: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderColor: '#F59E0B',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#D97706', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#FFF', borderColor: '#FCD34D', borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 16 },
  uploadButton: {
    backgroundColor: '#FCD34D',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#92400E' },
  imagePreview: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderColor: '#FBBF24',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdownText: { fontSize: 16, color: '#92400E', fontWeight: '600' },
  categoryModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  categoryModalContent: { backgroundColor: '#FFFBEB', borderRadius: 20, padding: 20, width: '80%', borderWidth: 2, borderColor: '#F59E0B' },
  categoryModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryModalTitle: { fontSize: 20, fontWeight: '700', color: '#D97706' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: '#FDE68A' },
  categoryItemText: { fontSize: 16, fontWeight: '600', color: '#92400E' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginRight: 12 },
  checkboxBox: { width: 24, height: 24, borderWidth: 2, borderColor: '#D97706', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxBoxChecked: { backgroundColor: '#D97706' },
  variantGroup: { marginBottom: 12 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginLeft: 10,
  },
  buttonText: { fontWeight: '700', fontSize: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.7)', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', textAlign: 'center', marginBottom: 12, fontSize: 16 },
  removeButton: {
    marginTop: 6,
    alignSelf: 'flex-end',
    backgroundColor: '#F87171',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
