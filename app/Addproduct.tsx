import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

const defaultImage = 'https://via.placeholder.com/150'; // Fallback image

// Define types for categoryData (only for type checking, no addons)
interface SandwichCategory {
  addons?: never; // Explicitly mark as unused
}

interface DrinkCategory {
  addons?: never; // Explicitly mark as unused
  flavors?: never; // No flavors predefined, user inputs custom
}

interface CategoryData {
  Sandwiches: SandwichCategory;
  Drinks: DrinkCategory;
}

const categoryData: CategoryData = {
  Sandwiches: {},
  Drinks: {},
};

export default function AddProduct() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<'Sandwiches' | 'Drinks'>('Sandwiches');
  const [imageUri, setImageUri] = useState('');
  const [flavor, setFlavor] = useState('');
  const [size, setSize] = useState('16oz');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name || !price || !quantity) {
      Alert.alert('Please fill out all required fields');
      return;
    }

    // Create the product payload based on category
    let payload;
    if (category === 'Sandwiches') {
      payload = {
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      };
    } else {
      // For Drinks, create a variants array
      const variants = [
        {
          size,
          price: parseFloat(price),
          quantity: parseInt(quantity),
        },
      ];
      payload = {
        name,
        variants,
        ...(flavor && { flavors: [flavor] }), // Include flavor only if provided
      };
    }

    console.log('Saving product:', payload);
    Alert.alert('Product Saved!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.form}>
        {/* Category Selection */}
        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue: 'Sandwiches' | 'Drinks') => setCategory(itemValue)}
          style={styles.picker}>
          <Picker.Item label="Sandwiches" value="Sandwiches" />
          <Picker.Item label="Drinks" value="Drinks" />
        </Picker>

        {/* Product Name */}
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* Price */}
        <Text style={styles.label}>Price</Text>
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Quantity */}
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          placeholder="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Size (only for Drinks) */}
        {category === 'Drinks' && (
          <>
            <Text style={styles.label}>Size</Text>
            <Picker selectedValue={size} onValueChange={setSize} style={styles.picker}>
              <Picker.Item label="16oz" value="16oz" />
              <Picker.Item label="22oz" value="22oz" />
            </Picker>
          </>
        )}

        {/* Flavor (Optional blank input) */}
        {category === 'Drinks' && (
          <>
            <Text style={styles.label}>Flavor (Optional)</Text>
            <TextInput
              placeholder="Enter custom flavor"
              value={flavor}
              onChangeText={setFlavor}
              style={styles.input}
            />
          </>
        )}

        {/* Product Image */}
        <Text style={styles.label}>Product Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text>Select Image</Text>
        </TouchableOpacity>
        <Image
          source={{ uri: imageUri || defaultImage }}
          style={styles.image}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
    color: '#4338CA',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  picker: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imagePicker: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#DDD',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});