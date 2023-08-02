import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { BarCodeScanner } from 'expo-barcode-scanner'


import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import CustomButton from '../../components/CustomButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'
import { Firestore } from '../../config/firebase'
import FirebaseErrors from '../../utils/FirebaseErrors'
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS } from '../../config/values'

const QRCodeScanScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [hasPermission, setHasPermission] = useState(null)
  const [scan, setScan] = useState(false)

  useEffect(() => {
    GetBarCodeScannerPermissions()
  }, [])

  const GetBarCodeScannerPermissions = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync()
    setHasPermission(status === 'granted')
  }

  const FetchRecord = async (data) => {
    setIsLoading('verifying...')
    const index = data.index

    try {
      const order = await getDoc(doc(Firestore, 'dairyProductOrders', data.id))
      const orderData = order.data()

      if (orderData.isSubscription) {
        const dailyStatus = orderData.dailyStatus

        if (dailyStatus[index] === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED) {
          setIsLoading(null)

          setAlert({
            title: 'Info',
            message: 'This order has already been delivered.',
            positiveLabel: 'OK',
            positiveCallback: () => {
              setAlert(null)
              navigation.goBack()
            },
          })

          return
        } else {
          dailyStatus[index] = DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED
          await setDoc(doc(Firestore, 'dairyProductOrders', data.id), {
            dailyStatus: dailyStatus
          }, { merge: true })
        }
      } else if (orderData.isSingleOrder) {
        await setDoc(doc(Firestore, 'dairyProductOrders', data.id), {
          status: DAIRY_PRODUCT_ORDER_STATUS.DELIVERED
        }, { merge: true })
      }

      setIsLoading(null)
    } catch (error) {
      setIsLoading(null)
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    }

    setIsLoading(null)

    setAlert({
      title: 'Success',
      message: 'Order has been delivered successfully!',
      positiveLabel: 'OK',
      positiveCallback: () => {
        setAlert(null)
        navigation.goBack()
      },
    })
  }

  const HandleBarCodeScanned = ({ type, data }) => {
    setScan(false)
    FetchRecord(JSON.parse(data))
  }

  const Wrapper = ({ children }) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      <CustomAppBar title='Scan QR Code' onGoBack={() => navigation.goBack()} />
      {children}
    </SafeAreaView>
  )

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <Wrapper>
        <CustomLoading message={isLoading} />
      </Wrapper>
    )
  }

  if (hasPermission === null) {
    return (
      <Wrapper>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CustomButton
            leftIcon={<MaterialIcons name='perm-media' size={20} color='white' />}
            onPress={() => GetBarCodeScannerPermissions()}
            title='Grant Camera Permission'
          />
        </View>
      </Wrapper>
    )
  }

  if (hasPermission === false) {
    return (
      <Wrapper>
        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <CustomButton
            leftIcon={<MaterialIcons name='error' size={20} color='white' />}
            onPress={() => navigation.goBack()}
            title={`No Camera Permission`}
          />
        </View>
      </Wrapper>
    )
  }

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

      <CustomAppBar title='Scan QR Code' onGoBack={() => navigation.goBack()} />

      <BarCodeScanner
        onBarCodeScanned={scan ? HandleBarCodeScanned : undefined}
        style={{ height: 500, marginHorizontal: 20, marginVertical: 0, marginTop: 8 }}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />

      <View style={{ paddingHorizontal: 20 }}>
        <CustomButton
          leftIcon={<MaterialCommunityIcons name='qrcode-scan' size={20} color='white' />}
          onPress={() => setScan(true)}
          title='Scan QR Code'
        />
      </View>

    </SafeAreaView>
  )
}

export default QRCodeScanScreen

const styles = StyleSheet.create({}) 