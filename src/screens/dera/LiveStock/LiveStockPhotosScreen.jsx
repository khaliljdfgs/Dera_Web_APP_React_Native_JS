import React, { useState } from 'react'
import { Pressable, StyleSheet, View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomIconButton from '../../../components/CustomIconButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomImagePicker from '../../../components/CustomImagePicker'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'

const LiveStockPhotosScreen = ({ navigation, route }) => {
  const [alert, setAlert] = useState(null)

  const [images, setImages] = useState(route.params.images)

  const [imageOne, setImageOne] = useState('')
  const [pickImageOne, setPickImageOne] = useState(false)

  const [imageTwo, setImageTwo] = useState('')
  const [pickImageTwo, setPickImageTwo] = useState(false)

  const [imageThree, setImageThree] = useState('')
  const [pickImageThree, setPickImageThree] = useState(false)

  const [imageFour, setImageFour] = useState('')
  const [pickImageFour, setPickImageFour] = useState(false)

  const [imageFive, setImageFive] = useState('')
  const [pickImageFive, setPickImageFive] = useState(false)

  const HandleSavePhotos = async () => {
    await AsyncStorage.setItem('liveStockImages', JSON.stringify(images))
    navigation.goBack()
  }

  if (imageOne) {
    setImages([imageOne, ...images.slice(1, 5)])
    setImageOne('')
  }

  if (imageTwo) {
    setImages([...images.slice(0, 1), imageTwo, ...images.slice(2, 5)])
    setImageTwo('')
  }

  if (imageThree) {
    setImages([...images.slice(0, 2), imageThree, ...images.slice(3, 5)])
    setImageThree('')
  }

  if (imageFour) {
    setImages([...images.slice(0, 3), imageFour, ...images.slice(4, 5)])
    setImageFour('')
  }

  if (imageFive) {
    setImages([...images.slice(0, 4), imageFive])
    setImageFive('')
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

      {
        pickImageOne &&
        <CustomImagePicker setImage={setImageOne} setPickImage={setPickImageOne} aspect={[16, 9]} />
      }

      {
        pickImageTwo &&
        <CustomImagePicker setImage={setImageTwo} setPickImage={setPickImageTwo} aspect={[16, 9]} />
      }

      {
        pickImageThree &&
        <CustomImagePicker setImage={setImageThree} setPickImage={setPickImageThree} aspect={[16, 9]} />
      }

      {
        pickImageFour &&
        <CustomImagePicker setImage={setImageFour} setPickImage={setPickImageFour} aspect={[16, 9]} />
      }

      {
        pickImageFive &&
        <CustomImagePicker setImage={setImageFive} setPickImage={setPickImageFive} aspect={[16, 9]} />
      }

      <CustomAppBar title='Livestock Photos' onGoBack={() => navigation.goBack()} />
      <ScrollView>
        <View style={{ flex: 1, padding: 24, gap: 24 }}>
          {
            images.map((item, index) => {
              if (item) {
                return (
                  <View key={index} style={{
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}>
                    <Image source={{ uri: item }} style={{ width: '100%', aspectRatio: 16 / 9 }} />
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      gap: 8,
                      flexDirection: 'row',
                      padding: 8,
                    }}>
                      <CustomIconButton
                        icon={<MaterialIcons name='edit' size={24} color={COLORS.COLOR_01} />}
                        containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 20, padding: 8 }}
                        onPress={() => {
                          if (index === 0) setPickImageOne(true)
                          else if (index === 1) setPickImageTwo(true)
                          else if (index === 2) setPickImageThree(true)
                          else if (index === 3) setPickImageFour(true)
                          else if (index === 4) setPickImageFive(true)
                        }}
                      />
                      <CustomIconButton
                        icon={<MaterialIcons name='delete' size={24} color={COLORS.COLOR_04} />}
                        containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 20, padding: 8 }}
                        onPress={() => {
                          const Callback = () => {
                            if (index === 0) setImages(['', images[1], images[2], images[3], images[4]])
                            else if (index === 1) setImages([images[0], '', images[2], images[3], images[4]])
                            else if (index === 2) setImages([images[0], images[1], '', images[3], images[4]])
                            else if (index === 3) setImages([images[0], images[1], images[2], '', images[4]])
                            else if (index === 4) setImages([images[0], images[1], images[2], images[3], ''])
                            setAlert(null)
                          }

                          setAlert({
                            message: 'Are you sure you want to delete this livestock photo?',
                            positiveLabel: 'Yes',
                            positiveCallback: Callback,
                            negativeLabel: 'No',
                            negativeCallback: () => { setAlert(null) }
                          })
                        }}
                      />
                    </View>
                  </View>
                )
              }

              return (
                <View key={index} style={{
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderColor: COLORS.COLOR_01,
                  borderRadius: 8,
                  height: 80,
                  overflow: 'hidden',
                }}>
                  <Pressable android_ripple={{ color: COLORS.COLOR_01 }} style={{ flex: 1 }}
                    onPress={() => {
                      if (index === 0) setPickImageOne(true)
                      else if (index === 1) setPickImageTwo(true)
                      else if (index === 2) setPickImageThree(true)
                      else if (index === 3) setPickImageFour(true)
                      else if (index === 4) setPickImageFive(true)
                    }}>
                    <View style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 4,
                      gap: 8,
                    }}>
                      <MaterialIcons name='add-a-photo' size={30} color={COLORS.COLOR_01} />
                      <Text style={{
                        color: COLORS.COLOR_01,
                        fontSize: 16,
                        fontFamily: 'NunitoSans-Regular',
                      }}>Add Livestock Photo 0{index + 1}</Text>
                    </View>
                  </Pressable>
                </View>
              )
            })
          }

          <CustomButton
            title='Save Photos'
            leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
            onPress={HandleSavePhotos}
            containerStyle={{ backgroundColor: COLORS.SUCCESS }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LiveStockPhotosScreen

const styles = StyleSheet.create({}) 