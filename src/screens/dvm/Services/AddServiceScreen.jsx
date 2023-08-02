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
import { ServiceChargesPerValues } from '../../../data/ServiceValues'

const AddServiceScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [title, setTitle] = useState('')
  const [charges, setCharges] = useState('')
  const [description, setDescription] = useState('')

  // Checkboxes
  const [isRemoteTypeService, setIsRemoteTypeService] = useState(false)
  const [isOnSiteTypeService, setIsOnSiteTypeService] = useState(false)

  const [image, setImage] = useState(null)
  const [pickImage, setPickImage] = useState(false)

  const [chargesPerDropDownOpen, setChargesPerDropDownOpen] = useState(false)
  const [chargesPerDropDownValue, setChargesPerDropDownValue] = useState(null)
  const [chargesPerDropDownItems, setChargesPerDropDownItems] = useState(ServiceChargesPerValues)

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
      serviceTitle: title.trim(),
      serviceCharges: Number(charges),
      serviceDescription: description.trim(),
      serviceChargesPer: chargesPerDropDownValue.trim(),
      serviceImage: url,
      serviceType: {
        isRemote: isRemoteTypeService,
        isOnSite: isOnSiteTypeService,
      },
      owner: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    setIsLoading('Adding Service...')
    await addDoc(collection(Firestore, 'services'), data)
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

  const HandleSave = async () => {
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
      await SaveData()

      setAlert({
        title: 'Success',
        message: 'Service Added Successfully!',
        positiveCallback: async () => {
          await AsyncStorage.setItem('AddServiceDataAdded', 'true')
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
        <CustomAppBar title='Add Service' onGoBack={() => navigation.goBack()} />
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

export default AddServiceScreen

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: COLORS.COLOR_01,
    borderRadius: 8,
  }
}) 