import React from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable
} from 'react-native'

import COLORS from '../config/colors'

export const Label = ({ label = '', labelStyle = {} }) => {
  return (
    <Text style={{ ...styles.label, ...labelStyle }}>{label}</Text>
  )
}

const CustomTextInput = ({
  label = '',
  placeholder = '',
  value = '',
  onChangeText = () => { },
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength = 100,
  editable = true,
  multiline = false,
  labelStyle = {},
  inputStyle = {},
  inputTextStyle = {},
  containerStyle = {},
  rightIcon = null,
  onRightIconPress = () => { },
  selectMode = false,
  selectModeOnPress = () => { }
}) => {

  return (
    <View style={{ ...styles.container, ...containerStyle }}>
      {
        label !== '' &&
        <Label label={label} labelStyle={labelStyle} />
      }
      {
        selectMode
          ?
          <Pressable onPress={selectModeOnPress} android_ripple={{ color: COLORS.COLOR_05 }}>
            <View style={{ ...styles.input, ...inputStyle }}>
              <TextInput
                placeholder={placeholder}
                value={value}
                editable={false}
                style={{ ...styles.inputText, ...inputTextStyle }}
              />
              <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.6}>
                {rightIcon}
              </TouchableOpacity>
            </View>
          </Pressable>
          :
          <View style={{ ...styles.input, ...inputStyle }}>
            <TextInput
              placeholder={placeholder}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              maxLength={maxLength}
              editable={editable}
              style={{ ...styles.inputText, ...inputTextStyle }}
              multiline={multiline}
            />
            <TouchableOpacity onPress={onRightIconPress} activeOpacity={0.6}>
              {rightIcon}
            </TouchableOpacity>
          </View>
      }
    </View>
  )
}

export default CustomTextInput

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 16,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_01,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.COLOR_01,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputText: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Regular',
    color: '#000',
    flex: 1,
    // backgroundColor: `${COLORS.COLOR_05}50`,
  },
})