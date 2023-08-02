import { useCallback } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import * as Animatable from 'react-native-animatable'
import { useFonts } from 'expo-font'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import ROUTES from '../../config/routes'
import FONTS from '../../config/fonts'
import COLORS from '../../config/colors'
import { ACCOUNT_STATUS, ROLES } from '../../config/values'

import LOGO from '../../../assets/images/logo.png'

const SplashScreen = ({ navigation }) => {
  const AfterSplashCallback = async () => {
    //await AsyncStorage.clear()

    const user = await AsyncStorage.getItem('currentUser')
    let screen = ROUTES.COMMON.LOGIN

    if (user) {
      const currentUser = JSON.parse(user)
      const {
        accountType,
        geoLocation,
        address,
        businessName,
        aboutUs,
        yearsOfExperience,
        phone,
      } = currentUser

      if (accountType === ROLES.DERA) {
        if (!geoLocation || !address || !phone || !businessName || !aboutUs) {
          screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
        } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
          screen = ROUTES.DERA.STACK_NAVIGATOR
        }
      } else if (accountType === ROLES.DVM) {
        if (!geoLocation || !address || !phone || !yearsOfExperience) {
          screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
        } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
          screen = ROUTES.DVM.STACK_NAVIGATOR
        }
      } else if (accountType === ROLES.CONSUMER) {
        if (!geoLocation || !address || !phone) {
          screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
        } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
          screen = ROUTES.CONSUMER.STACK_NAVIGATOR
        }
      }

      // if (!geoLocation || !address) {
      //   screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
      // } else if (accountType === ROLES.DERA) {
      //   screen = !businessName || !aboutUs
      //     ? ROUTES.COMMON.ADDITIONAL_INFORMATION
      //     : ROUTES.DERA.STACK_NAVIGATOR
      // } else if (accountType === ROLES.DVM) {
      //   screen = !yearsOfExperience
      //     ? ROUTES.COMMON.ADDITIONAL_INFORMATION
      //     : ROUTES.DVM.STACK_NAVIGATOR
      // } else if (accountType === ROLES.CONSUMER) {
      //   screen = ROUTES.CONSUMER.STACK_NAVIGATOR
      // }
    }

    navigation.reset({ index: 0, routes: [{ name: screen }] })
  }

  useFocusEffect(useCallback(() => {
    setTimeout(AfterSplashCallback, 3600)

    return () => { }
  }, []))

  const [fontsLoaded] = useFonts(FONTS)

  if (!fontsLoaded) return (<></>)

  return (
    <View style={styles.container}>
      <Animatable.View animation='fadeIn' duration={2500}>
        <Image source={LOGO} style={styles.image} />
      </Animatable.View>
      <Animatable.Text animation='fadeIn' duration={2500} style={{
        marginTop: 20,
        fontSize: 40,
        fontFamily: 'Ubuntu-Bold',
        textTransform: 'uppercase',
        color: COLORS.COLOR_01,
      }}>
        Dera
      </Animatable.Text>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 225,
    height: 225,
    resizeMode: 'contain',
  },
})