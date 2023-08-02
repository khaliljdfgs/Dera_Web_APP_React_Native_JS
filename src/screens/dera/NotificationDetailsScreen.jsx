import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { Timestamp, addDoc, collection, serverTimestamp, doc, getDoc, setDoc, } from 'firebase/firestore'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import CustomButton from '../../components/CustomButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomTable from '../../components/CustomTable'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS, NOTIFICATION_TYPES } from '../../config/values'
import { Firestore } from '../../config/firebase'
import FirebaseErrors from '../../utils/FirebaseErrors'

const NotificationDetailsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [currentUser, setCurrentUser] = useState(null)
  const { data } = route.params

  useEffect(() => {
    const GetCurrentUser = async () => {
      const user = JSON.parse(await AsyncStorage.getItem('currentUser'))
      setCurrentUser(user)
    }

    GetCurrentUser()
  }, [])


  const HandleConfirmOrder = async () => {
    const ConfirmOrder = async () => {
      setIsLoading('Confirming Order...')

      const payload = {
        confirmedOn: serverTimestamp(),
        status: data.order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CONFIRMED
          : DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', data.orderId), payload, { merge: true })

        const notificationPayload = {
          type: data.order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED
            : NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED,
          productId: data.productId,
          orderId: data.orderId,
          receiver: data.sender,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: data.order.isSubscription
            ? 'Subscription has been accepted successfully!'
            : 'Order has been confirmed successfully!',
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
      title: 'Confirmation',
      message: data.order.isSubscription
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

  const HandleRejectOrder = async () => {
    const RejectOrder = async () => {
      setIsLoading('Rejecting Order...')

      const payload = {
        rejectedOn: serverTimestamp(),
        status: data.order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.REJECTED
          : DAIRY_PRODUCT_ORDER_STATUS.REJECTED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', data.orderId), payload, { merge: true })

        const notificationPayload = {
          type: data.order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED
            : NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED,
          productId: data.productId,
          orderId: data.orderId,
          receiver: data.sender,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: data.order.isSubscription
            ? 'Subscription has been rejected successfully!'
            : 'Order has been rejected successfully!',
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
      title: 'Confirmation',
      message: data.order.isSubscription
        ? 'Are you sure you want to reject this subscription?'
        : 'Are you sure you want to reject this order?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        RejectOrder()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null),
    })
  }

  const HandleCancelOrder = async () => {
    const CancelOrder = async () => {
      setIsLoading('Cancelling Order...')

      const payload = {
        cancelledOn: serverTimestamp(),
        status: data.order.isSubscription
          ? DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CANCELLED
          : DAIRY_PRODUCT_ORDER_STATUS.CANCELLED,
      }

      try {
        await setDoc(doc(Firestore, 'dairyProductOrders', data.orderId), payload, { merge: true })

        const notificationPayload = {
          type: data.order.isSubscription
            ? NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED
            : NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED,
          productId: data.productId,
          orderId: data.orderId,
          receiver: data.sender,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: data.order.isSubscription
            ? 'Subscription has been cancelled successfully!'
            : 'Order has been cancelled successfully!',
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
      title: 'Confirmation',
      message: data.order.isSubscription
        ? 'Are you sure you want to cancel this subscription?'
        : 'Are you sure you want to cancel this order?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        CancelOrder()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null),
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Details' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Details' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: data.details.image }}
          style={{ width: '100%', aspectRatio: 1 }}
        />

        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{data.info.title}</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {data.info.message}
          </Text>

          <CustomTable
            heading='Details'
            data={(() => {
              const _data = []

              const prepareDate = (obj) => moment(
                new Timestamp(obj?.seconds, obj?.nanoseconds).toDate()
              ).format('DD MMM YYYY, hh:mm A')

              if (data.type === NOTIFICATION_TYPES.DAIRY_ORDER_PLACED
                || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED
                || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED
                || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED
                || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REQUEST
                || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED
                || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED
                || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED) {
                _data.push({
                  left: 'Product',
                  right: data.details.productName,
                  onPress: () => {
                    const payload = { product: data.details, isFromNotifications: true }
                    navigation.navigate(ROUTES.DERA.VIEW_DAIRY_PRODUCT, payload)
                  }
                })

                _data.push({
                  left: 'Quantity',
                  right: `${data.order.quantity} ${data.details.priceUnit}`,
                })

                if (data.order.placedOn) {
                  _data.push({ left: 'Ordered', right: prepareDate(data.order.placedOn) })
                }

                if (data.order.confirmedOn) {
                  _data.push({ left: 'Confirmed', right: prepareDate(data.order.confirmedOn) })
                }

                if (data.order.cancelledOn) {
                  _data.push({ left: 'Cancelled', right: prepareDate(data.order.cancelledOn) })
                }

                if (data.order.deliveredOn) {
                  _data.push({ left: 'Delivered', right: prepareDate(data.order.deliveredOn) })
                }

                if (data.order.rejectedOn) {
                  _data.push({ left: 'Rejected', right: prepareDate(data.order.rejectedOn) })
                }

                _data.push({ left: 'Placed By', right: data.user.fullname })

                _data.push({
                  left: 'Phone',
                  right: (data.user.phone && `${data.user.phone?.primary}${data.user.phone?.secondary ? `\n${data.user.phone?.secondary}` : ''}`) || 'N/A',
                })

                _data.push({ left: 'Address', right: data.user.address })
              } else if (data.type === NOTIFICATION_TYPES.SERVICE_ACCEPTED
                || data.type === NOTIFICATION_TYPES.SERVICE_COMPLETED
                || data.type === NOTIFICATION_TYPES.SERVICE_CANCELLED) {
                _data.push({
                  left: 'Service',
                  right: data.details.serviceTitle,
                  onPress: () => {
                    const payload = { service: data.details, isFromNotifications: true }
                    navigation.navigate(ROUTES.DERA.VIEW_DVM_SERVICE, payload)
                  }
                })

                _data.push({
                  left: 'Provider',
                  right: data.user.fullname,
                  onPress: () => {
                    const payload = { user: data.user, distanceString: data.details.distanceString }
                    navigation.navigate(ROUTES.DERA.VIEW_DVM_PROFILE, payload)
                  }
                })

                if (data.serviceCancelledOn) {
                  _data.push({ left: 'Cancelled', right: prepareDate(data.serviceCancelledOn) })
                }

                if (data.serviceCompletedOn) {
                  _data.push({ left: 'Completed', right: prepareDate(data.serviceCompletedOn) })
                }

                if (data.serviceAcceptedOn) {
                  _data.push({ left: 'Accepted', right: prepareDate(data.serviceAcceptedOn) })
                }
              }

              return _data
            })()}
            leftCellStyle={{ flex: 1.25 }}
          />

          {
            (data.type === NOTIFICATION_TYPES.DAIRY_ORDER_PLACED
              || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED
              || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED
              || data.type === NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED
              || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REQUEST
              || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED
              || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED
              || data.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED
            ) &&
            <View style={{ flexDirection: 'row', columnGap: 8 }}>
              {
                (
                  data.order.status === DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED ||
                  data.order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CONFIRMED
                ) &&
                <CustomButton
                  onPress={HandleRejectOrder}
                  title='Cancel'
                  containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                  leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
                />
              }

              {
                (
                  data.order.status === DAIRY_PRODUCT_ORDER_STATUS.PENDING ||
                  data.order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.PENDING
                ) &&
                <CustomButton
                  onPress={HandleCancelOrder}
                  title='Cancel'
                  containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                  leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
                />
              }

              {
                (
                  data.order.status === DAIRY_PRODUCT_ORDER_STATUS.PENDING ||
                  data.order.status === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.PENDING
                ) &&
                <CustomButton
                  onPress={HandleConfirmOrder}
                  title={data.order.isSubscription ? 'Accept' : 'Confirm'}
                  containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                  leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
                />
              }
            </View>
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default NotificationDetailsScreen

const styles = StyleSheet.create({}) 