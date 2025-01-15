import { View, Text, Button } from 'react-native'
import React, { useContext } from 'react'
import ScreenWapper from '../components/ScreenWapper'
import { useNavigation } from '@react-navigation/native'
import Loading from '../components/Loading'
import { MyUserContext } from '../configs/MyUserContext'

const Index = () => {
  const nav = useNavigation();
  const user = useContext(MyUserContext)

  if(user===null) {
    setTimeout(async () => {
      nav.navigate('welcome')
    }, 50)
  }

  return (
    <ScreenWapper>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Loading/>
      </View>
      {/* <Button title='welcome' onPress={() => nav.navigate('welcome')}></Button> */}
    </ScreenWapper> 
  )
}

export default Index