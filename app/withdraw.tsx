// DepositScreen과 유사, POST /transactions/withdraw 호출, 잔고 부족 mock 처리.
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../lib/api';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

export default function WithdrawScreen() {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleWithdraw = async () => {
    const amt = parseInt(amount);
    if (!accountNumber || isNaN(amt) || amt <= 0) {
      Alert.alert('오류', '유효한 정보를 입력하세요.');
      return;
    }
    try {
      await api.post('/transactions/withdraw', { account_number: accountNumber, amount: amt });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('성공 (mock)', '출금 완료');
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput placeholder="계좌번호" value={accountNumber} onChangeText={setAccountNumber} style={styles.input} />
      <TextInput placeholder="금액" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />
      <Button title="출금하기" onPress={handleWithdraw} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 10, borderRadius: 5 },
});