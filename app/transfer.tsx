import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import api from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { Bank } from './types';

export default function TransferScreen() {
  const [fromAccount, setFromAccount] = useState('');
  const [fromBank, setFromBank] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [toBank, setToBank] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const theme = useTheme();
  const params = useLocalSearchParams<{ from_account?: string }>();
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    console.log('Params:', params);
    if (params.from_account) {
      setFromAccount(params.from_account as string);
      fetchFromBank(params.from_account as string);
      fetchBanks();
    }
  }, [params.from_account]);

  const fetchFromBank = useCallback(async (account_number: string) => {
    try {
      const accRes = await api.get('/accounts/' + account_number);
      setFromBank(accRes.data.bank_name || '은행');
    } catch (error) {
      console.error(error);
      setFromBank('은행');
    }
  }, []);

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
  }, []);

  const appendNumber = (num: string) => {
    setAmount((prev) => prev + num);
  };

  const deleteLast = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const showCustomModal = (message: string) => {
    setModalMessage(message);
    setCustomModalVisible(true);
  };

  const handleTransfer = async () => {
    const amt = parseInt(amount) || 0;
    console.log('Validating transfer:', { fromAccount, toAccount, toBank, amount: amt });

    if (!fromAccount || fromAccount.trim() === '') {
      console.log('fromAccount validation failed');
      showCustomModal('출금 계좌번호를 확인하세요.');
      return;
    }
    if (!toAccount || toAccount.trim() === '') {
      console.log('toAccount validation failed');
      showCustomModal('입금 계좌번호를 입력하세요.');
      return;
    }
    if (!toBank || toBank.trim() === '' || toBank === '은행 선택') {
      console.log('toBank validation failed');
      showCustomModal('입금 은행을 선택하세요.');
      return;
    }
    if (amt <= 0) {
      console.log('amount validation failed');
      showCustomModal('유효한 금액을 입력하세요.');
      return;
    }

    console.log('Sending transfer request:', { from_account: fromAccount, to_account: toAccount, amount: amt });
    try {
      const response = await api.post('/transactions/transfer', { from_account: fromAccount, to_account: toAccount, amount: amt });
      router.push({ pathname: '/transfer-success', params: { amount: amt, toAccount, toBank } });
    } catch (error: any) {
      console.error('Transfer error:', error);
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.detail === "Insufficient balance") {
          showCustomModal('잔액이 부족합니다.');
        } else if (errorData && errorData.detail) {
          showCustomModal(errorData.detail);
        } else {
          showCustomModal('응답이 없습니다. 네트워크를 확인하세요.');
        }
      } else {
        showCustomModal('알 수 없는 오류가 발생했습니다.');
      }
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
      <Text style={styles.message}><Text style={styles.accountText}>{fromBank} {fromAccount}</Text>에서 {amount ? amount : '0'}원을 옮길까요?</Text>
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
      {}
      <Modal
        visible={customModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.customModalContainer}>
          <View style={styles.customModalContent}>
            <Text style={styles.customModalTitle}>알림</Text>
            <Text style={styles.customModalMessage}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setCustomModalVisible(false)} style={styles.customModalButton}>
              <Text style={styles.customModalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  message: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#0064FF' },
  accountText: { fontWeight: 'normal' },
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
  customModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  customModalContent: { backgroundColor: '#FFFFFF', margin: 50, borderRadius: 20, padding: 20, alignItems: 'center' },
  customModalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  customModalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  customModalButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  customModalButtonText: { color: '#FFFFFF', fontSize: 18 },
});