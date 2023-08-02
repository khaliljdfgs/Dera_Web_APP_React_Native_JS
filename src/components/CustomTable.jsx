import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

import COLORS from '../config/colors'

const CopyToClipboard = async (text) => {
  Clipboard.setStringAsync(text)
  ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT)
}

const RenderPhoneNumber = ({ item, rowStyle, leftCellStyle, rightCellStyle }) => {
  const primaryPhone = item.right.split('\n')[0]
  const secondaryPhone = item.right.split('\n')[1]

  return (
    <View style={{ ...styles.row, ...rowStyle }}>
      <Text style={{ ...styles.leftCell, ...leftCellStyle }}>{item.left}</Text>
      <View style={{ ...styles.rightCell, gap: 6, ...rightCellStyle, ...item.rightCellStyle }}>
        <TouchableOpacity onPress={() => { CopyToClipboard(primaryPhone) }} activeOpacity={0.65}
          style={{
            ...rightCellStyle, ...item.rightCellStyle,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{ fontSize: 17, fontFamily: 'NunitoSans-Regular' }}>{primaryPhone}</Text>
          <MaterialIcons name="content-copy" size={18} color={COLORS.COLOR_01} />
        </TouchableOpacity>

        {
          secondaryPhone &&
          <TouchableOpacity onPress={() => { CopyToClipboard(secondaryPhone) }} activeOpacity={0.65}
            style={{
              ...rightCellStyle, ...item.rightCellStyle,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={{ fontSize: 17, fontFamily: 'NunitoSans-Regular' }}>{secondaryPhone}</Text>
            <MaterialIcons name="content-copy" size={18} color={COLORS.COLOR_01} />
          </TouchableOpacity>
        }
      </View>
    </View>
  )
}

const CustomTable = ({
  heading = '',
  data = [],
  headingStyle = {},
  rowStyle = {},
  leftCellStyle = {},
  rightCellStyle = {},
  rightCellContainerStyle = {},
  isSocialMedia = false,
}) => {
  return (
    <View>
      <Text style={{ ...styles.head, ...headingStyle }}>{heading}</Text>
      {
        data.map((item, index) => {
          if (item.left === 'Phone') {
            return (
              <RenderPhoneNumber
                key={index}
                item={item}
                rowStyle={rowStyle}
                leftCellStyle={leftCellStyle}
                rightCellStyle={rightCellStyle} />
            )
          }

          return (
            <View style={{ ...styles.row, ...rowStyle }} key={index}>
              <Text style={{ ...styles.leftCell, ...leftCellStyle }}>{item.left}</Text>
              {
                item.onPress
                  ?
                  <TouchableOpacity style={{ ...styles.rightCellContainer, ...rightCellContainerStyle }}
                    onPress={() => { item.onPress(item) }} activeOpacity={0.65}>
                    <Text style={{
                      fontSize: 17,
                      fontFamily: 'NunitoSans-Regular',
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                      // ...(isSocialMedia && { flex: 1 }),
                      flex: 1,
                      ...rightCellStyle,
                    }}>{item.right}</Text>
                    {
                      isSocialMedia && item.right !== 'N/A' &&
                      <Ionicons name="ios-open-outline" size={20} color={COLORS.COLOR_01} />
                    }
                    {
                      !isSocialMedia &&
                      <Ionicons name="ios-open-outline" size={20} color={COLORS.COLOR_01} />
                    }
                  </TouchableOpacity>
                  :
                  <Text style={{ ...styles.rightCell, ...rightCellStyle, ...item.rightCellStyle }}
                    numberOfLines={item.numberOfLines} ellipsizeMode='tail'>
                    {item.right}
                  </Text>
              }
            </View>
          )
        })
      }
    </View>
  )
}

export default CustomTable

const styles = StyleSheet.create({
  head: {
    color: COLORS.COLOR_06,
    backgroundColor: COLORS.COLOR_01,
    textAlign: 'center',
    padding: 8,
    fontSize: 18,
    fontFamily: 'NunitoSans-Bold',
    textTransform: 'uppercase',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.COLOR_01,
  },
  leftCell: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'NunitoSans-Regular',
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderColor: COLORS.COLOR_01,
  },
  rightCellContainer: {
    flex: 2.5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    alignItems: 'flex-start',
  },
  rightCell: {
    flex: 2.5,
    fontSize: 17,
    fontFamily: 'NunitoSans-Regular',
    paddingHorizontal: 12,
    paddingVertical: 6,
  }
})