import React from 'react'
import { StyleSheet, Text, View, Image, Dimensions, Touchable } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'

import COLORS from '../../config/colors'

import IMAGE_PLACEHOLDER from '../../../assets/images/image-placeholder.png'
import IMAGE_PLACEHOLDER_SQUARE from '../../../assets/images/image-placeholder-square.png'
import { TouchableOpacity } from 'react-native'

const HeaderHomeScreen = ({
  images = [null],
  noImagePlaceHolderText = 'Upload Banner Photo',
  profilePhoto = '',
  username = '',
  address = '',
  isViewMode = false,
  onPress = () => { },
}) => {
  const screenWidth = Dimensions.get('window').width

  return (
    <View>
      <Carousel
        loop
        width={screenWidth}
        height={200}
        autoPlay={true}
        data={images || []}
        scrollAnimationDuration={1000}
        autoPlayInterval={5000}
        renderItem={({ item }) => {
          return (
            <View style={styles.bannerContainer}>
              {
                item && <Image source={{ uri: item }} style={styles.bannerPhoto} />
              }

              {
                item === null &&
                <>
                  <Image source={IMAGE_PLACEHOLDER} style={styles.bannerPlaceholder} />
                  <Text style={styles.uploadBannerPhoto}>{noImagePlaceHolderText}</Text>
                </>
              }
            </View>
          )
        }}
      />

      <View style={styles.infoContainer}>
        <Image style={{ ...styles.profileImage, backgroundColor: COLORS.COLOR_06 }}
          source={
            profilePhoto.length > 0
              ? { uri: profilePhoto }
              : IMAGE_PLACEHOLDER_SQUARE
          } />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Ubuntu-Medium', color: COLORS.COLOR_06 }} numberOfLines={1} ellipsizeMode='tail'>
            {username}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
            marginRight: 16,
          }}>
            <FontAwesome5 name="location-arrow" size={10} color={COLORS.COLOR_06} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{
              fontSize: 15,
              fontFamily: 'Ubuntu-Regular',
              color: COLORS.COLOR_06,
              ...(isViewMode ? { flex: 1 } : { width: screenWidth - 140 }),
            }}>{address}</Text>
          </View>
        </View>

        {
          isViewMode
            ?
            <TouchableOpacity style={{ justifyContent: 'center' }} activeOpacity={0.8} onPress={onPress}>
              <MaterialIcons name='message' size={28} color={COLORS.COLOR_06} />
            </TouchableOpacity>
            :
            <></>
        }
      </View>
    </View>
  )
}

export default HeaderHomeScreen

const styles = StyleSheet.create({
  bannerContainer: {
    flex: 1,
    backgroundColor: COLORS.COLOR_06,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerPhoto: {
    resizeMode: 'cover',
    backgroundColor: COLORS.COLOR_06,
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    resizeMode: 'contain',
    width: '100%',
    height: '40%',
    tintColor: '#8a8a8a'
  },
  uploadBannerPhoto: {
    fontSize: 18,
    color: '#8a8a8a',
    fontFamily: 'NunitoSans-Regular',
    paddingTop: 12,
  },
  infoContainer: {
    backgroundColor: COLORS.COLOR_01,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14
  },
  profileImage: {
    resizeMode: 'center',
    width: 80,
    height: 80,
    marginTop: -40,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.COLOR_05,
    overflow: 'hidden',
  },
})