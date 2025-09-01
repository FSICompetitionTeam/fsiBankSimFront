import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList,Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import api from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { Bank } from './types';

export default function TransferScreen() {
  const [fromAccount, setFromAccount] = useState('');
  const [fromBank, setFromBank] = useState(''); // 은행 이름 추가
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [toBank, setToBank] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const params = useLocalSearchParams<{ from_account?: string }>();
  const router = useRouter();
  const scale = useSharedValue(1);

  // 초기 데이터 로드 (useEffect로 한 번만 호출)
  useEffect(() => {
    if (params.from_account) {
      setFromAccount(params.from_account as string);
      fetchFromBank(params.from_account as string);
      fetchBanks();
    }
  }, [params.from_account]); // params.from_account 변경 시 한 번만 실행

  const fetchFromBank = useCallback(async (account_number: string) => {
    try {
      const accRes = await api.get('/accounts/' + account_number);
      setFromBank(accRes.data.bank_name || '은행');
    } catch (error) {
      console.error(error);
      setFromBank('은행');
    }
  }, []); // 의존성 없음, 초기 호출만

  const fetchBanks = useCallback(async () => {
    try {
      const response = await api.get('/banks/');
      const allBanks = [
        ...response.data.central_banks,
        ...response.data.commercial_banks,
        ...response.data.internet_banks,
      ];
      setBanks(allBanks);
    } catch (error) {
      console.error(error);
    }
  }, []); // 의존성 없음, 초기 호출만

  const appendNumber = (num: string) => {
    setAmount((prev) => prev + num);
  };

  const deleteLast = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleTransfer = async () => {
    const amt = parseInt(amount);
    if (!fromAccount || !toAccount || !toBank || isNaN(amt) || amt <= 0) {
      Alert.alert('오류', '유효한 정보를 입력하세요.');
      return;
    }
    try {
      await api.post('/transactions/transfer', { from_account: fromAccount, to_account: toAccount, amount: amt });
      router.push({ pathname: '/transfer-success', params: { amount: amt, toAccount, toBank } });
    } catch (error) {
      console.error(error);
      Alert.alert('에러', '응답이 없습니다. 네트워크를 확인하세요.');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const selectBank = (bank: string) => {
    setToBank(bank);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.message}>니 {fromBank} {fromAccount}에서 {amount ? amount : '0'}원을 옮길까요?</Text>
      <TextInput
        placeholder="입금 계좌번호"
        value={toAccount}
        onChangeText={setToAccount}
        style={styles.input}
        keyboardType="numeric"
      />
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.bankInput}>
        <Text style={styles.bankText}>{toBank || '은행 선택'}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>은행 선택</Text>
            <FlatList
              data={banks}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectBank(item.name)} style={styles.bankItem}>
                  <View style={styles.bankIcon} />
                  <Text style={styles.bankItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.code}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={styles.amount}>{amount || '0'}원</Text>
      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '<-'].map((key) => (
          <TouchableOpacity
            key={key}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => (key === '<-' ? deleteLast() : appendNumber(key))}
            style={styles.keyButton}
          >
            <Animated.View style={animatedStyle}>
              <Text style={styles.keyText}>{key}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        onPress={handleTransfer}
        style={[styles.transferButton, { backgroundColor: amount ? theme.primary : theme.gray }]}
        disabled={!amount}
      >
        <Text style={styles.transferButtonText}>옮기기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  message: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0064FF' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 10, borderRadius: 30, fontSize: 18 },
  bankInput: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 20, borderRadius: 30, fontSize: 18 },
  bankText: { color: '#8E8E93' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFFFFF', margin: 20, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  bankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  bankIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
  bankItemText: { fontSize: 16 },
  closeButton: { padding: 15, backgroundColor: '#0064FF', borderRadius: 30, alignItems: 'center', marginTop: 20 },
  closeButtonText: { color: '#FFFFFF', fontSize: 18 },
  amount: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#0064FF' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  keyButton: { width: '30%', height: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  keyText: { fontSize: 24, color: '#000' },
  transferButton: { padding: 15, borderRadius: 30, alignItems: 'center', marginTop: 20 },
  transferButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});