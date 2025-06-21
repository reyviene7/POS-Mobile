import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import productsData from '../scripts/products.json';


const defaultImage = 'https://via.placeholder.com/150';

const categoryOptions = productsData.categories.map((category) => category.name);

interface ProductVariant {
  size: string;
  price: number;
  quantity: number;
}

interface Product {
  name: string;
  category: string;
  price?: number;
  quantity?: number;
  imageUri?: string;
  variants?: ProductVariant[];
  flavors?: string[];
}

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  product?: Product;
}

export default function ProductModal({ visible, onClose, product }: ProductModalProps) {
  const [category, setCategory] = useState<string>(categoryOptions[0]);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [size, setSize] = useState<string>('16oz');
  const [flavor, setFlavor] = useState<string>('');
  const [imageUri, setImageUri] = useState<string>('');

  useEffect(() => {
    if (product) {
      setCategory(product.category);
      setName(product.name);
      setPrice(
        product.price?.toString() ??
        product.variants?.[0]?.price?.toString() ??
        ''
      );
      setQuantity(
        product.quantity?.toString() ??
        product.variants?.[0]?.quantity?.toString() ??
        ''
      );
      setSize(product.variants?.[0]?.size || '16oz');
      setFlavor(product.flavors?.[0] || '');
      setImageUri(product.imageUri || '');
    } else {
      // Reset if adding new product
      setCategory(categoryOptions[0]);
      setName('');
      setPrice('');
      setQuantity('');
      setSize('16oz');
      setFlavor('');
      setImageUri('');
    }
  }, [product, visible]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateInputs = () => {
    return name.trim() !== '' && price.trim() !== '' && quantity.trim() !== '';
  };

  const buildPayload = () => {
    const baseData = {
      name: name.trim(),
      category,
      imageUri: imageUri || defaultImage,
    };

    if (category.toLowerCase() === 'drinks') {
      return {
        ...baseData,
        variants: [{
          size,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        }],
        ...(flavor.trim() && { flavors: [flavor.trim()] }),
      };
    } else {
      return {
        ...baseData,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      };
    }
  };

  const handleSave = () => {
    if (!validateInputs()) {
      Alert.alert('Validation Error', 'Please fill out all required fields');
      return;
    }

    const payload = buildPayload();

    console.log('Product to be saved:', payload);

    Alert.alert('Product saved!');
    onClose();
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.form}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 24,
          color: '#D97706',
        }}>
          {product ? 'Edit Product' : 'Add New Product'}
        </Text>

        <Text style={styles.label}>Category</Text>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
          {categoryOptions.map((cat) => (
            <Picker.Item label={cat} value={cat} key={cat} />
          ))}
        </Picker>

        <Text style={styles.label}>Product Name</Text>
        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          placeholder="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
        />

        {category.toLowerCase() === 'drinks' && (
          <>
            <Text style={styles.label}>Size</Text>
            <Picker selectedValue={size} onValueChange={setSize} style={styles.picker}>
              <Picker.Item label="16oz" value="16oz" />
              <Picker.Item label="22oz" value="22oz" />
            </Picker>

            <Text style={styles.label}>Flavor (Optional)</Text>
            <TextInput
              placeholder="Enter custom flavor"
              value={flavor}
              onChangeText={setFlavor}
              style={styles.input}
            />
          </>
        )}

        <Text style={styles.label}>Product Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={{ fontWeight: 'bold', color: '#78350F' }}>📸 Select Image</Text>
        </TouchableOpacity>
        <Image source={{ uri: imageUri || defaultImage }} style={styles.image} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#E5E7EB' }]} onPress={onClose}>
          <Text style={[styles.saveButtonText, { color: '#111827' }]}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // Warm egg background
    padding: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#CA8A04', // Darker egg yellow
  },
  input: {
    backgroundColor: '#FFFBEB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FACC15',
    color: '#78350F',
  },
  imagePicker: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FDE68A',
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
