import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../api';
import CategoryModal from '../src/components/modals/CategoryModal';

type CategoryItem = {
  id: number;
  name: string;
  addons: string[];
};

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch categories with add-ons
      const categoriesResponse = await api.get('/categories/with-addons');
      const categoriesData = categoriesResponse.data;
      console.log('Fetched categories:', categoriesData);

      // Fetch products to calculate productCount
      let products = [];
      try {
        const productsResponse = await api.get('/products/with-price');
        products = productsResponse.data;
        console.log('Fetched products:', products);
      } catch (productErr) {
        console.warn('Error fetching products:', productErr);
        // Continue without products if endpoint fails
      }

      // Group add-ons by categoryId and calculate productCount
      const categoryMap = new Map<number, { name: string; addons: string[] }>();
      categoriesData.forEach((item: any) => {
        const categoryId = item.categoryId;
        const categoryName = item.categoryName;
        const addonName = item.addonName || '';

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, { name: categoryName, addons: [] });
        }
        if (addonName) {
          categoryMap.get(categoryId)!.addons.push(addonName);
        }
      });

      // Calculate productCount per category
      const categoryItems: CategoryItem[] = Array.from(categoryMap.entries()).map(
        ([id, { name, addons }]) => ({
          id,
          name,
          addons,
          productCount: products.filter((p: any) => p.categoryId === id).length,
        })
      );

      setCategories(categoryItems);
    } catch (err: any) {
      console.error('Error fetching categories:', err.message, err.response?.data);
      setError('Failed to load categories. Please check the server logs for details.');
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await api.delete(`/categories/${id}`);
            Alert.alert('Success', 'Category deleted successfully!');
            fetchCategories();
          } catch (err) {
            console.error('Error deleting category:', err);
            Alert.alert('Error', 'Failed to delete category. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSaveCategory = async (updated: { name: string; addonIds: number[] }) => {
    setLoading(true);
    try {
      let categoryId: number;
      if (editingCategory) {
        // Update existing category
        const response = await api.put(`/categories/${editingCategory.id}`, {
          categoryName: updated.name,
        });
        categoryId = editingCategory.id;
      } else {
        // Create new category
        const response = await api.post('/categories', {
          categoryName: updated.name,
        });
        categoryId = response.data.categoryId;
      }

      // Fetch existing category add-ons
      const existingAddonsResponse = await api.get('/category-addons');
      const existingAddons = existingAddonsResponse.data.filter(
        (ca: any) => ca.category.categoryId === categoryId
      );

      // Delete old add-ons
      for (const addon of existingAddons) {
        await api.delete(`/category-addons/${addon.id}`);
      }

      // Create new category add-ons
      for (const addonId of updated.addonIds) {
        await api.post('/category-addons', {
          category: { categoryId },
          addon: { addonId },
        });
      }

      Alert.alert('Success', `Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      fetchCategories();
      setModalVisible(false);
    } catch (err) {
      console.error('Error saving category:', err);
      Alert.alert('Error', 'Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => handleEdit(item)}>
        <View style={styles.details}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryAddons}>
            Add-ons: {item.addons.length > 0 ? item.addons.join(', ') : 'None'}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Ionicons name="trash" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={styles.title}>Category List</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Text style={styles.fabText}>+ Add Category</Text>
      </TouchableOpacity>
      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFBEB',
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
    marginBottom: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#78350F',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FEF9C3',
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    flexDirection: 'column',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDetails: {
    fontSize: 14,
    color: '#4B5563',
  },
  categoryAddons: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  deleteButton: {
    right: -90,
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#F59E0B',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});