import React, { useState } from 'react'
import { StyleSheet, View, Image, Dimensions, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Carousel from 'react-native-reanimated-carousel'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import ROUTES from '../../../config/routes'
import COLORS from '../../../config/colors'
import { LIVESTOCK_STATUS } from '../../../config/values'

const ViewLiveStockScreen = ({ navigation, route }) => {
  const screenWidth = Dimensions.get('window').width

  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { liveStock, fromSoldOut } = route.params

  const HandleContactToMakeADeal = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const liveStockData = JSON.parse(await AsyncStorage.getItem('liveStocks')).filter(x => liveStock.id === x.id)[0]

    const isAlreadyRequested = liveStockData.requests?.filter(request => request === currentUser.uid).length > 0

    if (isAlreadyRequested) {
      setAlert({
        title: 'Info',
        message: 'You have already requested to buy this livestock. Please wait for the owner to respond.',
        positiveLabel: 'Chat',
        positiveCallback: () => {
          const payload = { user: liveStock.owner, currentUser: currentUser }
          navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
        },
        negativeLabel: 'Cancel',
        negativeCallback: () => setAlert(null),
      })
    } else {
      const payload = {
        user: liveStock.owner,
        currentUser: currentUser,
        message: `I would like to buy your livestock titled as "${liveStock.liveStockTitle}". Please let me know if you are interested.`,
        requestForLivestock: {
          id: liveStock.id,
          requests: liveStock.requests || [],
        },
      }
      navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
    }
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title={liveStock.liveStockTitle} onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title={liveStock.liveStockTitle} onGoBack={() => navigation.goBack()} />

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
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {liveStock.liveStockDescription}
          </Text>

          <CustomTable
            heading='Livestock Details'
            data={[
              { left: 'Price', right: `Rs. ${liveStock.liveStockPrice}` },
              { left: 'Status', right: liveStock.liveStockStatus.toUpperCase() },
              { left: 'Category', right: liveStock.liveStockCategory },
              { left: 'Breed', right: liveStock.liveStockFeatures.breed || 'Not Set' },
              {
                left: 'Offered By',
                right: liveStock.owner.businessName,
                onPress: () => {
                  const payload = { user: liveStock.owner, distanceString: liveStock.owner.distanceString }
                  navigation.navigate(ROUTES.CONSUMER.VIEW_DERA_PROFILE, payload)
                }
              },
              { left: 'Distance', right: liveStock.owner.distanceString },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomTable
            heading='Extra Features'
            data={[
              { left: 'Color', right: liveStock.liveStockFeatures.color },
              { left: '~ Age', right: `${liveStock.liveStockFeatures.age.day} days, ${liveStock.liveStockFeatures.age.month} months, ${liveStock.liveStockFeatures.age.year} years` },
              { left: 'Height', right: `${Math.floor(liveStock.liveStockFeatures.height / 12)} ft. ${liveStock.liveStockFeatures.height % 12} in.` },
              { left: 'Weight', right: `${liveStock.liveStockFeatures.weight} Kg` },
              { left: 'Teeth', right: liveStock.liveStockFeatures?.teeth || 0 },
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
            liveStock.liveStockStatus === LIVESTOCK_STATUS.AVAILABLE && !fromSoldOut &&
            <CustomButton
              onPress={HandleContactToMakeADeal}
              title='Contact To Make A Deal'
              containerStyle={{ flex: 1 }}
              leftIcon={<MaterialCommunityIcons name='android-messages' size={24} color={COLORS.COLOR_06} />}
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
}) 