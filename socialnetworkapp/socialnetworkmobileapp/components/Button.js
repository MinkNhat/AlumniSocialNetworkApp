import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Theme } from '../configs/Theme'
import { hp } from '../configs/Common'
import Loading from './Loading'
import Icon from '../assets/icons'


const Button = ({
    buttonStyle,
    textStyle,
    title='',
    onPress=()=>{},
    loading = false,
    hasShadow = true,
    icon = null
}) => {
    const shadowStyle = {
        shadowColor: Theme.colors.dark,
        shadowOffset: {width: 0, height: 20},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevantion: 4
    }

    if(loading) {
        return (
            <View>
                <Loading/>
            </View>
        )
    }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, buttonStyle, hasShadow && shadowStyle]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {icon && <Icon name={icon?.name} size={icon?.size}/>}
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: Theme.colors.primary,
        height: hp(7),
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: Theme.radius.xl
    },
    text: {
        fontSize: 24,
        color: 'white',
        fontWeight: Theme.fonts.bold
    }
})