import React, { useCallback, useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { deleteObject, ref } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment/moment'
import { doc, deleteDoc, setDoc, serverTimestamp, collection, addDoc, Timestamp } from 'firebase/firestore'
import axios from 'axios'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS, NOTIFICATION_TYPES, SERVER_URL } from '../../../config/values'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ViewDairyProductScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [currentUser, setCurrentUser] = useState(null)

  const { product, isFromHomeScreen, isFromNotifications } = route.params
  const { order, fromOrderHistory } = route.params

  useEffect(() => {
    const GetUser = async () => {
      const user = await AsyncStorage.getItem('user')
      setCurrentUser(JSON.parse(user))
    }

    GetUser()
  }, [])

  const Refresh = async () => {
    if (isFromHomeScreen) {
      const goToHomeScreen = await AsyncStorage.getItem('EditDairyProductGoToHomeScreen')

      if (goToHomeScreen === 'true') {
        await AsyncStorage.removeItem('EditDairyProductGoToHomeScreen')
        navigation.goBack()
      }

      return
    }

    const result = await AsyncStorage.getItem('EditDairyProductDataChanged')
    if (result === 'true') {
      navigation.goBack()
      return
    }
  }

  useFocusEffect(useCallback(() => { Refresh() }, []))

  const HandleDelete = () => {
    setAlert({
      message: 'Are you sure you want to delete this product?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setIsLoading('Deleting Product...')
        setAlert(null)

        try {
          // const imageRef = ref(Storage,
          //   fromOrderHistory
          //     ? order.product.productImage.split('.com/o/')[1].split('?')[0]
          //     : product.productImage.split('.com/o/')[1].split('?')[0]
          // )
          // await deleteObject(imageRef)

          // await deleteDoc(doc(Firestore, 'products', fromOrderHistory ? order.product.id : product.id))
          // setIsLoading(null)

          // await AsyncStorage.setItem('EditDairyProductDataChanged', 'true')
          // navigation.goBack()

          const response = await axios.delete(`${SERVER_URL}/dairyProducts/${product.id}`)
          if (response.status === 200) {
            setIsLoading(null)
            await AsyncStorage.setItem('EditDairyProductDataChanged', 'true')
            navigation.goBack()
          } else {
            setIsLoading(null)
            setAlert({
              title: 'Error',
              message: 'Something went wrong. Please try again later.',
              positiveLabel: 'OK',
              positiveCallback: () => setAlert(null),
            })
          }
        } catch (error) {
          setAlert({
            title: 'Error',
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null),
          })
        }

        setIsLoading(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleEdit = () => {
    const payload = { product, isFromHomeScreen }
    navigation.navigate(ROUTES.DERA.EDIT_DAIRY_PRODUCT, payload)
  }

  const HandleDeleteRecord = () => {
    const DeleteRecord = async () => {
      setIsLoading('Deleting Record...')

      try {
        // await deleteDoc(doc(Firestore, 'dairyProductOrders', order.id))
        const response = await axios.delete(`${SERVER_URL}/dairyOrders/${order.id}`)
        if (response.status === 200) {

        } else {
          setIsLoading(null)
          setAlert({
            title: 'Error',
            message: 'Something went wrong. Please try again later.',
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null),
          })
        }
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

    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to delete this record?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setAlert(null)
        await DeleteRecord()
        navigation.goBack()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleOrderDelivered = async () => {
    const OrderDelivered = async () => {
      setIsLoading('Updating Status...')

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', order.id), {
          status: order.isSubscription
            ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED
            : DAIRY_PRODUCT_ORDER_STATUS.DELIVERED,
          deliveredOn: serverTimestamp()
        }, { merge: true })

        const notificationPayload = {
          type: order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_DELIVERED
            : NOTIFICATION_TYPES.DAIRY_ORDER_DELIVERED,
          productId: product.id,
          orderId: order.id,
          receiver: order.placedBy,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        await addDoc(collection(Firestore, 'notifications'), notificationPayload)

        setAlert({
          title: 'Success',
          message: order.isSubscription
            ? 'Subscription order has been marked as delivered.'
            : 'Order has been marked as delivered.',
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

    setAlert({
      title: 'Confirmation',
      message: order.isSubscription
        ? 'Are you sure you want to mark this subscription as delivered?'
        : 'Are you sure you want to mark this order as delivered?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setAlert(null)
        await OrderDelivered()
        navigation.goBack()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleConfirmOrder = async () => {
    const ConfirmOrder = async () => {
      setIsLoading('Confirming...')

      const payload = {
        confirmedOn: serverTimestamp(),
        status: order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CONFIRMED
          : DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', order.id), payload, { merge: true })

        const notificationPayload = {
          type: order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED
            : NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED,
          productId: product.id,
          orderId: order.id,
          receiver: order.placedBy,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: order.isSubscription
            ? 'Subscription has been accepted.'
            : 'Order has been confirmed.',
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
        ? 'Are you sure you want to accept this subscription?'
        : 'Are you sure you want to confirm this order?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        ConfirmOrder()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null),
    })
  }

  const HandleCancelOrder = async () => {
    const CancelOrder = async () => {
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
          receiver: order.placedBy,
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

  const HandleRejectOrder = async () => {
    const RejectOrder = async () => {
      setIsLoading('Rejecting...')

      const payload = {
        rejectedOn: serverTimestamp(),
        status: order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.REJECTED
          : DAIRY_PRODUCT_ORDER_STATUS.REJECTED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', order.id), payload, { merge: true })

        const notificationPayload = {
          type: order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED
            : NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED,
          productId: product.id,
          orderId: order.id,
          receiver: order.placedBy,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: order.isSubscription
            ? 'Subscription has been rejected.'
            : 'Order has been rejected.',
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
        ? 'Are you sure you want to reject this subscription?'
        : 'Are you sure you want to reject this order?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setAlert(null)
        await RejectOrder()
        navigation.goBack()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='View Dairy Product' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
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

      <CustomAppBar title='View Dairy Product' onGoBack={() => navigation.goBack()} />

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
          }} numberOfLines={1} ellipsizeMode='tail'>{fromOrderHistory ? order.product.productName : product.productName}</Text>
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
                  left: 'Category',
                  right: fromOrderHistory ? order.product.productCategory : product.productCategory
                },
                {
                  left: 'Price',
                  right: `Rs. ${fromOrderHistory ? order.product.productPrice : product.productPrice}`
                },
                {
                  left: 'Pricing Unit',
                  right: fromOrderHistory ? order.product.priceUnit : product.priceUnit
                },
                {
                  left: 'Purchased',
                  right: `${(fromOrderHistory ? order.product.purchasedCount : product.purchasedCount) || 0} Times`
                },
                {
                  left: 'Order Type',
                  right: fromOrderHistory
                    ? `${order.product.orderType.isSingleOrder ? 'Single Order' : ''}${(order.product.orderType.isSingleOrder && order.product.orderType.isSubscription) ? ' and ' : ''}${order.product.orderType.isSubscription ? 'Subscription' : ''}`
                    : `${product.orderType.isSingleOrder ? 'Single Order' : ''}${(product.orderType.isSingleOrder && product.orderType.isSubscription) ? ' and ' : ''}${product.orderType.isSubscription ? 'Subscription' : ''}`
                },
                {
                  left: '~ Rating',
                  right: fromOrderHistory
                    ? `${order.product.rating || 0} / 5 Stars`
                    : `${product.rating || 0} / 5 Stars`,
                },
                {
                  left: 'Rated By',
                  right: fromOrderHistory
                    ? `${order.product.ratingCount || 0} Customers`
                    : `${product.ratingCount || 0} Customers`,
                }
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
                      left: 'Placed By',
                      right: order.orderedBy.fullname
                    },
                    {
                      left: 'Distance',
                      right: order.orderedBy.distanceString
                    },
                    {
                      left: 'Order Type',
                      right: `${order.isSingleOrder ? 'Single Order' : ''}${(order.isSingleOrder && order.isSubscription) ? ' and ' : ''}${order.isSubscription ? 'Subscription' : ''}`
                    },
                    {
                      left: 'Quantity',
                      right: `${order.quantity} ${fromOrderHistory ? order.product.priceUnit : product.priceUnit}`,
                    },
                  ]

                  const PrepareDate = (obj) => moment(
                    new Timestamp(obj.seconds, obj.nanoseconds).toDate()
                  ).format('DD MMM YYYY, hh:mm A')

                  if (order.placedOn) {
                    data.push({ left: 'Ordered', right: PrepareDate(order.placedOn) })
                  }

                  if (order.confirmedOn) {
                    data.push({ left: 'Confirmed', right: PrepareDate(order.confirmedOn) })
                  }

                  if (order.cancelledOn) {
                    data.push({ left: 'Cancelled', right: PrepareDate(order.cancelledOn) })
                  }

                  if (order.deliveredOn) {
                    data.push({ left: 'Delivered', right: PrepareDate(order.deliveredOn) })
                  }

                  if (order.rejectedOn) {
                    data.push({ left: 'Rejected', right: PrepareDate(order.rejectedOn) })
                  }

                  return data
                })()}
                leftCellStyle={{ flex: 1.25 }}
              />
            )
          }

          {
            (!isFromNotifications && !fromOrderHistory) &&
            <View style={{ flexDirection: 'row', columnGap: 16 }}>
              <CustomButton
                onPress={HandleDelete}
                title='Delete'
                containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
              />
              <CustomButton
                onPress={HandleEdit}
                title='Edit'
                containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                leftIcon={<MaterialIcons name='edit' size={24} color={COLORS.COLOR_06} />}
              />
            </View>
          }

          {/* {
            fromOrderHistory && (
              order.status === DAIRY_PRODUCT_ORDER_STATUS.DELIVERED ||
              order.status === DAIRY_PRODUCT_ORDER_STATUS.REJECTED ||
              order.status === DAIRY_PRODUCT_ORDER_STATUS.CANCELLED ||
              order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.REJECTED ||
              order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CANCELLED ||
              order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED ||
              order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.COMPLETED
            ) &&
            <CustomButton
              onPress={HandleDeleteRecord}
              title='Delete Record'
              containerStyle={{ flex: 1 }}
              leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
            />
          } */}

          {
            fromOrderHistory && (
              order.status === DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED && !order.isSubscription
            ) &&
            <View style={{ flexDirection: 'row', columnGap: 16 }}>
              <CustomButton
                onPress={HandleCancelOrder}
                title='Cancel'
                containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
              />
              <CustomButton
                onPress={HandleOrderDelivered}
                title='Delivered'
                containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              />
            </View>
          }

          {
            fromOrderHistory && (
              order.status === DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED && order.isSubscription
            ) &&
            <CustomButton
              onPress={HandleCancelOrder}
              title='Cancel Subscription'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
            />
          }

          {
            fromOrderHistory && (
              order.status === DAIRY_PRODUCT_ORDER_STATUS.PENDING
            ) &&
            <View style={{ flexDirection: 'row', columnGap: 16 }}>
              <CustomButton
                onPress={HandleRejectOrder}
                title='Reject'
                containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
              />
              <CustomButton
                onPress={HandleConfirmOrder}
                title={order.isSubscription ? 'Accept' : 'Confirm'}
                containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              />
            </View>
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewDairyProductScreen

const styles = StyleSheet.create({})