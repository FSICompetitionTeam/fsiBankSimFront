import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CardProps {
  title: string;
  subtitle: string;
  balance?: number;
  onPress: () => void;
  onSendPress: () => void;
}

const Card: React.FC<CardProps> = ({ title, subtitle, balance, onPress, onSendPress }) => {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {balance !== undefined && <Text style={[styles.balance, { color: theme.primary }]}>{balance}원</Text>}
      </View>
      <TouchableOpacity onPress={onSendPress} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>송금</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 10, 
    marginVertical: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5,
    elevation: 3,
  },
  content: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#8E8E93' },
  balance: { fontSize: 24, fontWeight: 'bold' },
  sendButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
  sendButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});

export default Card;