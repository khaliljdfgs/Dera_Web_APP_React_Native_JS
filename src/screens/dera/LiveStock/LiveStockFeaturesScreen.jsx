import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'
import { Label } from '../../../components/CustomTextInput'

import COLORS from '../../../config/colors'
import { InputNumberValidation, InputStringValidation } from '../../../utils/Validation'

const LiveStockFeaturesScreen = ({ navigation, route }) => {
  const { features } = route.params

  const [alert, setAlert] = useState(null)

  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState({ day: '', month: '', year: '' })
  const [weight, setWeight] = useState('')
  const [teethCount, setTeethCount] = useState('')

  useEffect(() => {
    if (features && Object.keys(features).length > 0) {
      setBreed(features.breed || '')
      setColor(features.color)
      setHeight(features.height + '')
      setAge({
        day: features.age.day + '',
        month: features.age.month + '',
        year: features.age.year + ''
      })
      setWeight(features.weight + '')
      setTeethCount(features.teethCount || '')
    }
  }, [])

  const HandleClear = () => {
    const ClearFields = () => {
      setBreed('')
      setColor('')
      setHeight('')
      setAge({ day: '', month: '', year: '' })
      setWeight('')
      setTeethCount('')
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
      { type: 'string', data: { field: 'Breed', value: breed, min: 3, max: 50 } },
      { type: 'string', data: { field: 'Color', value: color, min: 3, max: 50 } },
      { type: 'number', data: { field: 'Age Day', value: age.day, min: 0, max: 31 } },
      { type: 'number', data: { field: 'Age Month', value: age.month, min: 0, max: 12 } },
      { type: 'number', data: { field: 'Age Year', value: age.year, min: 0, max: 100 } },
      { type: 'number', data: { field: 'Height', value: height, min: 3, max: 250 } },
      { type: 'number', data: { field: 'Weight', value: weight, min: 1, max: 2000 } },
      { type: 'number', data: { field: 'Teeth Count', value: teethCount, min: 0, max: 32, isRequired: false } }
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

    const data = {
      breed: breed || 'Not Set',
      color: color.trim(),
      age: {
        day: Number(age.day),
        month: Number(age.month),
        year: Number(age.year)
      },
      height: Number(height),
      weight: Number(weight),
      teethCount: Number(teethCount)
    }

    await AsyncStorage.setItem('liveStockFeatures', JSON.stringify(data))
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      {
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

      <CustomAppBar title='Livestock Features ' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <CustomTextInput
            label='Breed'
            placeholder='Enter LiveStock Breed'
            value={breed}
            onChangeText={(x) => setBreed(x)}
          />

          <CustomTextInput
            label='Color'
            placeholder='Enter LiveStock Color'
            value={color}
            onChangeText={(x) => setColor(x)}
          />

          <View>
            <Label label='Age' />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <CustomTextInput
                placeholder='Day'
                value={age.day}
                keyboardType='numeric'
                onChangeText={(x) => {
                  if (/^[0-9]*$/.test(x)) setAge({ ...age, day: x })
                }}
                containerStyle={{ flex: 1 }}
              />

              <CustomTextInput
                placeholder='Month'
                value={age.month}
                keyboardType='numeric'
                onChangeText={(x) => {
                  if (/^[0-9]*$/.test(x)) setAge({ ...age, month: x })
                }}
                containerStyle={{ flex: 1 }}
              />

              <CustomTextInput
                placeholder='Year'
                value={age.year}
                keyboardType='numeric'
                onChangeText={(x) => {
                  if (/^[0-9]*$/.test(x)) setAge({ ...age, year: x })
                }}
                containerStyle={{ flex: 1 }}
              />
            </View>
          </View>

          <CustomTextInput
            label='Height (in inches)'
            keyboardType='numeric'
            placeholder='Enter LiveStock Height (in inches)'
            value={height}
            onChangeText={(x) => {
              if (/^\d*\.?\d*$/.test(x)) setHeight(x)
            }}
          />

          <CustomTextInput
            label='Weight (in Kg)'
            placeholder='Enter LiveStock Weight (in Kg)'
            keyboardType='numeric'
            value={weight}
            onChangeText={(x) => {
              if (/^\d*\.?\d*$/.test(x)) setWeight(x)
            }}
          />

          <CustomTextInput
            label='Teeth Count'
            placeholder='Enter LiveStock Teeth Count'
            keyboardType='numeric'
            value={teethCount}
            onChangeText={(x) => {
              if (/^[0-9]*$/.test(x)) setTeethCount(x)
            }}
          />

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

export default LiveStockFeaturesScreen

const styles = StyleSheet.create({})