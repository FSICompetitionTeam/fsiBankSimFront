import React from 'react';
import { View, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Bank } from '../app/types';

interface BankPickerProps {
  banks: Bank[];
  selectedBank: string;
  onSelect: (value: string) => void;
}

const BankPicker: React.FC<BankPickerProps> = ({ banks, selectedBank, onSelect }) => {
  return (
    <View>
      <Text>은행 선택</Text>
      <RNPickerSelect
        onValueChange={onSelect}
        items={banks.map((bank) => ({
          label: bank.name,
          value: bank.name,
          key: bank.code, // key는 옵션, 중복 방지용
        }))}
        value={selectedBank}
        placeholder={{ label: '은행 선택...', value: null }} // 플레이스홀더 추가 (선택적)
        style={{
          inputIOS: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 5 },
          inputAndroid: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 5 },
        }} // Toss-like 간단 스타일
      />
    </View>
  );
};

export default BankPicker;