import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';
import CategoryModal from '../src/components/modals/CategoryModal';
import DeleteModal from '../src/components/modals/DeleteModal';


type CategoryItem = {
  id: number;
  name: string;
  addons: string[];
};

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownInitialToast, setHasShownInitialToast] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriesResponse = await api.get('/categories/with-addons');
      const categoriesData = categoriesResponse.data;
      console.log('Fetched categories:', categoriesData);

      let products = [];
      try {
        const productsResponse = await api.get('/products/with-price');
        products = productsResponse.data;
      } catch {
        Toast.show({
          type: 'error',
          text1: '🍞😣 Oh No!',
          text2: 'Failed to load products.',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      }

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

      const categoryItems: CategoryItem[] = Array.from(categoryMap.entries()).map(
        ([id, { name, addons }]) => ({
          id,
          name,
          addons,
          productCount: products.filter((p: any) => p.categoryId === id).length,
        })
      );

      if (!hasShownInitialToast) {
        Toast.show({
          type: 'success',
          text1: '🥪 Freshly Baked!',
          text2: 'Categories loaded successfully!',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        setHasShownInitialToast(true);
      }
      setCategories(categoryItems);
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oh No!',
        text2: 'Failed to load category list.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(undefined);
    setModalVisible(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete === null) return;

    setLoading(true);
    setDeleteModalVisible(false);
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Category removed successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchCategories();
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to delete category.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
    } finally {
      setLoading(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async (updated: { name: string; addonIds: number[] }) => {
    setLoading(true);
    try {
      let categoryId: number;
      if (editingCategory) {
        const response = await api.put(`/categories/${editingCategory.id}`, {
          categoryName: updated.name,
        });
        categoryId = editingCategory.id;
      } else {
        const response = await api.post('/categories', {
          categoryName: updated.name,
        });
        categoryId = response.data.categoryId;
      }

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
      Toast.show({
        type: 'success',
        text1: '🥪 Yum!',
        text2: 'Category saved successfully!',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      fetchCategories();
      setModalVisible(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Failed to save category.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
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
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
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
      <Text style={styles.title}>🥙 Flavor Files</Text>
      <Text style={styles.subtitle}>
        Craft your sandwich story with tasty categories!
      </Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: hp('12%') }}
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
      <DeleteModal
        visible={deleteModalVisible}
        itemType="category"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCategoryToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    padding: wp('4%'),
    paddingTop: hp('6%'),
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
    fontSize: wp('7%'),
    fontWeight: '800',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: hp('4%'),
  },
  card: {
    backgroundColor: '#FEF9C3',
    padding: wp('4%'),
    marginBottom: hp('1.5%'),
    marginHorizontal: wp('2%'),
    borderRadius: wp('4%'),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
  },
  details: {
    flex: 1,
    flexDirection: 'column',
  },
  categoryName: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp('0.5%'),
  },
  categoryAddons: {
    fontSize: wp('3.3%'),
    color: '#6B7280',
    marginTop: hp('0.5%'),
  },
  deleteButton: {
    padding: wp('2%'),
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    right: wp('5%'),
    bottom: hp('3%'),
    backgroundColor: '#F59E0B',
    borderRadius: wp('8%'),
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: '#FFF',
    fontSize: wp('3.8%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});