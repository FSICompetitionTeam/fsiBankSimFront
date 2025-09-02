import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Modal, FlatList, TouchableOpacity, Text } from 'react-native';
import api from '../lib/api';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Bank } from './types';

interface AccountCreateProps {}

const AccountCreateScreen: React.FC<AccountCreateProps> = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
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
      setBanks([
        { name: '한국은행', code: '001' },
        { name: 'KB국민은행(KB금융그룹 계열)', code: '004' },
        { name: '우리은행(우리금융그룹 계열)', code: '020' },
        { name: 'SC제일은행', code: '023' },
        { name: '한국씨티은행', code: '027' },
        { name: 'iM뱅크(iM금융그룹 계열)', code: '031' },
        { name: '하나은행(하나금융그룹 계열)', code: '081' },
        { name: '신한은행(신한금융지주 계열)', code: '088' },
        { name: '케이뱅크(KT 계열)', code: '089' },
        { name: '카카오뱅크(카카오 계열)', code: '090' },
        { name: '토스뱅크(비바리퍼블리카 계열)', code: '092' },
      ]);
    }
  };

  const selectBank = (bank: string) => {
    setSelectedBank(bank);
    setModalVisible(false);
  };

  const handleCreate = async () => {
    if (!selectedBank) {
      Alert.alert('오류', '은행을 선택하세요.');
      return;
    }
    try {
      await api.post('/accounts/', { bank_name: selectedBank });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('성공 (mock)', '계좌가 추가되었습니다.');
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.title}>계좌 추가</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.bankInput}>
        <Text style={styles.bankText}>{selectedBank || '은행 선택'}</Text>
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
      <Button title="추가하기" onPress={handleCreate} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
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
});

export default AccountCreateScreen;