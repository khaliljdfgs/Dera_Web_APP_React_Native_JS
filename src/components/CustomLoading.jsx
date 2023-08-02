import React from 'react'
import { Text, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import COLORS from '../config/colors'

import LOADER_GIF from '../../assets/gif/loader.gif'
import CustomAnimatedLoader from './CustomAnimatedLoader'

const CustomLoading = ({
  message,
  color = COLORS.COLOR_01,
  insideTabNavigation = false
}) => {
  return (
    <SafeAreaView
      edges={insideTabNavigation ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {/* <ActivityIndicator size='large' color={color} /> */}
      {/* <Text style={{ fontSize: 18, padding: 16, color: color }}>{message}</Text> */}
      <CustomAnimatedLoader text={(() => {
        if (message.slice(-3) === '...') {
          return message.slice(0, -3)
        }
        else if (message.slice(-3) === '..!') {
          return message.slice(0, -3)
        }
        else {
          return message
        }
      })()} />
    </SafeAreaView>
  )
}

export default CustomLoading