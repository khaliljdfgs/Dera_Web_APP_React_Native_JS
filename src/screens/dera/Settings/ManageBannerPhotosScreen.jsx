import React, { useEffect, useState } from 'react'
import { Pressable, StyleSheet, View, Text, ScrollView, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { MaterialIcons } from '@expo/vector-icons'
import uuidv4 from 'uuid'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomIconButton from '../../../components/CustomIconButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomImagePicker from '../../../components/CustomImagePicker'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ManageBannerPhotosScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [images, setImages] = useState(['', '', '', ''])
  const [uploadedImages, setUploadedImages] = useState(['', '', '', ''])

  const [imageOne, setImageOne] = useState('')
  const [pickImageOne, setPickImageOne] = useState(false)

  const [imageTwo, setImageTwo] = useState('')
  const [pickImageTwo, setPickImageTwo] = useState(false)

  const [imageThree, setImageThree] = useState('')
  const [pickImageThree, setPickImageThree] = useState(false)

  const [imageFour, setImageFour] = useState('')
  const [pickImageFour, setPickImageFour] = useState(false)

  const GetBannerPhotos = async () => {
    setIsLoading('Loading Photos...')
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const userRef = doc(Firestore, 'users', currentUser.uid)

    const userDoc = await getDoc(userRef)
    const user = userDoc.data()

    if (user.bannerPhotos?.length === 0 || !user.bannerPhotos) {
      setImages(['', '', '', ''])
      setUploadedImages(['', '', '', ''])
    } else {
      setImages(user.bannerPhotos)
      setUploadedImages(user.bannerPhotos)
    }
    setIsLoading(null)
  }

  useEffect(() => { GetBannerPhotos() }, [])

  const HandleSavePhotos = () => {
    const SavePhotos = async () => {
      setIsLoading('Saving Photos...')

      const UploadImage = async (image, uploadedImage, message) => {
        const isImageChanged = image.startsWith('file') && uploadedImage.startsWith('http')
        const isImageDeleted = !image && uploadedImage.startsWith('http')

        if (isImageChanged) {
          const imageRef = ref(Storage, uploadedImage.split('.com/o/')[1].split('?')[0])
          await deleteObject(imageRef)
        }

        if (isImageDeleted) {
          const imageRef = ref(Storage, uploadedImage.split('.com/o/')[1].split('?')[0])
          await deleteObject(imageRef)
          return 'deleted'
        }

        if (image.startsWith('file')) {
          setIsLoading('Compressing...')
          const { uri } = await manipulateAsync(image,
            [{ resize: { width: 1080 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
          )

          setIsLoading(message)
          const imageBlob = await (await fetch(uri)).blob()
          const reference = ref(Storage, `${uuidv4()}`)
          const uploadResponse = await uploadBytes(reference, imageBlob)
          const url = await getDownloadURL(uploadResponse.ref)
          return url
        }

        return 'no-change'
      }

      const bannerPhotos = ['', '', '', '']

      let response = await UploadImage(images[0], uploadedImages[0], 'Uploading Photo 1/4...')
      if (response === 'deleted') bannerPhotos[0] = ''
      else if (response === 'no-change') bannerPhotos[0] = uploadedImages[0]
      else bannerPhotos[0] = response

      response = await UploadImage(images[1], uploadedImages[1], 'Uploading Photo 2/4...')
      if (response === 'deleted') bannerPhotos[1] = ''
      else if (response === 'no-change') bannerPhotos[1] = uploadedImages[1]
      else bannerPhotos[1] = response

      response = await UploadImage(images[2], uploadedImages[2], 'Uploading Photo 3/4...')
      if (response === 'deleted') bannerPhotos[2] = ''
      else if (response === 'no-change') bannerPhotos[2] = uploadedImages[2]
      else bannerPhotos[2] = response

      response = await UploadImage(images[3], uploadedImages[3], 'Uploading Photo 4/4...')
      if (response === 'deleted') bannerPhotos[3] = ''
      else if (response === 'no-change') bannerPhotos[3] = uploadedImages[3]
      else bannerPhotos[3] = response

      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      const userRef = doc(Firestore, 'users', currentUser.uid)

      await setDoc(userRef, {
        bannerPhotos,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      setIsLoading(null)
    }

    setAlert({
      title: 'Save Photos',
      message: 'Are you sure you want to save these photos?',
      positiveLabel: 'Save',
      positiveCallback: async () => {
        setAlert(null)

        try {
          await SavePhotos()
          navigation.goBack()
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
      negativeLabel: 'Cancel',
      negativeCallback: () => setAlert(null),
    })
  }

  if (imageOne) {
    setImages([imageOne, ...images.slice(1, 4)])
    setImageOne('')
  }

  if (imageTwo) {
    setImages([...images.slice(0, 1), imageTwo, ...images.slice(2, 4)])
    setImageTwo('')
  }

  if (imageThree) {
    setImages([...images.slice(0, 2), imageThree, ...images.slice(3, 4)])
    setImageThree('')
  }

  if (imageFour) {
    setImages([...images.slice(0, 3), imageFour])
    setImageFour('')
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Manage Banner Photos' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
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

      <CustomAppBar title='Manage Banner Photos' onGoBack={() => navigation.goBack()} />
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
                        }}
                      />
                      <CustomIconButton
                        icon={<MaterialIcons name='delete' size={24} color={COLORS.COLOR_04} />}
                        containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 20, padding: 8 }}
                        onPress={() => {
                          const Callback = () => {
                            if (index === 0) setImages(['', images[1], images[2], images[3]])
                            else if (index === 1) setImages([images[0], '', images[2], images[3]])
                            else if (index === 2) setImages([images[0], images[1], '', images[3]])
                            else if (index === 3) setImages([images[0], images[1], images[2], ''])
                            setAlert(null)
                          }

                          setAlert({
                            message: 'Are you sure you want to delete this banner photo?',
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
                      }}>Add Banner Photo 0{index + 1}</Text>
                    </View>
                  </Pressable>
                </View>
              )
            })
          }

          <CustomButton
            title='Save Photos'
            containerStyle={{ backgroundColor: COLORS.SUCCESS }}
            leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
            onPress={HandleSavePhotos}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ManageBannerPhotosScreen

const styles = StyleSheet.create({}) 