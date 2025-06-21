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
    { name: 'Sandwiches', productCount: 12, addons: ['Cheese', 'Extra Sauce', 'Lettuce'] },
    { name: 'Drinks', productCount: 8, addons: ['Milktea Pearl', 'Nata De Coco'] },
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
    backgroundColor: '#FFFBEB', // Eggshell cream
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#78350F', // deep brown-orange
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FEF9C3', // pale yellow
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  details: {
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#F59E0B', // golden egg
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
