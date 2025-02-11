import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { Theme } from '../configs/Theme'
import Avatar from '../components/Avatar'
import RichTextEditer from '../components/RichTextEditer'
import Button from '../components/Button'
import { getFullName, getToken, hp, wp } from '../configs/Common'
import { MyUserContext } from '../configs/MyUserContext'
import { HelperText } from 'react-native-paper'
import Input from '../components/Input'
import Styles from '../styles/Styles'
import { authApis, endpoints } from '../configs/APIs'
import UserSelection from '../components/UserSelection'
import { useNavigation } from '@react-navigation/native'
import DateTimePicker from "@react-native-community/datetimepicker"
import Icon from '../assets/icons'

const CreateEventPost = () => {
    const user = useContext(MyUserContext)
    const editorRef = useRef(null)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [event, setEvent] = useState({})
    const [selectedUsers, setSelectedUsers] = useState([])
    const [showDatePicker, setShowDatePicker] = useState(false)
    const nav = useNavigation()

    const events = {
        'name': {
            'title': 'Tên sự kiện',
            'field': 'name',
            'icon': 'user',
            'secure': false
        },
        'location': {
            'title': 'Địa điểm',
            'field': 'location',
            'icon': 'location',
            'secure': false
        }
    }

    const inputChange = (value, field) => {
        setEvent({...event, [field]: value})
    }

    const onSubmit = async () => {
        setLoading(true)
        try {
            if(!event.name) {
                Alert.alert("", "Vui lòng nhập tên sự kiện!")
                return
            }
    
            const token = await getToken('token')
            let res = await authApis(token).post(endpoints['events'], {
                ...event,
                "caption": body,
                "attendees": selectedUsers
            })
    
            nav.navigate('home')
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
    }

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        
        <View style={{height: '100%'}}>
            <BackButton title="Đăng thông báo mới" style={{color: Theme.colors.text}}/>
            <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.header}>
                    <Avatar  
                        uri={user.avatar}
                        size={hp(7)}
                        rounded={Theme.radius.sm}
                    />
                    <View>
                        <Text style={styles.username}>    
                            {getFullName(user.first_name, user.last_name)}
                        </Text>
                        <Text style={styles.accessModifier}>public</Text>
                    </View>
                </View>

                <View style={styles.textEditor}>
                    <RichTextEditer
                        editorRef={editorRef}
                        onChange={setBody} 
                        body={body}
                    /> 
                </View>

                <View style={{gap: 30, marginTop: hp(3), marginBottom: hp(3)}}>
                    {Object.values(events).map(u => 
                        <Input
                            icon={u.icon}
                            placeholder={u.title}
                            key={u.field}
                            value={event[u.field]}
                            onChangeText={value => inputChange(value, u.field)}
                            passwordField={u.secure}
                        />
                    )}

                    <TouchableOpacity
                        style={styles.input} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Icon name='canledar' />

                        <Text style={{ color: event.date ? Theme.colors.text : "grey", fontSize: 17, marginLeft: 14 }}>
                            {event.date ? new Date(event.date).toLocaleDateString("vi-VN") : "Chọn ngày"}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            style={{margin: 'auto'}}
                            value={event.date ? new Date(event.date) : new Date()}
                            mode="date"
                            display={Platform.OS === "ios" ? "inline" : "default"}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    inputChange(selectedDate.toISOString(), "date");
                                }
                            }}
                        />
                    )}
                </View>

                <View style={{ flex: 1, marginBottom: 20 }}>
                    <UserSelection selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />
                </View>

                <Button
                    buttonStyle={styles.buttonSubmit}
                    title="Đăng thông báo"
                    loading={loading}
                    hasShadow={false}
                    onPress={onSubmit}
                />
            </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  )
}

export default CreateEventPost

const styles = StyleSheet.create({
    container: {
        marginTop: hp(4),
        paddingHorizontal: wp(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    }, 
    username: {
        fontWeight: Theme.fonts.semiBold,
        fontSize: 24,
        color: Theme.colors.text,
        marginBottom: 4
    },
    accessModifier: {
        fontWeight: Theme.fonts.extraLight,
        fontSize: 18,
        color: Theme.colors.text,
    }, 
    textEditor: {
        marginTop: hp(3),
    }, 
    buttonSubmit: {
        height: hp(6),
        marginHorizontal: wp(4),
        marginBottom: hp(2)
    },
    input: {
        flexDirection: 'row',
        backgroundColor: "white",
        padding: 12,
        height: hp(7),
        borderRadius: Theme.radius.xxl,
        borderWidth: 1,
        borderColor: 'grey',
        alignItems: 'center'
    },
})