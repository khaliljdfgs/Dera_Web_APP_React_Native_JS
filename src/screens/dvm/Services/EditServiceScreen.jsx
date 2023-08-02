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
import { ServiceChargesPerValues } from '../../../data/ServiceValues'

const EditServiceScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { service, isFromHomeScreen } = route.params

  // To Store User Input Values
  const [title, setTitle] = useState(service.serviceTitle || '')
  const [charges, setCharges] = useState(`${service.serviceCharges}` || '')
  const [description, setDescription] = useState(service.serviceDescription || '')

  // Checkboxes
  const [isRemoteTypeService, setIsRemoteTypeService] = useState(service.serviceType?.isRemote || false)
  const [isOnSiteTypeService, setIsOnSiteTypeService] = useState(service.serviceType?.isOnSite || false)

  const [image, setImage] = useState(service.serviceImage || null)
  const [pickImage, setPickImage] = useState(false)

  const [chargesPerDropDownOpen, setChargesPerDropDownOpen] = useState(false)
  const [chargesPerDropDownValue, setChargesPerDropDownValue] = useState(service.serviceChargesPer || null)
  const [chargesPerDropDownItems, setChargesPerDropDownItems] = useState(ServiceChargesPerValues)

  const [initialData, setInitialData] = useState({
    title: service.serviceTitle || '',
    charges: `${service.serviceCharges}` || '',
    description: service.serviceDescription || '',
    isRemoteTypeService: service.serviceType?.isRemote || false,
    isOnSiteTypeService: service.serviceType?.isOnSite || false,
    image: service.serviceImage || null,
    chargesPerDropDownValue: service.serviceChargesPer || null,
  })

  const UpdateData = async () => {
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

    const url = await UploadImage(image, service.serviceImage, 'Uploading Image...')

    const data = {
      serviceTitle: title.trim(),
      serviceCharges: Number(charges),
      serviceDescription: description.trim(),
      serviceChargesPer: chargesPerDropDownValue.trim(),
      serviceImage: url || service.serviceImage,
      serviceType: {
        isRemote: isRemoteTypeService,
        isOnSite: isOnSiteTypeService,
      },
      updatedAt: serverTimestamp(),
    }

    setIsLoading('Updating Service...')
    await updateDoc(doc(Firestore, 'services', service.id), data)
    setIsLoading(null)

    await AsyncStorage.setItem('EditServiceDataChanged', 'true')
  }

  const HanldePickImage = () => {
    setPickImage(true)
  }

  const HandleClear = () => {
    const ClearFields = () => {
      setImage(null)
      setPickImage(false)
      setTitle('')
      setCharges('')
      setDescription('')
      setIsRemoteTypeService(false)
      setIsOnSiteTypeService(false)
      setChargesPerDropDownValue(null)
      setChargesPerDropDownOpen(false)
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
      { type: 'string', data: { field: 'Service Title', value: title, min: 5, max: 50 } },
      { type: 'string', data: { field: 'Service Description', value: description, min: 5, max: 250 } },
      { type: 'number', data: { field: 'Service Charges', value: charges, min: 0, max: Infinity } },
      { type: 'string', data: { field: 'Charges Per', value: chargesPerDropDownValue, min: 1, max: 50 } },
      { type: 'string', data: { field: 'Service Image', value: image, min: 1, max: Infinity } },
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

    if (!isRemoteTypeService && !isOnSiteTypeService) {
      setAlert({ message: 'Please Select Service Type!', positiveCallback: () => setAlert(null) })
      return
    }

    try {
      await UpdateData()

      setAlert({
        title: 'Success',
        message: 'Service Updated Successfully!',
        positiveCallback: async () => {
          if (isFromHomeScreen) {
            await AsyncStorage.setItem('EditServiceGoToHomeScreen', 'true')
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
        <CustomAppBar title='Edit Service' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Add Service' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          {
            image &&
            <View>
              <Label label='Service Image' />
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          }

          <CustomTextInput
            value={title}
            onChangeText={(x) => setTitle(x)}
            label='Service Title'
            placeholder='Enter Service Title' />

          <CustomTextInput
            value={description}
            onChangeText={(x) => setDescription(x)}
            label='Service Description'
            multiline={true}
            placeholder='Enter Service Description' />

          <CustomTextInput
            value={charges}
            onChangeText={(x) => {
              if (/^\d*\.?\d*$/.test(x)) setCharges(x)
            }}
            label='Service Charges'
            keyboardType='numeric'
            containerStyle={{ flex: 1 }}
            placeholder='Enter Service Charges (Rs.)' />

          <View style={{ zIndex: 10 }}>
            <CustomDropDownPicker
              label='Charges Per'
              placeholder='Select Charges Measure'
              open={chargesPerDropDownOpen}
              value={chargesPerDropDownValue}
              items={chargesPerDropDownItems}
              setOpen={setChargesPerDropDownOpen}
              setValue={setChargesPerDropDownValue}
              setItems={setChargesPerDropDownItems}
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View>
            <Label label='Service Type' />
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 2 }}>
              <CustomCheckBox label='Remote' status={isRemoteTypeService}
                onPress={() => setIsRemoteTypeService(!isRemoteTypeService)} />
              <CustomCheckBox label='On-Site' status={isOnSiteTypeService}
                onPress={() => setIsOnSiteTypeService(!isOnSiteTypeService)} />
            </View>
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
                  `${charges}`.trim() === initialData.charges &&
                  `${chargesPerDropDownValue}`.trim() === initialData.chargesPerDropDownValue &&
                  `${image}`.trim() === initialData.image &&
                  isRemoteTypeService === initialData.isRemoteTypeService &&
                  isOnSiteTypeService === initialData.isOnSiteTypeService
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

export default EditServiceScreen

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: COLORS.COLOR_01,
    borderRadius: 8,
  }
}) 