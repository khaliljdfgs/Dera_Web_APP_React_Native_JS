import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Feather } from '@expo/vector-icons'
import { collection, serverTimestamp, addDoc, setDoc, doc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomDropDownPicker from '../../../components/CustomDropDownPicker'

import COLORS from '../../../config/colors'
import { Firestore } from '../../../config/firebase'
import { DAIRY_PRODUCT_ORDER_STATUS, NOTIFICATION_TYPES } from '../../../config/values'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputNumberValidation } from '../../../utils/Validation'
import { DairyProductDeliveryTimeValues, DairyProductOrderSubscriptionValues } from '../../../data/DairyProductOrderValues'

const PlaceOrderNowScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { product, isSubscriptionMode } = route.params

  const [quantity, setQuantity] = useState('')

  const [deliveryTimeDropDownOpen, setDeliveryTimeDropDownOpen] = useState(false)
  const [deliveryTimeDropDownValue, setDeliveryTimeDropDownValue] = useState(null)
  const [deliveryTimeDropDownItems, setDeliveryTimeDropDownItems] = useState(DairyProductDeliveryTimeValues)

  const [subscriptionDropDownOpen, setSubscriptionDropDownOpen] = useState(false)
  const [subscriptionDropDownValue, setSubscriptionDropDownValue] = useState(null)
  const [subscriptionDropDownItems, setSubscriptionDropDownItems] = useState(DairyProductOrderSubscriptionValues)

  const HandleConfirmOrder = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

    const ConfirmOrder = async () => {
      setIsLoading('Placing Order...')

      try {
        const payload = {
          deliveryTime: deliveryTimeDropDownValue,
          quantity: parseInt(quantity),
          status: DAIRY_PRODUCT_ORDER_STATUS.PENDING,
          isSubscription: isSubscriptionMode ? true : false,
          isSingleOrder: isSubscriptionMode ? false : true,
          product: product.id,
          owner: product.owner.id,
          placedBy: currentUser.uid,
        }

        if (isSubscriptionMode) {
          payload.subscriptionPeriod = parseInt(subscriptionDropDownValue)
          payload.dailyStatus = []

          for (let i = 0; i < payload.subscriptionPeriod; i++) {
            payload.dailyStatus.push(DAIRY_PRODUCT_ORDER_STATUS.PENDING)
          }
        }

        payload.placedOn = serverTimestamp()

        const order = await addDoc(collection(Firestore, 'dairyProductOrders'), payload)

        const notificationPayload = {
          type: isSubscriptionMode
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REQUEST
            : NOTIFICATION_TYPES.DAIRY_ORDER_PLACED,
          productId: product.id,
          orderId: order.id,
          receiver: product.owner.id,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        await setDoc(doc(Firestore, 'products', product.id), { purchasedCount: (product.purchasedCount || 0) + 1 }, { merge: true })

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: isSubscriptionMode
            ? 'Your subscription request has been placed successfully. You will be notified once the seller accepts your request.'
            : 'Your order has been placed successfully. You will be notified once the seller accepts your order.',
          positiveLabel: 'OK',
          positiveCallback: () => {
            setAlert(null)
            navigation.goBack()
          },
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          title: 'Error',
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    }

    let validation = InputNumberValidation({ field: 'Quantity', value: quantity, min: 1, max: Infinity })

    if (deliveryTimeDropDownValue === null) {
      setAlert({
        title: 'Warning',
        message: 'Please Select Delivery Time!',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    } else if (isSubscriptionMode && subscriptionDropDownValue === null) {
      setAlert({
        title: 'Warning',
        message: 'Please Select Subscription Period!',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    } else if (validation !== null) {
      setAlert({
        title: 'Warning',
        message: validation,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
    } else {
      setAlert({
        title: 'Confirm Order',
        message: `Are you sure you want to place order for ${quantity} ${product.priceUnit} of ${product.productName}?`,
        positiveLabel: 'Yes',
        positiveCallback: async () => {
          setAlert(null)
          await ConfirmOrder()
        },
        negativeLabel: 'No',
        negativeCallback: () => {
          setIsLoading(null)
          setAlert(null)
        }
      })
    }
  }

  const HandleCOnfirmSubscription = async () => { }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title={
          isSubscriptionMode ? 'Make Subscription' : 'Place Order Now'
        } onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title={
        isSubscriptionMode ? 'Make Subscription' : 'Place Order Now'
      } onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ padding: 20, gap: 16 }}>
          <View style={{ zIndex: 10 }}>
            <CustomDropDownPicker
              onOpen={() => setSubscriptionDropDownOpen(false)}
              label='Delivery Time'
              placeholder='Select Delivery Time'
              open={deliveryTimeDropDownOpen}
              value={deliveryTimeDropDownValue}
              items={deliveryTimeDropDownItems}
              setOpen={setDeliveryTimeDropDownOpen}
              setValue={setDeliveryTimeDropDownValue}
              setItems={setDeliveryTimeDropDownItems}
              containerStyle={{ flex: 1 }}
            />
          </View>

          {
            isSubscriptionMode &&
            <View style={{ zIndex: 9 }}>
              <CustomDropDownPicker
                onOpen={() => setDeliveryTimeDropDownOpen(false)}
                label='Subscription Period'
                placeholder='Select Subscription Period'
                open={subscriptionDropDownOpen}
                value={subscriptionDropDownValue}
                items={subscriptionDropDownItems}
                setOpen={setSubscriptionDropDownOpen}
                setValue={setSubscriptionDropDownValue}
                setItems={setSubscriptionDropDownItems}
                containerStyle={{ flex: 1 }}
              />
            </View>
          }

          <CustomTextInput
            label={`Quantity (Per ${product.priceUnit})`}
            placeholder={`Enter quantity in ${product.priceUnit}s`}
            onChangeText={(text) => {
              if (/^\d+$/.test(text) || text === '') {
                setQuantity(text)
              }
            }}
            value={quantity}
            keyboardType='numeric'
            maxLength={10}
          />

          <CustomButton
            onPress={HandleConfirmOrder}
            title={isSubscriptionMode ? 'Confirm Subscription' : 'Confirm Order'}
            containerStyle={{ justifyContent: 'flex-start' }}
            leftIcon={<Feather name='box' size={24} color={COLORS.COLOR_06} />}
            rightIcon={<Feather name='chevron-right' size={24} color={COLORS.COLOR_06} />}
            textStyle={{ flex: 1 }}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default PlaceOrderNowScreen

const styles = StyleSheet.create({})