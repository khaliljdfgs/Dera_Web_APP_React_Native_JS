import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { MaterialIcons } from '@expo/vector-icons'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomPaymentWalletCard from '../../../components/Cards/CustomPaymentWalletCard'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputStringValidation } from '../../../utils/Validation'

const PaymentWalletsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [easyPaisa, setEasyPaisa] = useState({ title: '', number: '' })
  const [jazzCash, setJazzCash] = useState({ title: '', number: '' })
  const [uPaisa, setUPaisa] = useState({ title: '', number: '' })

  const [initialData, setInitialData] = useState({})

  const GetPaymentWallets = async () => {
    try {
      setIsLoading('Loading...')
      const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      const userDoc = doc(Firestore, 'users', uid)
      const userDocSnapshot = await getDoc(userDoc)

      if (userDocSnapshot.exists()) {
        const { paymentWallets } = userDocSnapshot.data()
        setEasyPaisa(paymentWallets?.easyPaisa || { title: '', number: '' })
        setJazzCash(paymentWallets?.jazzCash || { title: '', number: '' })
        setUPaisa(paymentWallets?.uPaisa || { title: '', number: '' })

        setInitialData({
          easyPaisa: paymentWallets?.easyPaisa || { title: '', number: '' },
          jazzCash: paymentWallets?.jazzCash || { title: '', number: '' },
          uPaisa: paymentWallets?.uPaisa || { title: '', number: '' }
        })
      }
    } catch (error) {
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
    }

    setIsLoading(null)
  }

  useEffect(() => { GetPaymentWallets() }, [])

  const HandleClear = () => {
    if (!easyPaisa.title && !easyPaisa.number
      && !jazzCash.title && !jazzCash.number
      && !uPaisa.title && !uPaisa.number) return

    const ClearFields = () => {
      setEasyPaisa({ title: '', number: '' })
      setJazzCash({ title: '', number: '' })
      setUPaisa({ title: '', number: '' })
      setAlert(null)
    }

    setAlert({
      message: 'Are you sure you want to clear all fields?',
      positiveLabel: 'Yes',
      positiveCallback: ClearFields,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSave = async () => {
    const Validate = ({ wallet, title }) => {
      if ((wallet.title && !wallet.number) || (!wallet.title && wallet.number)) {
        setAlert({
          message: `${title} Title and Number is required!`,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
        return false
      }

      if (wallet.title && wallet.number) {
        const result = InputStringValidation({
          field: `${title} Account Title`,
          value: wallet.title,
          min: 3,
          max: 30
        })

        if (result) {
          setAlert({
            message: result,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null)
          })
          return false
        }

        if (wallet.number.length !== 11) {
          setAlert({
            message: `${title} Number must be 11 digits!`,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null)
          })
          return false
        }

        if (!/^(03)\d{9}$/.test(wallet.number)) {
          setAlert({
            message: `${title} Number is not valid!`,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null)
          })
          return false
        }
      }

      return true
    }

    if (!Validate({ wallet: easyPaisa, title: 'EasyPaisa' })) return
    if (!Validate({ wallet: jazzCash, title: 'JazzCash' })) return
    if (!Validate({ wallet: uPaisa, title: 'UPaisa' })) return

    const SavePaymentWallets = async () => {
      try {
        setIsLoading('Saving...')
        const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const updatedRecord = {
          paymentWallets: {
            easyPaisa: { title: '', number: '' },
            jazzCash: { title: '', number: '' },
            uPaisa: { title: '', number: '' },
          },
          updatedAt: serverTimestamp(),
        }

        if (easyPaisa.title && easyPaisa.number) {
          updatedRecord.paymentWallets.easyPaisa.number = easyPaisa.number.trim()
          updatedRecord.paymentWallets.easyPaisa.title = easyPaisa.title.trim()
        }

        if (jazzCash.title && jazzCash.number) {
          updatedRecord.paymentWallets.jazzCash.number = jazzCash.number.trim()
          updatedRecord.paymentWallets.jazzCash.title = jazzCash.title.trim()
        }

        if (uPaisa.title && uPaisa.number) {
          updatedRecord.paymentWallets.uPaisa.number = uPaisa.number.trim()
          updatedRecord.paymentWallets.uPaisa.title = uPaisa.title.trim()
        }

        await setDoc(doc(Firestore, 'users', uid), updatedRecord, { merge: true })

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Payment Wallets Saved Successfully!',
          positiveLabel: 'OK',
          positiveCallback: () => navigation.goBack()
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
      }
    }

    setAlert({
      message: 'Are you sure you want to save these payment wallets?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        SavePaymentWallets()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Payment Wallets' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  // If fonts are loaded, return our UI
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      {
        // If alert has a value, return our alert dialog
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

      <CustomAppBar title='Payment Wallets' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>

          <CustomPaymentWalletCard title='EasyPaisa' wallet={easyPaisa} setWallet={setEasyPaisa} />
          <CustomPaymentWalletCard title='JazzCash' wallet={jazzCash} setWallet={setJazzCash} />
          <CustomPaymentWalletCard title='UPaisa' wallet={uPaisa} setWallet={setUPaisa} />

          <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
            <CustomButton
              title='Clear'
              leftIcon={<MaterialIcons name='clear' color={COLORS.COLOR_06} size={24} />}
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              onPress={HandleClear}
            />

            <CustomButton
              title='Save'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              onPress={() => {
                if (
                  `${easyPaisa.title}`.trim() === initialData.easyPaisa.title &&
                  `${easyPaisa.number}`.trim() === initialData.easyPaisa.number &&
                  `${jazzCash.title}`.trim() === initialData.jazzCash.title &&
                  `${jazzCash.number}`.trim() === initialData.jazzCash.number &&
                  `${uPaisa.title}`.trim() === initialData.uPaisa.title &&
                  `${uPaisa.number}`.trim() === initialData.uPaisa.number
                ) {
                  navigation.goBack()
                  return
                }

                HandleSave()
              }}
            />
          </View>

          <View style={{ height: 200 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default PaymentWalletsScreen

const styles = StyleSheet.create({})