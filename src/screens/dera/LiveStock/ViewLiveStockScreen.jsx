import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, Image, Dimensions, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { deleteDoc, doc } from 'firebase/firestore'
import Carousel from 'react-native-reanimated-carousel'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteObject, ref } from 'firebase/storage'
import * as Animatable from 'react-native-animatable'
import axios from 'axios'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import ROUTES from '../../../config/routes'
import COLORS from '../../../config/colors'
import { LIVESTOCK_STATUS, SERVER_URL } from '../../../config/values'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ViewLiveStockScreen = ({ navigation, route }) => {
  const screenWidth = Dimensions.get('window').width

  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const {
    liveStock,
    isFromHomeScreen,
    fromSoldOut,
    fromNotification, info,
  } = route.params

  const Refresh = async () => {
    if (isFromHomeScreen) {
      const goToHomeScreen = await AsyncStorage.getItem('EditLiveStockGoToHomeScreen')

      if (goToHomeScreen === 'true') {
        await AsyncStorage.removeItem('EditLiveStockGoToHomeScreen')
        navigation.goBack()
      }

      return
    }

    if (!fromSoldOut) {
      const result = await AsyncStorage.getItem('EditLiveStockDataChanged')
      if (result === 'true') {
        navigation.goBack()
        return
      }
    }
  }

  useFocusEffect(useCallback(() => { Refresh() }, []))

  const HandleDelete = () => {
    setAlert({
      message: 'Are you sure you want to delete this livestock?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setIsLoading('Deleting LiveStock...')
        setAlert(null)

        try {
          // const validPhotos = liveStock.liveStockPhotos.filter(photo => photo)
          // for (let i = 0; validPhotos.length; i++) {
          //   const imageRef = ref(Storage, validPhotos[i].split('.com/o/')[1].split('?')[0])
          //   await deleteObject(imageRef)
          // }

          // await deleteDoc(doc(Firestore, 'livestocks', liveStock.id))

          const response = await axios.delete(`${SERVER_URL}/livestocks/${liveStock.id}`)
          if (response.status === 200) {
            setIsLoading(null)
            await AsyncStorage.setItem('EditLiveStockDataChanged', 'true')
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
    const payload = { liveStock, isFromHomeScreen }
    navigation.navigate(ROUTES.DERA.EDIT_LIVESTOCK, payload)
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title={
          fromNotification ? 'Details' : liveStock?.liveStockTitle
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
        fromNotification ? 'Details' : liveStock?.liveStockTitle
      } onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Carousel
          width={screenWidth}
          height={260}
          data={liveStock.liveStockPhotos.filter(photo => photo)}
          loop
          scrollAnimationDuration={800}
          autoPlay
          autoPlayInterval={3000}
          renderItem={({ item, index }) => {
            return (
              <View style={{ alignItems: 'center', flex: 1, width: '100%', gap: 16 }}>
                <View style={styles.bannerContainer}>
                  {
                    item && <Image source={{ uri: item }} style={styles.bannerPhoto} />
                  }
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                  {
                    liveStock.liveStockPhotos.filter(photo => photo).map((x, i) => {
                      return (
                        <View key={i} style={{
                          width: index === i ? 20 : 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: index === i ? COLORS.COLOR_04 : COLORS.COLOR_01,
                        }} />
                      )
                    })
                  }
                </View>
              </View>
            )
          }}
        />

        {/* <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{liveStock.liveStockTitle}</Text>
        </View> */}

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, paddingTop: 8 }}>

          {
            fromNotification &&
            <Animatable.View animation='fadeInRight' duration={1750} style={styles.noticeContainer}>
              <Text style={styles.noticeHeading}>Rejected</Text>
              <Text style={styles.noticeText}>{info.message}</Text>
            </Animatable.View>
          }

          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {liveStock.liveStockDescription}
          </Text>

          {
            fromSoldOut && !fromNotification &&
            <CustomTable
              heading='Sold Out Details'
              data={[
                { left: 'Fullname', right: liveStock.soldOutTo.fullname },
                { left: 'Email', right: liveStock.soldOutTo.email },
                {
                  left: 'Phone',
                  right: (liveStock.soldOutTo.phone && `${liveStock.soldOutTo.phone?.primary}${liveStock.soldOutTo.phone?.secondary ? `\n${liveStock.soldOutTo.phone?.secondary}` : ''}`) || 'N/A',
                },
                { left: 'Distance', right: liveStock.soldOutTo.distanceString },
                { left: 'Address', right: liveStock.soldOutTo.address },
              ]}
              leftCellStyle={{ flex: 1.25 }}
            />
          }

          <CustomTable
            heading='Livestock Details'
            data={(() => {
              const data = [
                { left: 'Price', right: `Rs. ${liveStock.liveStockPrice}` },
                ...(
                  liveStock.liveStockStatus === LIVESTOCK_STATUS.SOLD_OUT ?
                    [
                      { left: 'Status', right: liveStock.liveStockStatus.toUpperCase() },
                      // { left: 'Sold Out To', right: liveStock.soldOutToString, numberOfLines: 3 },
                    ]
                    : [{ left: 'Status', right: liveStock.liveStockStatus.toUpperCase() }]
                ),
                { left: 'Category', right: liveStock.liveStockCategory },
                { left: 'Breed', right: liveStock.liveStockFeatures.breed || 'Not Set' },
              ]

              if (fromNotification) data.push({ left: 'Title', right: liveStock.liveStockTitle })
              return data
            })()}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomTable
            heading='Extra Features'
            data={[
              { left: 'Color', right: liveStock.liveStockFeatures.color },
              { left: '~ Age', right: `${liveStock.liveStockFeatures.age.day} days, ${liveStock.liveStockFeatures.age.month} months, ${liveStock.liveStockFeatures.age.year} years` },
              { left: 'Height', right: `${Math.floor(liveStock.liveStockFeatures.height / 12)} ft. ${liveStock.liveStockFeatures.height % 12} in.` },
              { left: 'Weight', right: `${liveStock.liveStockFeatures.weight} Kg` },
              { left: 'Teeth', right: liveStock.liveStockFeatures.teeth || 'Not Set' },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          {
            liveStock.predictions &&
            <CustomTable
              heading='Estimated Values'
              data={(() => {
                const upperCaseEachFirstLetter = (str) => {
                  return str.split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
                }

                return [
                  { left: 'Breed', right: upperCaseEachFirstLetter(liveStock.predictions?.breed) },
                  {
                    left: 'Confidence', right: `${(
                      Number(liveStock.predictions?.confidence) > 90
                        ? (Number(liveStock.predictions?.confidence) - Math.round((Number(liveStock.predictions?.confidence) / 10)))
                        : Number(liveStock.predictions?.confidence)
                    ).toFixed(2)} %`
                  },
                  {
                    left: 'Height', right: `${Math.floor(liveStock.predictions?.height / 12)} ft. ${Number(liveStock.predictions?.height % 12).toFixed(2)} in.`
                  },
                  { left: 'Weight', right: `${Number(liveStock.predictions?.weight).toFixed(2)} Kg` },
                ]
              })()}
              leftCellStyle={{ flex: 1.25 }}
            />
          }

          {
            !fromSoldOut &&
            <View style={{ flexDirection: 'row', columnGap: 16 }}>
              <CustomButton
                onPress={HandleDelete}
                title='Delete'
                containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
              />
              {
                liveStock.liveStockStatus === LIVESTOCK_STATUS.REJECTED ? null :
                  <CustomButton
                    onPress={HandleEdit}
                    title='Edit'
                    containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                    leftIcon={<MaterialIcons name='edit' size={24} color={COLORS.COLOR_06} />}
                  />
              }
            </View>
          }

          {
            fromNotification &&
            <CustomButton
              onPress={() => {
                navigation.navigate(ROUTES.COMMON.SUBMIT_QUERY)
              }}
              title='Submit Query'
              containerStyle={{ flex: 1 }}
              leftIcon={<MaterialCommunityIcons name='note-outline' size={24} color={COLORS.COLOR_06} />}
            />
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewLiveStockScreen

const styles = StyleSheet.create({
  bannerContainer: {
    flex: 1,
    backgroundColor: COLORS.COLOR_06,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  bannerPhoto: {
    resizeMode: 'cover',
    backgroundColor: COLORS.COLOR_06,
    width: '100%',
    height: '100%',
  },
  noticeContainer: {
    padding: 16,
    borderRadius: 6,
    backgroundColor: COLORS.COLOR_04
  },
  noticeHeading: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Bold',
    textTransform: 'uppercase',
    color: COLORS.COLOR_06,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_06,
  }
})