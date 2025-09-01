import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="account-create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="deposit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="withdraw" options={{ presentation: 'modal' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="transfer" options={{ headerShown: false }} />
      <Stack.Screen name="transactions" options={{ headerShown: false }} />
      <Stack.Screen name="transfer-success" options={{ headerShown: false }} /> // 새 추가
    </Stack>
  );
}