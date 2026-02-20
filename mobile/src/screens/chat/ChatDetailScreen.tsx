import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatDetailScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Экран чата (в разработке)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  text: { fontSize: 14, color: '#6b7280' },
});

export default ChatDetailScreen;
