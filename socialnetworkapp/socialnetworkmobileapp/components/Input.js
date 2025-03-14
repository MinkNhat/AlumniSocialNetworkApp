import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Theme } from '../configs/Theme'
import { hp } from '../configs/Common'
import Icon from '../assets/icons'

const Input = (props) => {
    const [showPass, setShowPass] = useState(false)

  return (
    <View style={[styles.container, props.containerStyles && props.containerStyles, props.hasError && styles.errorBorder,]}>
        {
          props.icon && (<Icon name={props.icon} size={26} strokeWidth={1.6}/>)
        }
      
      <TextInput
        style={[{flex: 1}, props.inputStyles&&props.inputStyles]}
        placeholderTextColor={Theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        secureTextEntry={props.passwordField && !showPass}
        fontSize={18}
        autoCapitalize='none'
        autoCorrect={false}
        selectTextOnFocus={false}
        
        {...props}
        
      />

      {
        props.passwordField && (
          <TouchableOpacity
            style={{marginLeft: '10'}}
            onPress={() => setShowPass(!showPass)}
          >
            <Icon name={!showPass ? 'nonEye' : 'eye'} size={20} color="gray" />
          </TouchableOpacity>
        )
      }
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: hp(7),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0.6,
      borderColor: Theme.colors.text,
      borderRadius: Theme.radius.xxl,
      borderCurve: 'continuous',
      paddingHorizontal: 18,
      gap: 12
    },
    errorBorder: {
      borderColor: 'red', 
  },
})