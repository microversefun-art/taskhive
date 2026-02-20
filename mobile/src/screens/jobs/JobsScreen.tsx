import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../../services/trpc';

interface Job {
  id: string;
  title: string;
  description: string;
  salary: number;
  category: string;
  createdAt: Date;
}

const CATEGORIES = [
  { id: 'all', name: 'Все' },
  { id: 'delivery', name: '🚚 Доставка' },
  { id: 'retail', name: '🛍️ Ритейл' },
  { id: 'warehouse', name: '📦 Склад' },
  { id: 'courier', name: '🚴 Курьер' },
  { id: 'other', name: '⭐ Прочее' },
];

const JobsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      try {
        let query: any = {
          limit: 50,
          offset: 0,
        };

        if (selectedCategory !== 'all') {
          query.category = selectedCategory;
        }

        if (searchQuery) {
          query.search = searchQuery;
        }

        if (sortBy === 'salary') {
          query.sortBy = 'salary';
        } else if (sortBy === 'rating') {
          query.sortBy = 'rating';
        }

        return await trpcClient.jobs.list.query(query);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }
    },
  });

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.jobCategory}>{item.category}</Text>
        </View>
        <Text style={styles.jobSalary}>₽{item.salary.toLocaleString()}</Text>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Откликнуться</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск вакансий..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortSection}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'newest' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('newest')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'newest' && styles.sortButtonTextActive,
            ]}
          >
            Новые
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'salary' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('salary')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'salary' && styles.sortButtonTextActive,
            ]}
          >
            По зарплате
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'rating' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('rating')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'rating' && styles.sortButtonTextActive,
            ]}
          >
            По рейтингу
          </Text>
        </TouchableOpacity>
      </View>

      {/* Jobs List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : jobs && jobs.length > 0 ? (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Нет вакансий по вашему запросу</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  categoriesScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  sortSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  jobsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 12,
    color: '#9ca3af',
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginLeft: 8,
  },
  jobDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

export default JobsScreen;
