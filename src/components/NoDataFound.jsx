import { StyleSheet, Text, View, Image, Dimensions } from 'react-native'
import React from 'react'

import COLORS from '../config/colors'

const NoDataFound = ({
  message = 'No Data Found!',
  containerStyle = {},
  messageStyle = {},
  image = require('../../assets/images/noRecordFound.png')
}) => {
  return (
    <View style={{
      ...styles.container, ...containerStyle
    }}>
      <Image source={image}
        style={{
          width: Dimensions.get('window').width * 0.65,
          height: Dimensions.get('window').width * 0.60,
        }} />
      <Text style={{ ...styles.message, ...messageStyle }}>
        {message}
      </Text>
    </View>
  )
}

export default NoDataFound

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_01,
    textAlign: 'center',
    marginTop: 24,
  }
})