import React, { useCallback, useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { collection, where, getDocs, and, query, serverTimestamp, setDoc, doc, addDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { useFocusEffect } from '@react-navigation/native'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore } from '../../../config/firebase'
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS } from '../../../config/values'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ViewDairyProductScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [order, setOrder] = useState(route.params.order)
  const [product, setProduct] = useState(route.params.product)
  const { fromOrderHistory } = route.params

  useFocusEffect(useCallback(() => {
    const LoadData = async () => {
      const products = JSON.parse(await AsyncStorage.getItem('dairyProducts'))
      const _product = products.find(_ => _.id === product.id)

      setProduct(_product)
    }

    if (!fromOrderHistory) {
      LoadData()
    }
  }, []))

  const HandleCancelOrder = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

    const CancelOrder = async () => {
      console.log('CancelOrder')
      setIsLoading('Cancelling...')

      const payload = {
        cancelledOn: serverTimestamp(),
        status: order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CANCELLED
          : DAIRY_PRODUCT_ORDER_STATUS.CANCELLED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', order.id), payload, { merge: true })

        const notificationPayload = {
          type: order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED
            : NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED,
          productId: product.id,
          orderId: order.id,
          receiver: order.owner,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: order.isSubscription
            ? 'Subscription has been cancelled.'
            : 'Order has been cancelled.',
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

    setAlert({
      title: 'Comfirmation',
      message: order.isSubscription
        ? 'Are you sure you want to cancel this subscription?'
        : 'Are you sure you want to cancel this order?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setAlert(null)
        await CancelOrder()
        navigation.goBack()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandlePlaceOrderNow = async () => {
    setIsLoading('Checking Status...')
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

    const orderQuery = query(collection(Firestore, 'dairyProductOrders'), and(
      where('placedBy', '==', currentUser.uid),
      where('product', '==', fromOrderHistory ? order.product.id : product.id),
      where('isSingleOrder', '==', true),
      where('isSubscription', '==', false),
      where('status', '==', DAIRY_PRODUCT_ORDER_STATUS.PENDING),
    ))

    const querySnapshot = await getDocs(orderQuery)

    if (querySnapshot.size > 0) {
      if (querySnapshot.docs[0].data().status === DAIRY_PRODUCT_ORDER_STATUS.PENDING) {
        setAlert({
          title: 'Info',
          message: 'You already have a pending order for this product.',
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    } else {
      navigation.navigate(ROUTES.CONSUMER.PLACE_ORDER_NOW, { product })
    }

    setIsLoading(null)
  }

  const HandleMakeSubscription = async () => {
    setIsLoading('Checking Status...')
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

    const orderQuery = query(collection(Firestore, 'dairyProductOrders'), and(
      where('placedBy', '==', currentUser.uid),
      where('product', '==', fromOrderHistory ? order.product.id : product.id),
      where('isSingleOrder', '==', false),
      where('isSubscription', '==', true),
      where('status', '==', DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.PENDING),
    ))

    const querySnapshot = await getDocs(orderQuery)

    if (querySnapshot.size > 0) {
      if (querySnapshot.docs[0].data().status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.PENDING) {
        setAlert({
          title: 'Info',
          message: 'You already have a pending subscription for this product.',
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    } else {
      navigation.navigate(ROUTES.CONSUMER.PLACE_ORDER_NOW, { product, isSubscriptionMode: true })
    }

    setIsLoading(null)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title={fromOrderHistory ? (
          order.isSubscription ? 'Subscription Details' : 'Order Details'
        ) : 'View Dairy Product'}
          onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title={fromOrderHistory ? (
        order.isSubscription ? 'Subscription Details' : 'Order Details'
      ) : 'View Dairy Product'} onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: fromOrderHistory ? order.product.productImage : product.productImage }}
          style={{ width: '100%', aspectRatio: 1 }}
        />

        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>
            {fromOrderHistory ? order.product.productName : product.productName}
          </Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {fromOrderHistory ? order.product.productDescription : product.productDescription}
          </Text>

          <CustomTable
            heading='Product Details'
            data={(() => {
              const data = [
                {
                  left: 'Price',
                  right: `Rs. ${fromOrderHistory ? order.product.productPrice : product.productPrice}`
                },
                {
                  left: 'Pricing Unit',
                  right: fromOrderHistory ? order.product.priceUnit : product.priceUnit
                },
                {
                  left: 'Order Type',
                  right: fromOrderHistory
                    ? `${order.product.orderType.isSingleOrder ? 'Single Order' : ''}${(order.product.orderType.isSingleOrder && order.product.orderType.isSubscription) ? ' and ' : ''}${order.product.orderType.isSubscription ? 'Subscription' : ''}`
                    : `${product.orderType.isSingleOrder ? 'Single Order' : ''}${(product.orderType.isSingleOrder && product.orderType.isSubscription) ? ' and ' : ''}${product.orderType.isSubscription ? 'Subscription' : ''}`
                },
                {
                  left: 'Category',
                  right: fromOrderHistory ? order.product.productCategory : product.productCategory
                },
                {
                  left: '~ Rating',
                  right: `${fromOrderHistory ? order.product.rating || 0 : product.rating || 0} / 5 Stars`
                },
                {
                  left: 'Rated By',
                  right: `${fromOrderHistory ? order.product.ratingCount || 0 : product.ratingCount || 0} Customers`
                },
                {
                  left: 'Purchased',
                  right: `${(fromOrderHistory ? order.product.purchasedCount : product.purchasedCount) || 0} Times`
                },
                {
                  left: 'Offered By',
                  right: fromOrderHistory ? order.product.owner.businessName : product.owner.businessName,
                  onPress: () => {
                    const payload = {
                      user: fromOrderHistory ? order.product.owner : product.owner,
                      distanceString: fromOrderHistory ? order.product.owner.distanceString : product.owner.distanceString,
                    }
                    navigation.navigate(ROUTES.CONSUMER.VIEW_DERA_PROFILE, payload)
                  }
                },
                {
                  left: 'Distance',
                  right: fromOrderHistory ? order.product.owner.distanceString : product.owner.distanceString,
                },
              ]

              return data
            })()}
            leftCellStyle={{ flex: 1.25 }}
          />

          {
            fromOrderHistory && (
              <CustomTable
                heading='Order Details'
                data={(() => {
                  const data = [
                    {
                      left: 'Order Type',
                      right: `${order.isSingleOrder ? 'Single Order' : ''}${(order.isSingleOrder && order.isSubscription) ? ' and ' : ''}${order.isSubscription ? 'Subscription' : ''}`
                    },
                    {
                      left: 'Quantity',
                      right: `${order.quantity} ${order.product.priceUnit}`,
                    },
                    {
                      left: 'Status',
                      right: `${order.status}`.toUpperCase(),
                    }
                  ]

                  if (order.placedOn) {
                    data.push({
                      left: 'Ordered',
                      right: moment(order.placedOn.toDate()).format('DD MMM YYYY, hh:mm A'),
                    })
                  }

                  if (order.confirmedOn) {
                    data.push({
                      left: 'Confirmed',
                      right: moment(order.confirmedOn.toDate()).format('DD MMM YYYY, hh:mm A'),
                    })
                  }

                  if (order.cancelledOn) {
                    data.push({
                      left: 'Cancelled',
                      right: moment(order.cancelledOn.toDate()).format('DD MMM YYYY, hh:mm A'),
                    })
                  }

                  if (order.deliveredOn) {
                    data.push({
                      left: 'Delivered',
                      right: moment(order.deliveredOn.toDate()).format('DD MMM YYYY, hh:mm A'),
                    })
                  }

                  if (order.rejectedOn) {
                    data.push({
                      left: 'Rejected',
                      right: moment(order.rejectedOn.toDate()).format('DD MMM YYYY, hh:mm A'),
                    })
                  }

                  return data
                })()}
                leftCellStyle={{ flex: 1.25 }}
              />
            )
          }

          {
            (fromOrderHistory
              ? order.product.orderType.isSingleOrder
              : product.orderType.isSingleOrder
            ) && !fromOrderHistory &&
            <CustomButton
              onPress={HandlePlaceOrderNow}
              title='Place Order Now'
              containerStyle={{ justifyContent: 'flex-start', }}
              leftIcon={<Feather name='box' size={24} color={COLORS.COLOR_06} />}
              rightIcon={<Feather name='chevron-right' size={24} color={COLORS.COLOR_06} />}
              textStyle={{ flex: 1 }}
            />
          }

          {
            (fromOrderHistory
              ? order.product.orderType.isSubscription
              : product.orderType.isSubscription
            ) && !fromOrderHistory &&
            <CustomButton
              onPress={HandleMakeSubscription}
              title='Make Subscription'
              containerStyle={{ justifyContent: 'flex-start', }}
              leftIcon={<MaterialCommunityIcons name='calendar-check' size={24} color={COLORS.COLOR_06} />}
              rightIcon={<Feather name='chevron-right' size={24} color={COLORS.COLOR_06} />}
              textStyle={{ flex: 1 }}
            />
          }

          {
            fromOrderHistory && (
              order.status === DAIRY_PRODUCT_ORDER_STATUS.PENDING ||
              order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.PENDING
            ) &&
            <CustomButton
              onPress={HandleCancelOrder}
              title='Cancel'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
            />
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewDairyProductScreen

const styles = StyleSheet.create({})