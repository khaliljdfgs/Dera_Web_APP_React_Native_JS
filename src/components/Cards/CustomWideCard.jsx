import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import CustomTagChip, { TAG_CHIP_MODES } from '../CustomTagChip'

import COLORS from '../../config/colors'

const CustomWideCard = ({
  title = '',
  titleStyle = {},
  imageUri = '',
  imageStyle = {},
  details = [],
  chipText = '',
  chipContainerStyle = {},
  chipMode = TAG_CHIP_MODES.SUCCESS,
  containterStyle = {},
  onPress = () => { },
  onLongPress = () => { },
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.65}
      style={{ ...styles.itemContainer, ...containterStyle }}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View>
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', aspectRatio: 16 / 9, resizeMode: 'cover', ...imageStyle }} />
        <CustomTagChip
          text={chipText}
          mode={chipMode}
          containerStyle={{ position: 'absolute', top: 8, right: 8, ...chipContainerStyle }} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          ...styles.itemTitle,
          ...titleStyle
        }} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>

        <View style={{ paddingVertical: 8, paddingHorizontal: 12, gap: 4 }}>
          {
            details.map((detail, index) => {
              return (
                <View style={{
                  flexDirection: 'row',
                  ...(detail.icon && { alignItems: 'center', gap: 6 })
                }} key={index}>
                  {
                    detail.title &&
                    <Text style={{
                      ...styles.itemAttributeTitle,
                      ...detail.titleStyle,
                    }} numberOfLines={1} ellipsizeMode='tail'>
                      {detail.title}
                    </Text>
                  }
                  {
                    detail.icon && detail.icon
                  }
                  <Text style={{
                    ...styles.itemAttributeValue,
                    ...detail.valueStyle,
                  }} numberOfLines={1} ellipsizeMode='tail'>
                    {detail.value}
                  </Text>
                </View>
              )
            })
          }
        </View>
        <MaterialIcons
          name='keyboard-arrow-right'
          size={22}
          color={COLORS.COLOR_01}
          style={{ position: 'absolute', right: 4, bottom: 4 }} />
      </View>
    </TouchableOpacity>
  )
}

export default CustomWideCard

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.COLOR_06,
    borderRadius: 6,
    borderColor: COLORS.COLOR_01,
    borderWidth: 2,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_06,
    backgroundColor: COLORS.COLOR_01,
    padding: 8,
    paddingHorizontal: 12,
  },
  itemAttributeTitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_01,
    flex: 1,
  },
  itemAttributeValue: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_01,
    flex: 2,
  },
})