import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import COLORS from '../../config/colors'

const SectionButtonHomeScreen = ({
  title = '',
  onPress = () => { },
  icon = null,
  titleStyle = {},
  containerStyle = {},
}) => {
  return (
    <View style={{
      overflow: 'hidden',
      borderRadius: containerStyle.borderRadius || styles.container.borderRadius,
    }}>
      <Pressable onPress={onPress} android_ripple={{ color: `${COLORS.COLOR_01}50` }}
        style={{ ...styles.container, ...containerStyle }}>
        {
          icon
            ? icon
            : <MaterialIcons name="add-circle-outline" size={24} color={COLORS.COLOR_01} />
        }
        <Text style={{ ...styles.title, ...titleStyle }}>{title}</Text>
      </Pressable>
    </View>
  )
}

export default SectionButtonHomeScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.COLOR_01}10`,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: `${COLORS.COLOR_01}50`,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Regular',
    color: COLORS.COLOR_01
  }
})