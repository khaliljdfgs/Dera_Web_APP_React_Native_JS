import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import COLORS from '../config/colors'

const CustomButton = ({
  title = 'Button',
  onPress = () => { },
  containerStyle = {},
  textStyle = {},
  leftIcon = null,
  rightIcon = null,
  isOutlined = false,
}) => {
  return (
    <Pressable
      style={{
        ...styles.container,
        backgroundColor: isOutlined ? COLORS.COLOR_06 : COLORS.COLOR_01,
        borderWidth: isOutlined ? 2 : 0,
        borderColor: COLORS.COLOR_01,
        paddingVertical: leftIcon ? 8 : 10,
        ...containerStyle,
      }}
      onPress={onPress}
      android_ripple={{ color: COLORS.COLOR_05 }}>
      {leftIcon}
      <Text style={{
        ...styles.text,
        color: isOutlined ? COLORS.COLOR_01 : COLORS.COLOR_06,
        ...textStyle,
      }}>{title}</Text>
      {rightIcon}
    </Pressable>
  )
}

export default CustomButton

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.COLOR_01,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingVertical: 10,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  text: {
    color: COLORS.COLOR_06,
    fontSize: 20,
    letterSpacing: 0.5,
    // fontFamily: 'Ubuntu-Medium',
    // textTransform: 'uppercase',
    fontFamily: 'Ubuntu-Regular',
    textTransform: 'capitalize',
    paddingHorizontal: 10,
  },
})