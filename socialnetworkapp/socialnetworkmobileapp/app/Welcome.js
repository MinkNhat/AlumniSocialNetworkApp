import { View, Text, Image, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { wp, hp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import Button from '../components/Button'
import { useNavigation } from '@react-navigation/native'

const Welcome = () => {
  const nav = useNavigation()

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark"/> 
      <View style={styles.container}>
        <Image style={styles.imageWelcome} resizeMode="contain" source={require('../assets/images/welcome-image.png')}/>

        <View style={{gap: 20}}>
          <Text style={styles.title}>O-Alum</Text>
          <Text style={styles.subTitle}>
            Mạng xã hội dành cho cựu sinh viên trường đại học Mở Tp Hồ Chí Minh.
          </Text>
        </View>

        <View style={{width:'100%'}}>
          <Button
            title='Getting Started!'
            buttonStyle={{marginHorizontal: wp(4)}}
            onPress={() => {nav.navigate('login')}}
          />
        </View>

        <View style={{flexDirection: 'row', marginBottom: '20', marginTop: '-20'}}>
          <Text style={styles.loginText}>Nếu chưa có tài khoản?</Text>
          <Pressable onPress={() => {nav.navigate('register')}}>
            <Text style={[styles.loginText, {color: Theme.colors.primary, marginLeft: '6', fontWeight: Theme.fonts.semiBold}]}>
              Đăng kí ngay
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    paddingHorizontal: wp(4)
  },
  imageWelcome: {
    height: hp(40),
    width: wp(80),
    alignSelf: 'center'
  },
  title: {
    color: Theme.colors.text,
    fontSize: 36,
    fontWeight: Theme.fonts.extraBold,
    textAlign: 'center'
  },
  subTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: wp(10)  
  }, 
  loginText: {
    textAlign: 'center',
    color: Theme.colors.text,
    fontSize: 16
  }
})