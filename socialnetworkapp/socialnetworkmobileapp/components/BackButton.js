import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import Icon from '../assets/icons'
import { Theme } from '../configs/Theme'
import { useNavigation } from '@react-navigation/native'

const BackButton = ({
  size=28,
  title='',
  backTo='',
  style
}) => {
    const nav = useNavigation()
  return (
    <View style={styles.container}>
      <Pressable onPress={() => backTo? nav.navigate(backTo) : nav.goBack() } style={styles.button}>
        <Icon name='arrowLeft' strokeWidth={2.5} color={Theme.colors.text} size={size}/>
      </Pressable>

      <Text style={[styles.title, style]}>{title}</Text>
    </View>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button: {
      alignSelf: 'flex-start',
      padding: 10,
      borderRadius: Theme.radius.md,
      zIndex: 1
      // backgroundColor: 'rgba(0, 0, 0, 0.08)'
    },
    container: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      
    }, 
    title: {
      position: 'absolute',
      textAlign: 'center',
      top: '50%', 
      left: 0,
      right: 0,
      transform: [{ translateY: -15 }],
      fontSize: 24,
      color: Theme.colors.primary,
      fontWeight: Theme.fonts.semiBold
    }
})