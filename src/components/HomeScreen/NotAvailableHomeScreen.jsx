import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import COLORS from '../../config/colors'

const NotAvailableHomeScreen = ({
  text = '',
  textStyle = {},
  containerStyle = {},
}) => {
  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <Text style={{ ...styles.text, ...textStyle }}>{text}</Text>
    </View>
  )
}

export default NotAvailableHomeScreen

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 6,
    padding: 16,
    backgroundColor: `${COLORS.COLOR_01}10`,
    borderColor: `${COLORS.COLOR_01}50`,
    alignItems: 'center'
  },
  text: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBoldItalic',
    color: COLORS.COLOR_01,
  }
})