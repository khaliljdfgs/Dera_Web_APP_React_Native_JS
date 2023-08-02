import React, { useState } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import uuidv4 from 'uuid'
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'

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

const AddDairyProductScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  // Checkboxes
  const [isSingleOrder, setIsSingleOrder] = useState(false)
  const [isSubscription, setIsSubscription] = useState(false)

  const [image, setImage] = useState(null)
  const [pickImage, setPickImage] = useState(false)

  const [priceDropDownOpen, setPriceDropDownOpen] = useState(false)
  const [priceDropDownValue, setPriceDropDownValue] = useState(null)
  const [priceDropDownItems, setPriceDropDownItems] = useState(DairyProductPricePerValues)

  const [categoryDropDownOpen, setCategoryDropDownOpen] = useState(false)
  const [categoryDropDownValue, setCategoryDropDownValue] = useState(null)
  const [categoryDropDownItems, setCategoryDropDownItems] = useState(DairyProductCategoryValues)

  const SaveData = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

    setIsLoading('Compresing Image...')
    const manipulationResult = await manipulateAsync(image,
      [{ resize: { width: 1600, height: 1600 } }],
      { format: SaveFormat.JPEG, compress: 0.7 }
    )

    setIsLoading('Uploading Image...')
    const imageBlob = await (await fetch(manipulationResult.uri)).blob()
    const reference = ref(Storage, `${uuidv4()}`)
    const uploadResponse = await uploadBytes(reference, imageBlob)
    const url = await getDownloadURL(uploadResponse.ref)

    const data = {
      productName: title.trim(),
      productPrice: Number(price),
      productDescription: description.trim(),
      productCategory: categoryDropDownValue.trim(),
      priceUnit: priceDropDownValue.trim(),
      productImage: url,
      orderType: {
        isSingleOrder: isSingleOrder,
        isSubscription: isSubscription
      },
      owner: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    setIsLoading('Adding Product...')
    await addDoc(collection(Firestore, 'products'), data)
    setIsLoading(null)
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

  const HandleSave = async () => {
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
        message: 'Product Added Successfully!',
        positiveCallback: async () => {
          await AsyncStorage.setItem('AddDairyProductDataAdded', 'true')
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
        <CustomAppBar title='Add Dairy Product' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Add Dairy Product' onGoBack={() => navigation.goBack()} />
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
            placeholder='Enter Product Price (Rs.)' />

          <View style={{ zIndex: 10 }}>
            <CustomDropDownPicker
              onOpen={() => setCategoryDropDownOpen(false)}
              label='Price Per'
              placeholder='Select Pricing Measure'
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
              placeholder='Select Product Category'
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

export default AddDairyProductScreen

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: COLORS.COLOR_01,
    borderRadius: 8,
  }
})