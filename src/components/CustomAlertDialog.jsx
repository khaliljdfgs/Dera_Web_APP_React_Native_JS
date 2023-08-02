import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import Modal from 'react-native-modal'

import COLORS from '../config/colors'

const CustomAlertDialog = ({
  title = 'Alert',
  message = 'This is a default message!',
  positiveLabel = 'Ok',
  positiveCallback,
  negativeLabel = 'Cancel',
  negativeCallback,
}) => {

  return (
    <Modal isVisible={true} animationIn={'fadeInLeft'}>
      <View style={{ backgroundColor: '#ffffff', padding: 24, borderRadius: 8 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{message}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
          {
            negativeLabel && negativeCallback &&
            <TouchableOpacity activeOpacity={0.65} style={styles.buttonContainer}
              onPress={negativeCallback}>
              <Text style={styles.buttonText}>{negativeLabel}</Text>
            </TouchableOpacity>
          }
          {
            positiveLabel && positiveCallback &&
            <TouchableOpacity activeOpacity={0.65} style={styles.buttonContainer}
              onPress={positiveCallback}>
              <Text style={styles.buttonText}>{positiveLabel}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    </Modal>
  )
}

export default CustomAlertDialog

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'Ubuntu-Bold',
  },
  description: {
    fontSize: 18,
    paddingTop: 2,
    lineHeight: 26,
    fontFamily: 'Ubuntu-Regular',
  },
  buttonContainer: {
    borderRadius: 4,
    backgroundColor: COLORS.COLOR_01,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    textTransform: 'uppercase',
    fontFamily: 'Ubuntu-Medium',
  }
})