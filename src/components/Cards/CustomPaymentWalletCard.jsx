import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import CustomTextInput from '../CustomTextInput'

import COLORS from '../../config/colors'

const CustomPaymentWalletCard = ({
  title = '',
  wallet = {},
  setWallet = () => { },
  additionalInfo = {
    accountTitle: { label: '', placeholder: '' },
    accountNumber: { label: '', placeholder: '' },
  },
  titleStyle = {},
  containerStyle = {},
}) => {
  return (
    <View>
      <Text style={{ ...styles.title, ...titleStyle }}>{title}</Text>
      <View style={{ ...styles.container, ...containerStyle }}>
        <CustomTextInput
          label={additionalInfo?.accountTitle?.label || 'Account Title'}
          placeholder={additionalInfo?.accountTitle?.placeholder || 'Enter Account Title'}
          value={wallet?.title}
          onChangeText={text => setWallet({ ...wallet, title: text })}
          rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
          onRightIconPress={() => setWallet({ ...wallet, title: '' })}
          containerStyle={{ flex: 1 }}
        />

        <CustomTextInput
          label={additionalInfo?.accountNumber?.label || 'Account Number'}
          placeholder={additionalInfo?.accountNumber?.placeholder || '03xxxxxxxxx'}
          // placeholder={additionalInfo?.accountNumber?.placeholder || 'Enter Account Number'}
          value={wallet?.number}
          onChangeText={text => {
            if (!/^[0-9]*$/.test(text)) return
            setWallet({ ...wallet, number: text })
          }}
          rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
          onRightIconPress={() => setWallet({ ...wallet, number: '' })}
          containerStyle={{ flex: 1 }}
          keyboardType='phone-pad'
        />
      </View>
    </View>
  )
}

export default CustomPaymentWalletCard

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.COLOR_01,
    color: COLORS.COLOR_06,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  container: {
    padding: 16,
    gap: 16,
    borderColor: COLORS.COLOR_01,
    borderWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  }
})