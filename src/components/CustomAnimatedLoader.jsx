import React from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'

import COLORS from '../config/colors'

import LOADER_GIF from '../../assets/gif/loader.gif'

const CustomAnimatedLoader = ({
  text = '',
  textStyle = {},
  containerStyle = {},
}) => {
  const [dots, setDots] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((dots) => (dots === 1 ? 0 : dots + 1))
    }, 500)

    return () => clearInterval(interval)
  }, [])


  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      <Image source={LOADER_GIF} style={{ width: 150, height: 100 }} />
      <Text style={{ ...styles.text, ...textStyle }}>
        {text}
        {
          dots === 0 && <Text style={{ ...styles.text, ...textStyle }}>{'...'}</Text>
        }
        {
          dots === 1 && <Text style={{ ...styles.text, ...textStyle }}>{'..!'}</Text>
        }
      </Text>
    </View>
  )
}

export default CustomAnimatedLoader

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 20,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_01,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
})