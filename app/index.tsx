import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import api from '../lib/api';
import Card from '../components/Card';
import TransactionItem from '../components/TransactionItem';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Account, Transaction } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HomeProps {}

const HomeScreen: React.FC<HomeProps> = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const theme = useTheme() || { background: '#FFFFFF', primary: '#0064FF' };


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  addButton: { backgroundColor: theme.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 10 },
  viewAllButton: { padding: 10, alignItems: 'center', marginTop: 10 },
  viewAllText: { color: theme.primary, fontSize: 16, fontWeight: 'bold' },
  errorModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  errorModalContent: { backgroundColor: '#FFFFFF', margin: 50, borderRadius: 20, padding: 20, alignItems: 'center' },
  errorTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  errorMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorCloseButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  errorCloseButtonText: { color: '#FFFFFF', fontSize: 18 },
});

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      const accRes = await api.get('/accounts/');
      console.log('Accounts response:', accRes.data);
      setAccounts(accRes.data || []);
      if (accRes.data && accRes.data.length > 0) {
        const txRes = await api.get('/transactions/', { params: { account_number: accRes.data[0].account_number, limit: 5 } });
        console.log('Transactions response:', txRes.data);
        setTransactions(txRes.data || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('응답이 없습니다. 네트워크를 확인하세요.');
      setErrorModalVisible(true);
    }
  };

  const handleAddAccount = () => {
    router.push('/account-create');
  };

  const handleViewAllAccounts = () => {
    router.push('/accounts');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>홈</Text>
        <TouchableOpacity onPress={handleAddAccount}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={accounts.slice(0, 5)}
        renderItem={({ item }) => (
          <Card
            title={item.bank_name}
            subtitle={item.account_number}
            balance={item.balance}
            onPress={() => router.push({ pathname: '/transactions', params: { account_number: item.account_number } })}
            onSendPress={() => router.push({ pathname: '/transfer', params: { from_account: item.account_number } })}
          />
        )}
        keyExtractor={(item) => item.account_number}
        ListEmptyComponent={<Text style={styles.emptyText}>계좌가 없습니다.</Text>}
        ListFooterComponent={
          <TouchableOpacity onPress={handleViewAllAccounts} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>더보기</Text>
          </TouchableOpacity>
        }
      />
      <Text style={styles.sectionTitle}>최근 거래</Text>
      <FlatList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionItem
            fromAccount={item.from_account}
            toAccount={item.to_account}
            amount={item.amount}
            timestamp={item.timestamp}
            fromBank={item.from_bank_name}
            toBank={item.to_bank_name}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>최근 거래가 없습니다.</Text>}
      />
      <Modal
        visible={errorModalVisible}
        animationType="fade"
        transparent={true}
      >
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


export default HomeScreen;