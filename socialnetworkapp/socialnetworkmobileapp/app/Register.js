import { View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import Styles from '../styles/Styles'
import { useNavigation } from '@react-navigation/native'
import Input from '../components/Input'
import Button from '../components/Button'
import * as ImagePicker from 'expo-image-picker'
import APIs, { endpoints } from '../configs/APIs'
import { hp, wp } from '../configs/Common'
import Icon from '../assets/icons'
import { Theme } from '../configs/Theme'
import { HelperText } from 'react-native-paper'
import { validateField } from '../configs/ValidateInput'

const Register = () => {
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState(false)
    const [errMessage, setErrMessage] = useState(null)
    // const [avatar, setAvatar] = useState();

    const nav = useNavigation()

    const users = {
        'first_name': {
            'title': 'Họ',
            'field': 'first_name',
            'icon': 'userInfo',
            'secure': false
        },
        'last_name': {
            'title': 'Tên',
            'field': 'last_name',
            'icon': 'userInfo',
            'secure': false
        },
        'student_id': {
            'title': 'Mã sinh viên',
            'field': 'student_id',
            'icon': 'edit',
            'secure': false
        },
        'email': {
            'title': 'Email',
            'field': 'email',
            'icon': 'mail',
            'secure': false
        },
        'username': {
            'title': 'Tên đăng nhập',
            'field': 'username',
            'icon': 'user',
            'secure': false
        },
        'password': {
            'title': 'Mật khẩu',
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

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled)
                inputChange(result.assets[0], 'avatar');
        }
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

        if(!user.avatar) {
            setErr(true)
            setErrMessage({'msg':'Vui lòng chọn ảnh đại diện!', 'field':'avatar'})
            return false
        }

        return true
    }

    const register = async () => {
        if(validate()) {
            let form = new FormData()

            for(let key in users) {
                if(key!=='comfirm') {
                    form.append(key, user[key])
                }
            }

            if(user.avatar) {
                form.append('avatar', {
                    uri: user.avatar.uri,
                    name: user.avatar.fileName,
                    type: user.avatar.type
                })
            }

            setLoading(true)
            try {
                await APIs.post(endpoints['users'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
        
                nav.goBack()
            } catch(ex) { 
                setErr(true)
                setErrMessage({'msg':'Tài khoản đã tồn tại!', 'field':'username'})
                // console.error(ex)
                // if(ex.response) {
                //     Alert.alert("Lỗi khi đăng ký", ex.response.data)
                // }
                // return false
            } finally {
                setLoading(false)
            }
        }
    }

  return (
    <ScreenWrapper bg='white'>
    <StatusBar style='dark'/>

    <View style={Styles.container}>
        <BackButton title='Đăng Ký'/>

        <ScrollView>
            <KeyboardAvoidingView style={{gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View>  
                    <TouchableOpacity onPress={pickImage} style={styles.container}>
                        {user.avatar ? 
                        (<Image source={{ uri: user.avatar.uri }} style={styles.avatar}/>):
                        (<Image source={require('../assets/images/avatar-default.png')} style={styles.avatar}/>)}
                        <View style={styles.chooseImageContainer}>
                            <Text style={styles.text}>Chọn ảnh đại diện</Text>
                            <Icon name={'camera'} size={20} />
                        </View>
                    </TouchableOpacity>
                </View>

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

                <Button buttonStyle={{marginBottom: '40'}} loading={loading} title={'Đăng ký'} onPress={register} textStyle={{fontSize: '20'}}/>
            </KeyboardAvoidingView>
        </ScrollView>
      </View>
  
  </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
    avatar: {
        width: 120, 
        height: 120,
        borderRadius: 60, 
        borderWidth: 2, 
        borderColor: '#ddd',
    },
    container: {
        alignItems: 'center'
    },
    chooseImageContainer: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        marginTop: 6
    },
    text: {
        color: Theme.colors.text,
        fontSize: 16
    }
})

export default Register