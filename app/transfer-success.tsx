import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';

export default function TransferSuccessScreen() {
  const params = useLocalSearchParams();
  const amount = params.amount as string;
  const toAccount = params.toAccount as string;
  const toBank = params.toBank as string;
  const router = useRouter();
  const theme = useTheme();
  const opacity = useSharedValue(0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleConfirm = () => {
    router.replace('/');
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor: theme.background }]}>
      <Text style={styles.message}>{amount}원을 {toBank} {toAccount}로 옮겼어요.</Text>
      <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>확인</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  message: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, color: '#0064FF' },
  confirmButton: { backgroundColor: '#0064FF', padding: 15, borderRadius: 30, width: '80%', alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});