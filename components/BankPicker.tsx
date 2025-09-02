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
          key: bank.code,
        }))}
        value={selectedBank}
        placeholder={{ label: '은행 선택...', value: null }}
        style={{
          inputIOS: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 5 },
          inputAndroid: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: '#EEE', borderRadius: 5 },
        }}
      />
    </View>
  );
};

export default BankPicker;