import React, { useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { sendPasswordResetEmail } from 'firebase/auth'
import { MaterialIcons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'

import CustomLoading from '../../components/CustomLoading'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { Authentication } from '../../config/firebase'
import { InputStringValidation, REGULAR_EXPRESSION } from '../../utils/Validation'
import FirebaseErrors from '../../utils/FirebaseErrors'

import MILK_BOTTLE from '../../../assets/images/milk_bottle.png'

const LoginScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [email, setEmail] = useState('')

  const HandleSendEmail = async () => {
    const isEmailInvalid = InputStringValidation({
      field: 'Email Address',
      value: email,
      min: 5,
      max: 60,
      regExp: REGULAR_EXPRESSION.EMAIL,
    })
    if (isEmailInvalid) {
      setAlert({
        title: 'Info',
        message: isEmailInvalid,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    setIsLoading('Resetting Password...')

    try {
      await sendPasswordResetEmail(Authentication, email)

      setAlert({
        title: 'Success',
        message: 'Password reset email sent successfully!',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    } catch (error) {
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    }

    setIsLoading(null)
  }

  const HandleRegistration = () => {
    navigation.navigate(ROUTES.COMMON.REGISTER)
  }

  const HandleLogin = () => {
    navigation.navigate(ROUTES.COMMON.LOGIN)
  }

  if (isLoading) {
    return <CustomLoading message={isLoading} />
  }

  return (
    <SafeAreaView style={styles.container}>
      {
        alert &&
        <CustomAlertDialog
          title={alert.title || 'Warning'}
          message={alert.message}
          positiveLabel={alert.positiveLabel || 'OK'}
          positiveCallback={alert.positiveCallback}
          negativeLabel={alert.negativeLabel || 'Cancel'}
          negativeCallback={alert.negativeCallback}
        />
      }

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        contentContainerStyle={{ backgroundColor: COLORS.COLOR_01 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.imageContainer}>
            <Animatable.View animation='pulse' easing='ease-out' iterationCount='infinite' duration={3250}>
              <Image source={MILK_BOTTLE} style={styles.image} />
            </Animatable.View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Now!</Text>

            <CustomTextInput
              label='Email'
              placeholder='Enter Your Email Address'
              value={email}
              onChangeText={(text) => { setEmail(text) }}
              keyboardType='email-address'
            />


            <CustomButton
              title='Send Email'
              onPress={HandleSendEmail}
              rightIcon={<MaterialIcons name='email' size={20} color={COLORS.COLOR_06} />}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.line} />
              <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 18, textAlign: 'center' }}>
                Already have an account?
              </Text>
              <View style={styles.line} />
            </View>

            <CustomButton
              title='Login Now!'
              isOutlined={true}
              onPress={HandleLogin}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.line} />
              <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 18, textAlign: 'center' }}>
                Don't have an account?
              </Text>
              <View style={styles.line} />
            </View>

            <CustomButton
              title='Register Now!'
              isOutlined={true}
              onPress={HandleRegistration}
            />

            <View style={{ height: 50 }} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.COLOR_06
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: COLORS.COLOR_01,
    justifyContent: 'center'
  },
  image: {
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  formContainer: {
    elevation: 20,
    paddingHorizontal: 40,
    paddingVertical: 34,
    gap: 20,
    backgroundColor: COLORS.COLOR_06,
    borderTopLeftRadius: 44,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    textTransform: 'uppercase',
    color: COLORS.COLOR_01,
    fontFamily: 'NunitoSans-Black',
    letterSpacing: 0.75,
  },
  line: {
    height: 1,
    backgroundColor: '#000',
    flex: 1,
    opacity: 0.25
  }
})