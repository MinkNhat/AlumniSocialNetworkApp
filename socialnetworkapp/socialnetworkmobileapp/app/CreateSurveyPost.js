import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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

const CreateSurveyPost = () => {
    const user = useContext(MyUserContext)
    const editorRef = useRef(null)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    
    const [choices, setChoices] = useState([])
    const [newChoice, setNewChoice] = useState("")

    const nav = useNavigation()

    const addChoice = () => {
        if (newChoice.trim() !== "") {
          setChoices([...choices, newChoice.trim()]);
          setNewChoice("")
        }
      }
    
    const removeChoice = (index) => {
    setChoices(choices.filter((_, i) => i !== index));
    }

    const onSubmit = async () => {
        setLoading(true)
        try {
            if(choices.length <= 1) {
                Alert.alert("", "Vui lòng thêm ít nhất 2 lựa chọn!")
                return
            }
    
            const token = await getToken('token')
            let res = await authApis(token).post(endpoints['surveys'], {
                "caption": body,
                "choices": choices
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

                <View style={styles.inputContainer}>
                    <Input
                        value={newChoice}
                        onChangeText={value => setNewChoice(value)}
                        placeholder='Thêm lựa chọn...'
                        containerStyles={{
                            flex: 1,
                            height: hp(6.2),
                            borderRadius: Theme.radius.xl,
                        }}
                    />

                    <TouchableOpacity onPress={addChoice}>
                        <Icon name='plus' color={Theme.colors.textLight} size={55}/>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.choicesContainer}>
                    {choices.map((choice, index) => (
                    <View key={index} style={styles.choiceItem}>
                        <Text style={styles.choiceText}>{choice}</Text>
                        <TouchableOpacity onPress={() => removeChoice(index)} style={styles.removeButton}>
                            <Icon name='delete' color={Theme.colors.rose} size={26}/>
                        </TouchableOpacity>
                    </View>
                    ))}
                </ScrollView>

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

export default CreateSurveyPost

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
        marginBottom: hp(10),
        marginTop: hp(3)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: hp(3),
        marginBottom: hp(1)
    }, 
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        // borderColor: Theme.colors.primary,
        borderRadius: Theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8),
    },
    choicesContainer: {
        marginTop: 10,
    },
    choiceItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#ffffff",
        marginVertical: 5,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
        borderColor: 'grey',
        borderWidth: 0.4
    },
    choiceText: {
        marginLeft: 20,
        fontSize: 18,
        color: Theme.colors.text,
    },
    removeButton: {
        padding: 5,
        marginRight: 20
      },
})