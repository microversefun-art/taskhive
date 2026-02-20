import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const SubscriptionsScreen = () => {
  const subscriptions = [
    {
      id: 1,
      title: 'Доставка (ежедневно)',
      frequency: 'daily',
      discount: 15,
      savings: '₽450/месяц',
      status: 'active',
    },
    {
      id: 2,
      title: 'Курьерские услуги (еженедельно)',
      frequency: 'weekly',
      discount: 10,
      savings: '₽200/месяц',
      status: 'paused',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои подписки</Text>
        <Text style={styles.subtitle}>Управляй повторяющимися заказами</Text>
      </View>

      <View style={styles.subscriptionsList}>
        {subscriptions.map((sub) => (
          <View key={sub.id} style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View>
                <Text style={styles.subscriptionTitle}>{sub.title}</Text>
                <Text style={styles.subscriptionFrequency}>
                  {sub.frequency === 'daily'
                    ? 'Ежедневно'
                    : sub.frequency === 'weekly'
                    ? 'Еженедельно'
                    : 'Ежемесячно'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  sub.status === 'active'
                    ? styles.statusActive
                    : styles.statusPaused,
                ]}
              >
                <Text style={styles.statusText}>
                  {sub.status === 'active' ? '✓ Активна' : '⏸ Пауза'}
                </Text>
              </View>
            </View>

            <View style={styles.subscriptionDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Скидка</Text>
                <Text style={styles.detailValue}>{sub.discount}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Сэкономлено</Text>
                <Text style={styles.detailValue}>{sub.savings}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>
                  {sub.status === 'active' ? 'Пауза' : 'Возобновить'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalSavings}>
        <Text style={styles.totalSavingsLabel}>Всего сэкономлено</Text>
        <Text style={styles.totalSavingsValue}>₽650/месяц</Text>
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
  subscriptionsList: {
    padding: 16,
    gap: 12,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subscriptionFrequency: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusPaused: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  subscriptionDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  totalSavings: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  totalSavingsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalSavingsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

export default SubscriptionsScreen;
