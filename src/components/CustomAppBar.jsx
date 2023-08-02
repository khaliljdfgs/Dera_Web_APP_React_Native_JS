import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

import COLORS from '../config/colors'

const CustomAppBar = ({
  title = 'App Bar Title',
  onGoBack = () => { },
  rightIcon = null,
  onRightIconPress = () => { }
}) => {
  return (
    <View style={styles.container}>
      {
        onGoBack &&
        <TouchableOpacity onPress={onGoBack} activeOpacity={0.55}>
          <Ionicons name='arrow-back' size={26} color={COLORS.COLOR_06} />
        </TouchableOpacity>
      }
      <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
      {
        rightIcon &&
        <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.55}>
          {rightIcon}
        </TouchableOpacity>
      }
    </View>
  )
}

export default CustomAppBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.COLOR_01,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'NunitoSans-Bold',
    color: COLORS.COLOR_06,
    textTransform: 'uppercase',
    flex: 1,
  }
})