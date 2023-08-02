import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import COLORS from '../config/colors'

const MODES = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
}

export { MODES as TAG_CHIP_MODES }

const CustomTagChip = ({
  text = '',
  textStyle = {},
  containerStyle = {},
  mode = MODES.DEFAULT,
}) => {
  const GetBackgroundColor = () => {
    switch (mode) {
      case MODES.SUCCESS:
        return COLORS.COLOR_05
      case MODES.WARNING:
        return COLORS.COLOR_03
      case MODES.DANGER:
        return COLORS.COLOR_04
      default:
        return COLORS.COLOR_01
    }
  }

  const GetTextColor = () => {
    switch (mode) {
      case MODES.SUCCESS:
        return COLORS.COLOR_08
      case MODES.WARNING:
        return COLORS.COLOR_08
      case MODES.DANGER:
        return COLORS.COLOR_06
      default:
        return COLORS.COLOR_06
    }
  }

  return (
    <View style={{ ...styles.container, backgroundColor: GetBackgroundColor(), ...containerStyle }}>
      <Text style={{ ...styles.text, color: GetTextColor(), ...textStyle }}>{text}</Text>
    </View>
  )
}

export default CustomTagChip

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.COLOR_01,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_06,
    textTransform: 'uppercase',
  },
})