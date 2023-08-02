import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import COLORS from '../config/colors'

const CustomIconButton = ({
  onPress = () => { },
  containerStyle = {},
  icon = null,
  isOutlined = false,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}
      style={{
        ...styles.container,
        backgroundColor: isOutlined ? COLORS.COLOR_06 : COLORS.COLOR_01,
        borderColor: isOutlined ? COLORS.COLOR_01 : COLORS.COLOR_06,
        borderWidth: isOutlined ? 2 : 0,
        ...containerStyle,
      }}>
      {icon}
    </TouchableOpacity>
  )
}

export default CustomIconButton

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.COLOR_01,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    padding: 10,
    overflow: 'hidden',
  },
})