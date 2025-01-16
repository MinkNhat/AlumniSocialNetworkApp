import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import { Image } from 'expo-image'

const Avatar = ({
    uri,
    size=hp(4.5),
    rounded=Theme.radius.md,
    style={}
}) => {
  return (
    <Image
        source={{uri}}
        transition={100}
        style={[styles.avatar, {height: size, width: size, borderRadius: rounded}, style]}
    />
  )
}

export default Avatar

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: Theme.colors.darkLight,
        borderWidth: 1
    }
})