import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { trpcClient } from '../../services/trpc';
import { useAuthStore } from '../../store/authStore';

interface Job {
  id: string;
  title: string;
  description: string;
  salary: number;
  category: string;
  createdAt: Date;
}

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();

  // Fetch hot jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', 'hot'],
    queryFn: async () => {
      try {
        return await trpcClient.jobs.list.query({
          limit: 5,
          offset: 0,
        });
      } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }
    },
  });

  // Fetch achievements
  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      try {
        return await trpcClient.achievements.getUserAchievements.query({
          userId: user.id,
        });
      } catch (error) {
        console.error('Error fetching achievements:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.jobSalary}>₽{item.salary.toLocaleString()}</Text>
      </View>
      <Text style={styles.jobCategory}>{item.category}</Text>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          Привет, {user?.name || 'пользователь'}! 👋
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Найди подходящую работу и начни зарабатывать
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₽0</Text>
          <Text style={styles.statLabel}>Заработано</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Работ выполнено</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.rating || 0}</Text>
          <Text style={styles.statLabel}>Рейтинг</Text>
        </View>
      </View>

      {/* Achievements Section */}
      {achievements && (
        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Достижения</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.seeAll}>Все</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.achievementsList}>
            {achievements.slice(0, 3).map((achievement: any) => (
              <View key={achievement.id} style={styles.achievementBadge}>
                <Text style={styles.badgeEmoji}>🏆</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hot Jobs Section */}
      <View style={styles.jobsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Горячие вакансии</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Jobs')}
          >
            <Text style={styles.seeAll}>Все</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : jobs && jobs.length > 0 ? (
          <FlatList
            data={jobs}
            renderItem={renderJobCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>Нет доступных вакансий</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Subscriptions')}
        >
          <Text style={styles.actionButtonText}>📅 Мои подписки</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.actionButtonText}>💬 Чаты</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  welcomeSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  achievementsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  achievementsList: {
    flexDirection: 'row',
    gap: 12,
  },
  achievementBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  jobsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  jobCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  jobCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;
