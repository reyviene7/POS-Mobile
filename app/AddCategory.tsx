import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

// Mock of existing categories from products.json
const existingCategories = [
  { name: 'Sandwiches', products: [] },
  { name: 'Drinks', products: [] },
];

export default function AddCategory() {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState('');

  const handleSave = () => {
    // Validation: Check if the category name is empty
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Validation: Check if the category already exists
    const categoryExists = existingCategories.some(
      (cat) => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
    );
    if (categoryExists) {
      Alert.alert('Error', 'Category already exists');
      return;
    }

    // Create the new category payload
    const newCategory = {
      name: categoryName.trim(),
      products: [], // Initialize with an empty products array
    };

    // Log the new category (in a real app, this would be saved to products.json)
    console.log('New category:', newCategory);
    Alert.alert('Success', 'Category added successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.form}>
        {/* Category Name Input */}
        <Text style={styles.label}>Category Name</Text>
        <TextInput
          placeholder="e.g., Snacks"
          value={categoryName}
          onChangeText={setCategoryName}
          style={styles.input}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add Category</Text>
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