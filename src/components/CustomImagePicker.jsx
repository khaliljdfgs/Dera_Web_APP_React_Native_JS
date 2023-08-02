import React from 'react'
import { Text, View, StyleSheet, Pressable } from 'react-native'
import Modal from 'react-native-modal'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import COLORS from '../config/colors'

const CustomImagePicker = ({
  setImage = () => { },
  setPickImage = () => { },
  aspect = [1, 1],
}) => {
  const PickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspect,
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setPickImage(false)
    }
  }

  const TakeImageFromCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: aspect,
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
      setPickImage(false)
    }
  }

  return (
    <Modal isVisible={true} animationIn={'slideInLeft'} animationOut={'slideOutRight'}
      onBackdropPress={() => setPickImage(false)}>
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 8, gap: 16 }}>
        <View style={styles.patch}>
          <Pressable style={styles.itemContainer} onPress={TakeImageFromCamera}
            android_ripple={{ color: COLORS.COLOR_01 }}>
            <Ionicons name='camera' size={28} color={COLORS.COLOR_01} />
            <Text style={styles.description}>Take Image from Camera</Text>
          </Pressable>
        </View>
        <View style={styles.patch}>
          <Pressable style={styles.itemContainer} onPress={PickImageFromGallery}
            android_ripple={{ color: COLORS.COLOR_01 }}>
            <MaterialIcons name='photo-library' size={28} color={COLORS.COLOR_01} />
            <Text style={styles.description}>Pick Image from Gallery</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export default CustomImagePicker

const styles = StyleSheet.create({
  description: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: 'Ubuntu-Regular',
  },
  itemContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.COLOR_01,
    borderRadius: 8,
    padding: 12,
  },
  patch: {
    overflow: 'hidden',
    borderRadius: 8,
  }
})