import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { Theme } from '../configs/Theme'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { MyUserContext } from '../configs/MyUserContext'
import { HelperText } from 'react-native-paper'
import Input from '../components/Input'
import Button from '../components/Button'
import { useNavigation } from '@react-navigation/native'
import { getToken, hp, wp } from '../configs/Common'
import Styles from '../styles/Styles'
import { authApis, endpoints } from '../configs/APIs'
import { validateField } from '../configs/ValidateInput'

const ChangePassword = () => {
    const currentUser = useContext(MyUserContext)
    const [user, setUser] = useState({})
    const nav = useNavigation()
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState(false)
    const [errMessage, setErrMessage] = useState(null)
    
    const users = {
        'password': {
            'title': 'Mật khẩu mới',
            'field': 'password',
            'icon': 'lock',
            'secure': true
        },
        'comfirm': {
            'title': 'Xác nhận mật khẩu',
            'field': 'comfirm',
            'icon': 'lock',
            'secure': true
        }
    }

    const inputChange = (value, field) => {
        setUser({...user, [field]: value})
    }

    const validate = () => {
        for(const key in users) {
            const field = users[key].field
            const value = user[field]

            const error = validateField(field, value, user)
            if(error) {
                setErr(true)
                setErrMessage(error)
                return false
            }
        }
        return true
    }

    const changePassword = async () => {
        if(validate()) {
            setErr(false)
            setErrMessage(null)
            setLoading(true)

            try {
                const token = await getToken('token')
                await authApis(token).patch(endpoints['current-user'], {
                    "password": user.password
                })
            } catch(ex) {
                setErr(true)
                setErrMessage({'msg':'Mật khẩu không chính xác!', 'field':'password'})
            } finally {
                setLoading(false)
            }
        }
    }

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <BackButton title='Đổi mật khẩu' style={{color: Theme.colors.text}}/>

        <View style={{gap: 30, marginTop: hp(10), paddingHorizontal: wp(4)}}>
            {Object.values(users).map(u => 
                <Input
                    icon={u.icon}
                    placeholder={u.title}
                    key={u.field}
                    value={user[u.field]}
                    onChangeText={value => inputChange(value, u.field)}
                    passwordField={u.secure}
                    hasError={errMessage&&errMessage.field===u.field? true : false}
                />
            )}

            {!err? <></>:
                <HelperText type="error" visible={err} style={Styles.errorMessage}>
                    {errMessage? errMessage.msg : ""}
                </HelperText>
            }

            <Button title={'Đổi mật khẩu'} loading={loading} onPress={changePassword} textStyle={{fontSize: 20}}/>

        </View>
    </ScreenWrapper>
  )
}

export default ChangePassword

const styles = StyleSheet.create({})