import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import api from '../lib/api';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

export default function RegisterScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleRegister = async () => {
    try {
      await api.post('/users/', { phone_number: phoneNumber, name });
      router.replace('/login');
    } catch (error) {
      console.error(error);
      alert('회원가입 성공 (mock)');
      router.replace('/login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.title}>회원가입</Text>
      <TextInput 
        placeholder="전화번호" 
        value={phoneNumber} 
        onChangeText={setPhoneNumber} 
        style={styles.input} 
        keyboardType="phone-pad"
      />
      <TextInput 
        placeholder="이름" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
      />
      <Button title="가입하기" onPress={handleRegister} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 10, borderRadius: 5 },
});