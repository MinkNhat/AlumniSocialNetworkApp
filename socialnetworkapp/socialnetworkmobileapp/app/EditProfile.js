import { View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Alert, DevSettings } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import Styles from '../styles/Styles'
import { useNavigation } from '@react-navigation/native'
import Input from '../components/Input'
import Button from '../components/Button'
import * as ImagePicker from 'expo-image-picker'
import APIs, { authApis, endpoints } from '../configs/APIs'
import { getToken, hp, wp } from '../configs/Common'
import Icon from '../assets/icons'
import { Theme } from '../configs/Theme'
import { HelperText } from 'react-native-paper'
import { validateField } from '../configs/ValidateInput'
import { MyDispatchContext, MyUserContext } from '../configs/MyUserContext'

const EditProfile = () => {
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState(false)
    const [errMessage, setErrMessage] = useState(null)
    const backgroundDefault = 'https://res.cloudinary.com/dbmwgavqz/image/upload/v1739285564/plain-grey-background-ydlwqztavi78gl24_nq4dro.jpg'
    const [newAvatar, setNewAvatar] = useState(null)
    const [newBackground, setNewBackground] = useState(null)
    const currentUser = useContext(MyUserContext)
    const dispatch = useContext(MyDispatchContext)
    const nav = useNavigation()

    useEffect(() => {
        setUser(currentUser)
    }, [])
    
    const refreshUser = async () => {
        try {
            const token = await getToken('token')
            const response = await authApis(token).get(endpoints['current-user'])
            
            dispatch({
                type: 'login',
                payload: response.data,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin user:", error);
        }
    };

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
        'email': {
            'title': 'Email',
            'field': 'email',
            'icon': 'mail',
            'secure': false
        },
        'introduce': {
            'title': 'Giới thiệu bản thân',
            'field': 'introduce',
            'icon': 'list',
            'secure': false
        },
    }

    const inputChange = (value, field) => {
        setUser({...user, [field]: value})
    }

    const pickImage = async (isAvatar) => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();
            if (!result.canceled) {
                if(isAvatar) {
                    inputChange(result.assets[0], 'new_avatar');
                    setNewAvatar(result.assets[0])
                } else {
                    inputChange(result.assets[0], 'new_background');
                    setNewBackground(result.assets[0])
                }
            }
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
        return true
    }

    const editProfile = async () => {
        if(validate()) {
            let form = new FormData()

            for(let key in users) {
                form.append(key, user[key])
            }

            if(newAvatar?.uri) {
                form.append('avatar', {
                    uri: newAvatar.uri,
                    name: newAvatar.fileName,
                    type: newAvatar.type
                })
            }

            if(newBackground?.uri) {
                form.append('cover_image', {
                    uri: newBackground.uri,
                    name: newBackground.fileName,
                    type: newBackground.type
                })
            }

            setLoading(true)
            try {
                const token = await getToken("token")
                let res = await authApis(token).patch(endpoints['current-user'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                await refreshUser()
                nav.goBack()
            } catch(ex) { 
                // setErr(true)
                // setErrMessage({'msg':'Tài khoản đã tồn tại!', 'field':'username'})
                console.error(ex)
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
        <BackButton title='Chỉnh sửa thông tin' style={{color: Theme.colors.text}}/>

        <ScrollView>
            <KeyboardAvoidingView style={{gap: 20}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View>  
                    <View style={styles.container}>
                        {newAvatar?.uri ? (
                            <Image source={{ uri: newAvatar.uri }} style={styles.avatar} />
                        ) : user.avatar?.startsWith('http') ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        ) : (
                            <Image source={require('../assets/images/avatar-default.png')} style={styles.avatar} />
                        )}

                        <TouchableOpacity onPress={() => pickImage(true)} style={styles.chooseImageContainer}>
                            <Text style={styles.text}>Chọn ảnh đại diện</Text>
                            <Icon name={'camera'} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => pickImage(false)} style={styles.container}>
                            {newBackground?.uri ? (
                                <Image source={{ uri: newBackground.uri }} style={styles.background} />
                            ) : user.cover_image?.startsWith('http') ? (
                                <Image source={{ uri: user.cover_image }} style={styles.background} />
                            ) : (
                                <Image source={{uri: backgroundDefault}} style={styles.background} />
                            )}
                        </TouchableOpacity>
                    </View>

                    
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

                <Button buttonStyle={{marginBottom: '40'}} loading={loading} title={'Chỉnh sửa'} onPress={editProfile} textStyle={{fontSize: 20}}/>
            </KeyboardAvoidingView>
        </ScrollView>
      </View>
  
  </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
    avatar: {
        position: 'relative',
        width: 120, 
        height: 120,
        borderRadius: 60, 
        borderWidth: 2, 
        borderColor: '#ddd',
        zIndex: 2,
        marginTop: 20
    },
    background: {
        position: 'absolute',
        top: -170,
        width: '90%', 
        height: 130,
        borderRadius: 10, 
        borderWidth: 2, 
        borderColor: '#ddd',
        zIndex: 1
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

export default EditProfile
