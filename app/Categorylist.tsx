import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import productsData from '../src/scripts/products.json';

// Get the screen width for calculating grid item width
const screenWidth = Dimensions.get('window').width;

// Define the category type
type CategoryItem = {
  name: string;
  productCount: number;
  addons: string[];
};

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [listFilterCategory, setListFilterCategory] = useState<string>('All');
  const [gridFilterCategory, setGridFilterCategory] = useState<string>('All');

  // Load categories from products.json
  useEffect(() => {
    const loadedCategories: CategoryItem[] = productsData.categories.map((category) => ({
      name: category.name,
      productCount: category.products.length,
      addons: category.addons || [],
    }));
    setCategories(loadedCategories);
  }, []);

  // Get unique category names for the filter (though this might be less useful here)
  const categoryNames = ['All', ...categories.map((item) => item.name)];

  // Filter categories for List View
  const filteredListCategories =
    listFilterCategory === 'All'
      ? categories
      : categories.filter((category) => category.name === listFilterCategory);

  // Filter categories for Grid View
  const filteredGridCategories =
    gridFilterCategory === 'All'
      ? categories
      : categories.filter((category) => category.name === gridFilterCategory);

  const renderListView = () => (
    <>
      {/* Category Filter for List View */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={listFilterCategory}
          onValueChange={(itemValue) => setListFilterCategory(itemValue)}
          style={styles.filterPicker}>
          {categoryNames.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredListCategories}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.details}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryDetails}>
                Products: {item.productCount}
              </Text>
              <Text style={styles.categoryAddons}>
                Add-ons: {item.addons.length > 0 ? item.addons.join(', ') : 'None'}
              </Text>
            </View>
          </View>
        )}
      />
    </>
  );

  const renderGridView = () => (
    <>
      {/* Category Filter for Grid View */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Category:</Text>
        <Picker
          selectedValue={gridFilterCategory}
          onValueChange={(itemValue) => setGridFilterCategory(itemValue)}
          style={styles.filterPicker}>
          {categoryNames.map((category) => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredGridCategories}
        keyExtractor={(item) => item.name}
        numColumns={2} // Using 2 columns for categories since they’re fewer
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <View style={styles.gridCard}>
            <View style={styles.gridDetails}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryDetails}>
                Products: {item.productCount}
              </Text>
              <Text style={styles.categoryAddons}>
                Add-ons: {item.addons.length > 0 ? item.addons.join(', ') : 'None'}
              </Text>
            </View>
          </View>
        )}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* View Mode Selection */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
          onPress={() => setViewMode('list')}>
          <Text style={styles.viewModeText}>List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
          onPress={() => setViewMode('grid')}>
          <Text style={styles.viewModeText}>Grid</Text>
        </TouchableOpacity>
      </View>

      {/* Render Selected View */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'grid' && renderGridView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // Match ProductList background
    padding: 16,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  activeViewMode: {
    backgroundColor: '#6366F1', // Match ProductList active view mode
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  gridContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff', // Match ProductList card background
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
  },
  gridCard: {
    width: (screenWidth - 36 - 12) / 2, // 2 columns for categories
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  gridDetails: {
    padding: 8,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Match ProductList main text
  },
  categoryDetails: {
    fontSize: 12,
    color: '#6B7280', // Match ProductList secondary text
    marginTop: 4,
  },
  categoryAddons: {
    fontSize: 12,
    color: '#374151', // Match ProductList details text
    marginTop: 4,
  },
});