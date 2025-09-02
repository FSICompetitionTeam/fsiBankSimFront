import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,Alert,Button } from 'react-native';
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
        { name: 'KB국민은행', code: '004' },
        { name: '우리은행', code: '020' },
        { name: 'SC제일은행', code: '023' },
        { name: '한국씨티은행', code: '027' },
        { name: 'iM뱅크', code: '031' },
        { name: '하나은행', code: '081' },
        { name: '신한은행', code: '088' },
        { name: '케이뱅크', code: '089' },
        { name: '카카오뱅크', code: '090' },
        { name: '토스뱅크', code: '092' },
        { name: 'Upbit(케이뱅크)', code: '093' },
        { name: 'Bithumb(국민은행)', code: '094' },
        { name: 'Coinone(카카오뱅크)', code: '095' },
        { name: 'Korbit(신한은행)', code: '096' },
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
              numColumns={2} // 2열로 표시, 8개까지 한 화면에 보이도록
              initialNumToRender={8} // 초기 8개 항목 렌더링
              getItemLayout={(data, index) => ({
                length: 50, // 고정 높이 50px (bankItem의 예상 높이)
                offset: 50 * Math.floor(index / 2), // 2열 기준 오프셋 계산
                index,
              })}
              style={styles.bankList} // FlatList에 스타일 적용
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
  bankList: { maxHeight: 400 }, // FlatList 높이 제한으로 스크롤 가능
  bankItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    width: '50%', // 2열 레이아웃에 맞게 너비 조정
    height: 50, // 높이 명시적으로 설정
  },
  bankIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEE', marginRight: 10 },
  bankItemText: { fontSize: 16 },
  closeButton: { padding: 15, backgroundColor: '#0064FF', borderRadius: 30, alignItems: 'center', marginTop: 20 },
  closeButtonText: { color: '#FFFFFF', fontSize: 18 },
});

export default AccountCreateScreen;