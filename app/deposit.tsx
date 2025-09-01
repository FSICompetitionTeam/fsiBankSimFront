import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../lib/api';
import { useTheme } from '../hooks/useTheme';

export default function DepositScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const theme = useTheme();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.from_account) {
      setAccountNumber(params.from_account as string);
    }
  }, [params]);

  const handleDeposit = async () => {
    const amt = parseInt(amount);
    if (!accountNumber || isNaN(amt) || amt <= 0) {
      Alert.alert('오류', '유효한 정보를 입력하세요.');
      return;
    }
    try {
      await api.post('/transactions/deposit', { account_number: accountNumber, amount: amt });
      Alert.alert('성공', '입금 완료');
      setAmount('');
    } catch (error) {
      console.error(error);
      Alert.alert('에러', '응답이 없습니다. 네트워크를 확인하세요.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.title}>입금</Text>
      <TextInput placeholder="계좌번호" value={accountNumber} onChangeText={setAccountNumber} style={styles.input} />
      <TextInput placeholder="금액" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
      <Button title="입금하기" onPress={handleDeposit} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 10, borderRadius: 5 },
});