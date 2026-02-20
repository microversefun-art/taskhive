import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const AchievementsScreen = () => {
  const achievements = [
    { id: 1, name: 'Первая работа', emoji: '🎯', unlocked: true },
    { id: 2, name: 'Серия из 5 работ', emoji: '🔥', unlocked: false },
    { id: 3, name: '₽5000 заработано', emoji: '💰', unlocked: false },
    { id: 4, name: '5 звёзд рейтинг', emoji: '⭐', unlocked: false },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <Text style={styles.subtitle}>Разблокируй новые достижения</Text>
      </View>

      <View style={styles.achievementsList}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementCardLocked,
            ]}
          >
            <Text style={styles.emoji}>{achievement.emoji}</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementStatus}>
                {achievement.unlocked ? '✅ Разблокировано' : '🔒 Заблокировано'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  achievementsList: {
    padding: 16,
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  achievementCardLocked: {
    opacity: 0.5,
    borderColor: '#e5e7eb',
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  achievementStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default AchievementsScreen;
