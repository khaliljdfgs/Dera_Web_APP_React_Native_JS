import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, Text, View, Dimensions, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons'
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import Carousel from 'react-native-reanimated-carousel'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import uuidv4 from 'uuid'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'

import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'
import CustomDropDownPicker from '../../../components/CustomDropDownPicker'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputNumberValidation, InputStringValidation } from '../../../utils/Validation'
import { LiveStockCategoryValues } from '../../../data/LiveStockValues'
import { LIVESTOCK_STATUS } from '../../../config/values'

import IMAGE_PLACEHOLDER from '../../../../assets/images/image-placeholder.png'

const AddLiveStockScreen = ({ navigation }) => {
  const screenWidth = Dimensions.get('window').width
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState({})
  const [images, setImages] = useState(['', '', '', '', ''])
  const [uploadedImages, setUploadedImages] = useState(['', '', '', '', ''])

  const [categoryDropDownOpen, setCategoryDropDownOpen] = useState(false)
  const [categoryDropDownValue, setCategoryDropDownValue] = useState(null)
  const [categoryDropDownItems, setCategoryDropDownItems] = useState(LiveStockCategoryValues)

  const Refresh = async () => {
    const features = JSON.parse(await AsyncStorage.getItem('liveStockFeatures')) || {}
    setFeatures(features)

    const images = JSON.parse(await AsyncStorage.getItem('liveStockImages')) || ['', '', '', '', '']
    setImages(images)
  }

  const FreeUpMemory = async () => {
    await AsyncStorage.removeItem('liveStockFeatures')
    await AsyncStorage.removeItem('liveStockImages')
  }

  useEffect(() => { return () => FreeUpMemory() }, [])

  useFocusEffect(useCallback(() => { Refresh() }, []))

  const FetchPredictedValues = async (image_urls) => {
    setIsLoading('Making Predictions...')
    const ENDPOINT = await AsyncStorage.getItem('demo_url')

    const response = await fetch(`${ENDPOINT}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url_1: image_urls[0],
        url_2: image_urls[1],
        url_3: image_urls[2],
        url_4: image_urls[3],
        url_5: image_urls[4],
      })
    })

    const data = await response.json()
    const predictions = {}
    const _data_ = []

    if (data.url_1 instanceof Object) {
      const x = {}
      x.breed = data.url_1.breed.breed
      x.confidence = data.url_1.breed.probability
      x.weight = data.url_1.weight_and_height.weight
      x.height = data.url_1.weight_and_height.height
      _data_.push(x)
    }

    if (data.url_2 instanceof Object) {
      const x = {}
      x.breed = data.url_2.breed.breed
      x.confidence = data.url_2.breed.probability
      x.weight = data.url_2.weight_and_height.weight
      x.height = data.url_2.weight_and_height.height
      _data_.push(x)
    }

    if (data.url_3 instanceof Object) {
      const x = {}
      x.breed = data.url_3.breed.breed
      x.confidence = data.url_3.breed.probability
      x.weight = data.url_3.weight_and_height.weight
      x.height = data.url_3.weight_and_height.height
      _data_.push(x)
    }

    if (data.url_4 instanceof Object) {
      const x = {}
      x.breed = data.url_4.breed.breed
      x.confidence = data.url_4.breed.probability
      x.weight = data.url_4.weight_and_height.weight
      x.height = data.url_4.weight_and_height.height
      _data_.push(x)
    }

    if (data.url_5 instanceof Object) {
      const x = {}
      x.breed = data.url_5.breed.breed
      x.confidence = data.url_5.breed.probability
      x.weight = data.url_5.weight_and_height.weight
      x.height = data.url_5.weight_and_height.height
      _data_.push(x)
    }

    predictions.breed = _data_.filter((x) => x.confidence === Math.max(..._data_.map((x) => x.confidence)))[0].breed
    predictions.confidence = _data_.filter((x) => x.confidence === Math.max(..._data_.map((x) => x.confidence)))[0].confidence
    predictions.weight = _data_.filter((x) => x.weight === Math.max(..._data_.map((x) => x.weight)))[0].weight
    predictions.height = _data_.filter((x) => x.height === Math.max(..._data_.map((x) => x.height)))[0].height

    const confidence_adjustment = Math.floor(Math.random() * (3 - 2 + 1) + 1)
    const weight_adjustment = Math.floor(Math.random() * (10 - 2 + 1) + 2)
    const height_adjustment = Math.floor(Math.random() * (6 - 2 + 1) + 2)

    predictions.confidence = (predictions.confidence * 100) - confidence_adjustment
    predictions.weight = predictions.weight - weight_adjustment
    predictions.height = predictions.height + height_adjustment

    setIsLoading(null)

    return predictions
  }

  const SaveData = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

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
        setIsLoading(`Compressing ${message.split('Uploading Photo ')[1]}`)
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

    const liveStockPhotos = ['', '', '', '', '']

    for (let i = 0; i < uploadedImages.length; i++) {
      let response = await UploadImage(images[i], uploadedImages[i], `Uploading Photo ${i + 1}/${uploadedImages.length}...`)
      if (response === 'deleted') liveStockPhotos[i] = ''
      else if (response === 'no-change') liveStockPhotos[i] = uploadedImages[i]
      else liveStockPhotos[i] = response
    }

    const predictions = categoryDropDownValue.trim() === 'Cow' || categoryDropDownValue.trim() === 'Buffalo'
      ? await FetchPredictedValues(liveStockPhotos) : null

    const data = {
      liveStockTitle: title.trim(),
      liveStockPrice: Number(price),
      liveStockDescription: description.trim(),
      liveStockCategory: categoryDropDownValue.trim(),
      liveStockFeatures: features,
      liveStockPhotos: liveStockPhotos,
      liveStockStatus: LIVESTOCK_STATUS.AVAILABLE,
      predictions: predictions,
      owner: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    setIsLoading('Adding Livestock...')
    await addDoc(collection(Firestore, "livestocks"), data)
    setIsLoading(null)
  }

  const HandleManageFeatures = async () => {
    if (!categoryDropDownValue) {
      setAlert({
        message: 'Please select a category first.',
        positiveLabel: 'Okay',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    navigation.navigate(ROUTES.DERA.LIVESTOCK_FEATURES, {
      category: categoryDropDownValue?.trim() || '',
      features: features
    })
  }

  const HandleManageImages = async () => {
    navigation.navigate(ROUTES.DERA.LIVESTOCK_PHOTOS, {
      images: images
    })
  }

  const HandleClear = () => {
    const ClearFields = () => {
      setTitle('')
      setPrice('')
      setDescription('')
      setCategoryDropDownValue(null)
      setCategoryDropDownOpen(false)
      setFeatures({})
      setImages(['', '', '', '', ''])
      setUploadedImages(['', '', '', '', ''])
      setAlert(null)
    }

    setAlert({
      message: 'Are you sure you want to clear all the fields?',
      positiveLabel: 'Yes',
      positiveCallback: ClearFields,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const ValidateFeatures = () => {
    if (Object.keys(features).length < 5) {
      return 'Please add livestock features!'
    }

    return null
  }

  const ValidateImages = () => {
    if (images.filter(image => image !== '').length === 0) {
      return 'Please add at least one photo!'
    }

    return null
  }

  const HandleSave = async () => {
    const validation = [
      { type: 'string', data: { field: 'Livestock Title', value: title, min: 3, max: 50 }, },
      { type: 'number', data: { field: 'Livestock Price', value: price, min: 0, max: Infinity }, },
      { type: 'string', data: { field: 'Livestock Description', value: description, min: 5, max: 250 }, },
      { type: 'string', data: { field: 'Livestock Category', value: categoryDropDownValue, min: 1, max: 50 }, },
    ]

    for (let i = 0; i < validation.length; i++) {
      const { type, data } = validation[i]

      if (type === 'string') {
        let validation = InputStringValidation(data)
        if (validation != null) {
          setAlert({ message: validation, positiveCallback: () => setAlert(null) })
          return
        }
      } else if (type === 'number') {
        let validation = InputNumberValidation(data)
        if (validation != null) {
          setAlert({ message: validation, positiveCallback: () => setAlert(null) })
          return
        }
      }
    }

    const featuresValidation = ValidateFeatures()
    if (featuresValidation) {
      setAlert({ message: featuresValidation, positiveCallback: () => setAlert(null) })
      return
    }

    const imagesValidation = ValidateImages()
    if (imagesValidation) {
      setAlert({ message: imagesValidation, positiveCallback: () => setAlert(null) })
      return
    }

    try {
      await SaveData()

      setAlert({
        title: 'Success',
        message: 'Livestock Added Successfully!',
        positiveCallback: async () => {
          await AsyncStorage.setItem('AddLiveStockDataAdded', 'true')
          navigation.goBack()
        }
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

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Add Livestock ' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Add Livestock ' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <Carousel
            width={screenWidth - 48}
            height={225}
            data={images}
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

                    {
                      item === '' &&
                      <View style={styles.placeholderContainer}>
                        <Image source={IMAGE_PLACEHOLDER} style={styles.bannerPlaceholder} />
                        <Text style={styles.uploadBannerPhoto}>Upload Livestock Photo # 0{index + 1}</Text>
                      </View>
                    }
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {
                      images.map((x, i) => {
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

          <CustomButton
            title='Manage Images'
            leftIcon={<Feather name='image' size={24} color={COLORS.COLOR_06} />}
            rightIcon={<MaterialIcons name='chevron-right' size={24} color={COLORS.COLOR_06} />}
            onPress={HandleManageImages}
            containerStyle={{ justifyContent: 'flex-start', paddingHorizontal: 12 }}
            textStyle={{ paddingHorizontal: 12, flex: 1 }}
          />

          <CustomTextInput
            value={title}
            onChangeText={(x) => setTitle(x)}
            label='Title'
            placeholder="Enter LiveStock Title" />

          <CustomTextInput
            value={price}
            onChangeText={(x) => {
              if (/^\d*\.?\d*$/.test(x)) setPrice(x)
            }}
            label='Price'
            keyboardType='numeric'
            containerStyle={{ flex: 1 }}
            placeholder=" Enter LiveStock Price (Rs.)" />

          <CustomTextInput
            value={description}
            onChangeText={(x) => setDescription(x)}
            label='Description'
            multiline={true}
            placeholder="Enter Description for LiveStock" />

          <View style={{ zIndex: 9 }}>
            <CustomDropDownPicker
              label='Category'
              placeholder='Select LiveStock Category'
              open={categoryDropDownOpen}
              value={categoryDropDownValue}
              items={categoryDropDownItems}
              setOpen={setCategoryDropDownOpen}
              setValue={setCategoryDropDownValue}
              setItems={setCategoryDropDownItems}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View style={{ gap: 20, paddingVertical: 8 }}>
            <CustomTable
              heading='Features'
              data={[
                { left: 'Breed', right: features.breed || 'Not Set', },
                { left: 'Color', right: features.color || 'Not Set', },
                { left: 'Age', right: (features.age && `${features.age.day} days ${features.age.month} months ${features.age.year} years`) || 'Not Set' },
                { left: 'Height', right: (features.height && `${Math.floor(features.height / 12)} ft. ${features.height % 12} in.`) || 'Not Set' },
                { left: 'Weight', right: (features.weight && `${features.weight} Kg`) || 'Not Set' },
                { left: 'Teeth', right: (features.teethCount && `${features.teethCount}`) || 'Not Set' },
              ]}
            />

            <CustomButton
              title='Manage Features'
              leftIcon={<AntDesign name='appstore-o' size={24} color={COLORS.COLOR_06} />}
              rightIcon={<MaterialIcons name='chevron-right' size={24} color={COLORS.COLOR_06} />}
              onPress={HandleManageFeatures}
              containerStyle={{ justifyContent: 'flex-start', paddingHorizontal: 12 }}
              textStyle={{ paddingHorizontal: 12, flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: "row", columnGap: 16 }}>
            <CustomButton
              onPress={HandleClear}
              title='Clear'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
            />
            <CustomButton
              onPress={HandleSave}
              title='Save'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
            />
          </View>

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default AddLiveStockScreen

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
    borderRadius: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 8,
    borderColor: COLORS.COLOR_01,
    borderWidth: 1,
    borderStyle: 'dashed'
  },
  bannerPlaceholder: {
    resizeMode: 'contain',
    width: '100%',
    height: '40%',
    tintColor: '#8a8a8a',
  },
  uploadBannerPhoto: {
    fontSize: 18,
    color: '#8a8a8a',
    fontFamily: 'NunitoSans-Regular',
    paddingTop: 12,
  },
})