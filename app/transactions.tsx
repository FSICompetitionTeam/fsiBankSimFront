import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Modal } from 'react-native';
import moment from 'moment';
import { useLocalSearchParams, useFocusEffect, useRouter } from 'expo-router';
import api from '../lib/api';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from './types';

// 섹션 데이터 타입 정의
type SectionData = {
  title: string;
  data: Transaction[];
};

export default function TransactionsScreen() {
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [groupedTransactions, setGroupedTransactions] = useState<SectionData[]>([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const theme = useTheme();
  const params = useLocalSearchParams<{ account_number?: string }>();
  const router = useRouter();

  // 변경점 1: useEffect로 accountNumber 상태 설정
  useEffect(() => {
    if (params.account_number) {
      setAccountNumber(params.account_number as string);
    }
  }, [params.account_number]);

  const fetchTransactions = useCallback(async () => {
    if (!accountNumber) return;

    try {
      // 변경점 2: Promise.all로 두 API 병렬 처리
      const [transactionsResponse, accountResponse] = await Promise.all([
        api.get('/transactions/', { params: { account_number: accountNumber, limit: 20 } }),
        api.get(`/accounts/${accountNumber}`)
      ]);

      // 계좌 정보 설정
      setBalance(accountResponse.data.balance || 0);
      setBankName(accountResponse.data.bank_name || '은행');

      // 변경점 3: 거래 내역 포맷팅 및 그룹핑
      const formattedTxs = transactionsResponse.data.map((tx: Transaction) => ({
        ...tx,
        timestamp: moment(tx.timestamp).format('YYYY.MM.DD HH:mm')
      }));

      const groups = formattedTxs.reduce((acc, tx) => {
        const date = tx.timestamp.split(' ')[0]; // 'YYYY.MM.DD' 부분만 추출
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(tx);
        return acc;
      }, {} as Record<string, Transaction[]>);

      const grouped = Object.keys(groups).map((date) => ({
        title: date,
        data: groups[date],
      }));

      setGroupedTransactions(grouped);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setErrorMessage('데이터를 불러오는 데 실패했습니다. 네트워크 연결을 확인해주세요.');
      setErrorModalVisible(true);
    }
  }, [accountNumber]); // 의존성 배열 제한

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const handleDeposit = () => {
    router.push({ pathname: '/deposit', params: { from_account: accountNumber } });
  };

  const handleTransfer = () => {
    router.push({ pathname: '/transfer', params: { from_account: accountNumber } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.accountNumber}>{bankName}</Text>
        <Text style={styles.bankName}>{accountNumber || '계좌'}</Text> {/* 계좌번호 밑에 은행 이름 */}
        <Text style={styles.balance}>{balance.toLocaleString()}원</Text>
      </View>
      <SectionList
        sections={groupedTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // from_account와 현재 계좌가 같으면 출금, 아니면 입금으로 간주
          const isWithdrawal = item.from_account === accountNumber;
          const displayAccount = isWithdrawal ? item.to_account || '알 수 없음' : item.from_account || '알 수 없음';
          const displayBank = isWithdrawal ? item.to_bank_name || '알 수 없음' : item.from_bank_name || '알 수 없음';
          const displayAmount = Math.abs(item.amount).toLocaleString(); // 절대값으로 표시
          const amountColor = isWithdrawal ? theme.error : theme.accent;

          return (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionTime}>{moment(item.timestamp, 'YYYY.MM.DD HH:mm').format('HH:mm')}</Text>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>{displayAccount}</Text>
                <Text style={styles.transactionBank}>{displayBank}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: amountColor }]}>{displayAmount}원</Text>
            </View>
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
      <View style={styles.bottomButtons}>
        <TouchableOpacity onPress={handleDeposit} style={[styles.bottomButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.bottomButtonText}>채우기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTransfer} style={[styles.bottomButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.bottomButtonText}>보내기</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={errorModalVisible} animationType="fade" transparent={true}>
        <View style={styles.errorModalContainer}>
          <View style={styles.errorModalContent}>
            <Text style={styles.errorTitle}>오류</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setErrorModalVisible(false)} style={styles.errorCloseButton}>
              <Text style={styles.errorCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  accountNumber: { fontSize: 22, fontWeight: '600', marginTop: 4 },
  bankName: { fontSize: 16, color: '#8E8E93' },
  balance: { fontSize: 28, fontWeight: 'bold', color: '#0064FF', marginTop: 10 },
  sectionHeader: { fontSize: 14, fontWeight: '600', paddingVertical: 12, paddingHorizontal: 20 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  transactionTime: { fontSize: 14, color: '#8E8E93', width: 50 },
  transactionDetails: { flex: 1, marginLeft: 15 },
  transactionDescription: { fontSize: 16, fontWeight: '500' },
  transactionBank: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  bottomButton: { padding: 15, borderRadius: 12, width: '48%', alignItems: 'center' },
  bottomButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  errorModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  errorModalContent: { backgroundColor: '#FFFFFF', margin: 50, borderRadius: 20, padding: 20, alignItems: 'center' },
  errorTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  errorMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorCloseButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  errorCloseButtonText: { color: '#FFFFFF', fontSize: 18 },
});