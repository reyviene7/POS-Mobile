// screens/CategoryList.tsx
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CategoryModal from '../src/components/CategoryModal';

type CategoryItem = {
  name: string;
  productCount: number;
  addons: string[];
};

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { name: 'Burgers', productCount: 12, addons: ['Cheese', 'Bacon'] },
    { name: 'Drinks', productCount: 8, addons: ['Ice', 'Lemon'] },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleSaveCategory = (updated: { name: string; addons: string[] }) => {
    if (editingCategory) {
      // Edit mode
      setCategories((prev) =>
        prev.map((cat) =>
          cat.name === editingCategory.name
            ? { ...cat, name: updated.name, addons: updated.addons }
            : cat
        )
      );
    } else {
      // Add mode
      setCategories((prev) => [
        ...prev,
        { name: updated.name, addons: updated.addons, productCount: 0 },
      ]);
    }

    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity onPress={() => handleEdit(item)}>
      <View style={styles.card}>
        <View style={styles.details}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.categoryDetails}>Products: {item.productCount}</Text>
          <Text style={styles.categoryAddons}>
            Add-ons: {item.addons.length > 0 ? item.addons.join(', ') : 'None'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Category List</Text>
      <FlatList
        data={categories}
        keyExtractor={(item, index) => `${item.name}-${index}`}
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
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  details: {
    flexDirection: 'column',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryAddons: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6366F1',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});