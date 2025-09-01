import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MaskInput from 'react-native-mask-input'; // 마스킹 입력
import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

interface LoginProps {}

const LoginScreen: React.FC<LoginProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { phone_number: phoneNumber, name });
      await AsyncStorage.setItem('token', response.data.access_token);
      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '로그인 실패');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post('/users/', { phone_number: phoneNumber, name });
      Alert.alert('성공', '회원가입 완료. 로그인하세요.');
      // 회원가입 후 입력 필드 초기화
      setPhoneNumber('');
      setName('');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '회원가입 실패');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.title}>로그인</Text>
      <MaskInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        mask={['0', '1', '0', '-', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]} // 010-1234-5678 형식
        placeholder="전화번호"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="이름"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
        <Text style={styles.registerButtonText}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#EEE', padding: 15, marginBottom: 10, borderRadius: 5 },
  loginButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 10 },
  loginButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  registerButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, alignItems: 'center' },
  registerButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
});

export default LoginScreen;