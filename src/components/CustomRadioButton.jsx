import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RadioButton } from 'react-native-paper'
import COLORS from '../config/colors'

const CustomRadioButton = ({
  label = '',
  status = 'unchecked',
  onPress = () => { },
}) => {
  return (
    <View style={styles.container}>
      <RadioButton status={status} onPress={onPress} color={COLORS.COLOR_01} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export default CustomRadioButton

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Bold',
    color: COLORS.COLOR_01,
  }
})