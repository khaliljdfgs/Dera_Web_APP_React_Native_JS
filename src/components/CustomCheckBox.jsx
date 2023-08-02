import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'

import COLORS from '../config/colors'

const CustomCheckBox = ({
  label = 'Checkbox',
  labelStyle = {},
  status = false,
  onPress = () => { },
  containerStyle = {},
}) => {
  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <View style={{ overflow: 'hidden', borderRadius: 4 }}>
        <Pressable style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          borderWidth: status ? 0 : 2,
          borderColor: COLORS.COLOR_01,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: status ? COLORS.COLOR_01 : COLORS.COLOR_06,
        }} android_ripple={{ color: COLORS.COLOR_01 }} onPress={onPress}>
          {
            status &&
            <MaterialIcons name="check" size={16} color={COLORS.COLOR_06} />
          }
        </Pressable>
      </View>
      <Text style={{ ...styles.label, ...labelStyle }}>{label}</Text>
    </View>
  )
}

export default CustomCheckBox

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  label: {
    color: COLORS.COLOR_08,
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular'
  }
})