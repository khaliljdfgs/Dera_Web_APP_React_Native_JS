import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import COLORS from '../../config/colors'

import IMAGE_PLACEHOLDER_SQUARE from '../../../assets/images/image-placeholder-square.png'

const CustomWideSlimCard = ({
  title = '',
  titleStyle = {},
  imageUri = '',
  imageStyle = {},
  details = [],
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

      <Image
        style={{
          flex: 1,
          minHeight: 120,
          resizeMode: 'cover',
          ...(!imageUri && { tintColor: COLORS.COLOR_01 }),
          ...imageStyle
        }}
        source={
          imageUri && imageUri.length > 0
            ? { uri: imageUri }
            : IMAGE_PLACEHOLDER_SQUARE
        }
      />

      <View style={{ flex: 1.75 }}>
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
                  ...(detail.icon && { alignItems: 'center', gap: 6 }),
                  ...(detail.containterStyle && detail.containterStyle)
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

export default CustomWideSlimCard

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.COLOR_06,
    borderRadius: 6,
    borderColor: COLORS.COLOR_01,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_06,
    backgroundColor: COLORS.COLOR_01,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemAttributeTitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_01,
  },
  itemAttributeValue: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_01,
    flex: 1,
  },
})