import React, { useState } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { updateDoc, serverTimestamp, doc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage'
import uuidv4 from 'uuid'
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomTextInput, { Label } from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'
import CustomDropDownPicker from '../../../components/CustomDropDownPicker'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomImagePicker from '../../../components/CustomImagePicker'
import CustomCheckBox from '../../../components/CustomCheckBox'

import COLORS from '../../../config/colors'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputNumberValidation, InputStringValidation } from '../../../utils/Validation'
import { DairyProductCategoryValues, DairyProductPricePerValues } from '../../../data/DairyProductValues'

const EditDairyProductScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { product, isFromHomeScreen } = route.params

  // To Store User Input Values
  const [title, setTitle] = useState(product.productName || '')
  const [price, setPrice] = useState(`${product.productPrice}` || '')
  const [description, setDescription] = useState(product.productDescription || '')

  // Checkboxes
  const [isSingleOrder, setIsSingleOrder] = useState(product.orderType?.isSingleOrder || false)
  const [isSubscription, setIsSubscription] = useState(product.orderType?.isSubscription || false)

  const [image, setImage] = useState(product.productImage || null)
  const [pickImage, setPickImage] = useState(false)

  const [priceDropDownOpen, setPriceDropDownOpen] = useState(false)
  const [priceDropDownValue, setPriceDropDownValue] = useState(product.priceUnit || null)
  const [priceDropDownItems, setPriceDropDownItems] = useState(DairyProductPricePerValues)

  const [categoryDropDownOpen, setCategoryDropDownOpen] = useState(false)
  const [categoryDropDownValue, setCategoryDropDownValue] = useState(product.productCategory || null)
  const [categoryDropDownItems, setCategoryDropDownItems] = useState(DairyProductCategoryValues)

  const [initialData, setInitialData] = useState({
    title: product.productName || '',
    price: `${product.productPrice}` || '',
    description: product.productDescription || '',
    isSingleOrder: product.orderType?.isSingleOrder || false,
    isSubscription: product.orderType?.isSubscription || false,
    image: product.productImage || null,
    priceDropDownValue: product.priceUnit || null,
    categoryDropDownValue: product.productCategory || null
  })

  const SaveData = async () => {
    const UploadImage = async (image, uploadedImage, message) => {
      if ((image.startsWith('file') && uploadedImage.startsWith('http')) || (!image && uploadedImage.startsWith('http'))) {
        const imageRef = ref(Storage, uploadedImage.split('.com/o/')[1].split('?')[0])
        await deleteObject(imageRef)
      }

      if (image.startsWith('file')) {
        setIsLoading('Compressing...')
        const { uri } = await manipulateAsync(image,
          [{ resize: { width: 1600, height: 1600 } }],
          { format: SaveFormat.JPEG, compress: 0.7 }
        )

        setIsLoading(message)
        const imageBlob = await (await fetch(uri)).blob()
        const reference = ref(Storage, `${uuidv4()}`)
        const uploadResponse = await uploadBytes(reference, imageBlob)
        const url = await getDownloadURL(uploadResponse.ref)
        return url
      }

      return ''
    }

    const url = await UploadImage(image, product.productImage, 'Uploading Image...')

    const data = {
      productName: title.trim(),
      productPrice: Number(price),
      productDescription: description.trim(),
      productCategory: categoryDropDownValue.trim(),
      priceUnit: priceDropDownValue.trim(),
      productImage: url || product.productImage,
      orderType: {
        isSingleOrder: isSingleOrder,
        isSubscription: isSubscription
      },
      updatedAt: serverTimestamp(),
    }

    setIsLoading('Updating Product...')
    await updateDoc(doc(Firestore, 'products', product.id), data)
    setIsLoading(null)

    await AsyncStorage.setItem('EditDairyProductDataChanged', 'true')
  }

  const HanldePickImage = () => {
    setPickImage(true)
  }

  const HandleClear = () => {
    const ClearFields = () => {
      setImage(null)
      setPickImage(false)
      setTitle('')
      setPrice('')
      setDescription('')
      setIsSingleOrder(false)
      setIsSubscription(false)
      setPriceDropDownValue(null)
      setPriceDropDownOpen(false)
      setCategoryDropDownValue(null)
      setCategoryDropDownOpen(false)
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

  const HandleUpdate = async () => {
    const validation = [
      { type: 'string', data: { field: 'Product Title', value: title, min: 3, max: 50 } },
      { type: 'number', data: { field: 'Product Price', value: price, min: 0, max: Infinity } },
      { type: 'string', data: { field: 'Price Per', value: priceDropDownValue, min: 1, max: 50 } },
      { type: 'string', data: { field: 'Product Description', value: description, min: 5, max: 250 } },
      { type: 'string', data: { field: 'Product Category', value: categoryDropDownValue, min: 1, max: 50 } },
      { type: 'string', data: { field: 'Product Image', value: image, min: 1, max: Infinity } },
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

    if (!isSingleOrder && !isSubscription) {
      setAlert({ message: 'Please Select Order Type!', positiveCallback: () => setAlert(null) })
      return
    }

    try {
      await SaveData()

      setAlert({
        title: 'Success',
        message: 'Product Updated Successfully!',
        positiveCallback: async () => {
          if (isFromHomeScreen) {
            await AsyncStorage.setItem('EditDairyProductGoToHomeScreen', 'true')
          }
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
        <CustomAppBar title='Edit Dairy Product' onGoBack={() => navigation.goBack()} />
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

      {
        pickImage &&
        <CustomImagePicker setImage={setImage} setPickImage={setPickImage} />
      }

      <CustomAppBar title='Edit Dairy Product' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          {
            image &&
            <View>
              <Label label='Product Image' />
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          }

          <CustomTextInput
            value={title}
            onChangeText={(x) => setTitle(x)}
            label='Product Title'
            placeholder='Enter Product Title' />

          <CustomTextInput
            value={description}
            onChangeText={(x) => setDescription(x)}
            label='Product Description'
            multiline={true}
            placeholder='Enter Product Description' />

          <CustomTextInput
            value={price}
            onChangeText={(x) => {
              if (/^\d*\.?\d*$/.test(x)) setPrice(x)
            }}
            label='Product Price'
            keyboardType='numeric'
            containerStyle={{ flex: 1 }}
            placeholder='Enter Price (Rs.)' />

          <View style={{ zIndex: 10 }}>
            <CustomDropDownPicker
              onOpen={() => setCategoryDropDownOpen(false)}
              label='Price Per'
              open={priceDropDownOpen}
              value={priceDropDownValue}
              items={priceDropDownItems}
              setOpen={setPriceDropDownOpen}
              setValue={setPriceDropDownValue}
              setItems={setPriceDropDownItems}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View>
            <Label label='Order Type' />
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
              <CustomCheckBox label='Single Order' status={isSingleOrder}
                onPress={() => setIsSingleOrder(!isSingleOrder)} />
              <CustomCheckBox label='Subscription' status={isSubscription}
                onPress={() => setIsSubscription(!isSubscription)} />
            </View>
          </View>

          <View style={{ zIndex: 9 }}>
            <CustomDropDownPicker
              onOpen={() => setPriceDropDownOpen(false)}
              label='Product Category'
              open={categoryDropDownOpen}
              value={categoryDropDownValue}
              items={categoryDropDownItems}
              setOpen={setCategoryDropDownOpen}
              setValue={setCategoryDropDownValue}
              setItems={setCategoryDropDownItems}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <CustomButton
            title='Pick / Capture Image'
            onPress={HanldePickImage}
            leftIcon={<MaterialIcons name='camera' size={24} color={COLORS.COLOR_06} />}
          />

          <View style={{ flexDirection: 'row', columnGap: 16 }}>
            <CustomButton
              onPress={HandleClear}
              title='Clear'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
            />
            <CustomButton
              onPress={() => {
                if (
                  `${title}`.trim() === initialData.title &&
                  `${description}`.trim() === initialData.description &&
                  `${price}`.trim() === initialData.price &&
                  `${priceDropDownValue}`.trim() === initialData.priceDropDownValue &&
                  `${categoryDropDownValue}`.trim() === initialData.categoryDropDownValue &&
                  `${image}`.trim() === initialData.image &&
                  isSingleOrder === initialData.isSingleOrder &&
                  isSubscription === initialData.isSubscription
                ) {
                  navigation.goBack()
                  return
                }

                HandleUpdate()
              }}
              title='Update'
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

export default EditDairyProductScreen

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: COLORS.COLOR_01,
    borderRadius: 8,
  }
})