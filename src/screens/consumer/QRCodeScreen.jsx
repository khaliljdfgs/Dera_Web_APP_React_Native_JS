import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import QRCode from 'react-native-qrcode-svg'
import { onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { AirbnbRating } from 'react-native-ratings'

import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'
import { Firestore } from '../../config/firebase'

const QRCodeScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { data } = route.params
  const [isDelivered, setIsDelivered] = useState(false)

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      setAlert({
        title: 'Info',
        message: 'Please rate your experience, before leaving!',
        positiveLabel: 'OK',
        positiveCallback: () => {
          setAlert(null)
          e.preventDefault()
        }
      })
    })
  }, [])

  useEffect(() => {
    const __docListener = onSnapshot(doc(Firestore, 'dairyProductOrders', data.id), (doc) => {
      const orderData = doc.data()

      if (orderData.isSubscription) {
        const dailyStatus = orderData.dailyStatus

        if (dailyStatus[data.__index] === 'delivered') {
          setIsDelivered(true)
        }
      } else if (orderData.isSingleOrder) {
        if (orderData.status === 'delivered') {
          setIsDelivered(true)
        }
      }
    }, (error) => {
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    })

    return () => __docListener()
  }, [])

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='QR Code' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
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

      <CustomAppBar title='QR Code' onGoBack={() => navigation.goBack()} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        {
          isDelivered
            ?
            <>
              <Text style={{
                marginTop: 16,
                fontSize: 18,
                fontFamily: 'NunitoSans-SemiBold',
                color: COLORS.COLOR_01,
                // textAlign: 'left',
                // width: '100%',
                paddingBottom: 2,
                paddingHorizontal: 4,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.COLOR_01,
              }}>
                Rate Your Experience
              </Text>

              <AirbnbRating
                size={30}
                starContainerStyle={{ gap: 6 }}
                defaultRating={() => {
                  return Math.floor(Math.random() * 3) + 3
                }}
                onFinishRating={async (rating) => {
                  setIsLoading('Please wait...')

                  const productRef = doc(Firestore, 'products', data.product.id)
                  const productDoc = await getDoc(productRef)

                  if (!productDoc.exists()) {
                    setIsLoading(null)
                    setAlert({
                      title: 'Error',
                      message: 'Product not found!',
                      positiveLabel: 'OK',
                      positiveCallback: () => {
                        setAlert(null)
                        navigation.goBack()
                      }
                    })
                    return
                  }

                  const productData = productDoc.data()

                  if (!productData.rating) {
                    productData.rating = 0
                  }

                  if (!productData.ratingCount) {
                    productData.ratingCount = 0
                  }

                  const _newRating = (productData.rating * productData.ratingCount + rating) / (productData.ratingCount + 1)
                  const newRating = Math.round(_newRating * 100) / 100
                  const newRatingCount = productData.ratingCount + 1

                  await updateDoc(productRef, {
                    rating: newRating,
                    ratingCount: newRatingCount
                  }, { merge: true })

                  setIsLoading(null)

                  setAlert({
                    title: 'Success',
                    message: 'Thank you for your feedback!',
                    positiveLabel: 'OK',
                    positiveCallback: () => {
                      setAlert(null)
                      navigation.goBack()
                    }
                  })
                }}
                reviewSize={24}
                reviewColor={COLORS.COLOR_01}
              />
            </>
            :
            <View>
              <View style={{
                padding: 16,
                borderWidth: 2,
                borderColor: COLORS.COLOR_01,
                borderRadius: 12,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0
              }}>
                <QRCode
                  value={JSON.stringify({
                    id: data.id,
                    index: data.__index,
                  })}
                  size={200}
                  color={COLORS.COLOR_01}
                />
              </View>

              <Text style={{
                fontSize: 18,
                fontFamily: 'NunitoSans-SemiBold',
                color: COLORS.COLOR_06,
                backgroundColor: COLORS.COLOR_01,
                paddingVertical: 6,
                textAlign: 'center',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12
              }}>
                Scan QR Code
              </Text>
            </View>
        }
      </View>
    </SafeAreaView>
  )
}

export default QRCodeScreen

const styles = StyleSheet.create({}) 