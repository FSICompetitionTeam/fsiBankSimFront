import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface TransactionItemProps {
  fromAccount: string;
  toAccount: string;
  amount: number;
  timestamp: string;
  fromBank: string;
  toBank: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ fromAccount, toAccount, amount, timestamp, fromBank, toBank }) => {
  const theme = useTheme();

  return (
    <View style={styles.item}>
      <Text style={styles.description}>{fromAccount} ({fromBank}) → {toAccount} ({toBank})</Text>
      <Text style={[styles.amount, { color: amount > 0 ? theme.accent : theme.error }]}>{amount}원</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  item: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  description: { fontSize: 16 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  timestamp: { fontSize: 12, color: '#8E8E93' },
});

export default TransactionItem;