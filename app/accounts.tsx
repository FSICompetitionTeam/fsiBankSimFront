import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import api from '../lib/api';
import Card from '../components/Card';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { Account } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccountsProps {}

const AccountsScreen: React.FC<AccountsProps> = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
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
  errorModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  errorModalContent: { backgroundColor: '#FFFFFF', margin: 50, borderRadius: 20, padding: 20, alignItems: 'center' },
  errorTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  errorMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  errorCloseButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  errorCloseButtonText: { color: '#FFFFFF', fontSize: 18 },
});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const accRes = await api.get('/accounts/');
      console.log('Accounts response:', accRes.data);
      setAccounts(accRes.data || []);
    } catch (error) {
      console.error(error);
      setErrorMessage('응답이 없습니다. 네트워크를 확인하세요.');
      setErrorModalVisible(true);
    }
  };

  const handleAddAccount = () => {
    router.push('/account-create');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>내 계좌</Text>
        <TouchableOpacity onPress={handleAddAccount} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={accounts}
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

export default AccountsScreen;