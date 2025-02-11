import { Alert, Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Theme } from '../configs/Theme'
import { getFullName, getTimeFromNow, getToken, hp, stripHtmlTags, wp } from '../configs/Common'
import Avatar from './Avatar'
import Icon from '../assets/icons'
import HTMLView from 'react-native-htmlview'
import APIs, { authApis, endpoints } from '../configs/APIs'
import Loading from './Loading'
import { MyUserContext } from '../configs/MyUserContext'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native-paper'


const SurvyCard = ({
    survey,
    hasShadow = true,
}) => {
    const [loading, setLoading] = useState(false)
    const user = useContext(MyUserContext)
    const [responses, setResponses] = useState(survey.choices || [])
    const [selectedResponse, setSelectedResponse] = useState(null)
    const nav = useNavigation()

    const shawdowStyles = {
        shadowOffset: {
            with: 0,
            height: 2
        },
        shadowOpacity: 0.06, 
        shadowRadius: 6,
        elevantion: 1
    }

    const loadSelectedResponse = async () => {
        setLoading(true)
        try {
            let res = await APIs.get(endpoints['responses'](survey.id))

            const userResponse = res.data.find(r => r.user.id === user.id);
            if (userResponse) {
                setSelectedResponse(userResponse.choice);
            }
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
        
    }

    useEffect(() => {
        loadSelectedResponse()
    }, [])

    const handleSelectResponse = async (response) => {
        if (selectedResponse === response) return

        try {
            const token = await getToken('token')
            let res = await authApis(token).post(endpoints['responses'](survey.id), {
                choice: response,
            })
            if(res.data) {
                setSelectedResponse(response)
            }
        } catch (error) {
            if(error.response) {
                Alert.alert("Lỗi khi phản hồi", error.response.data.error_description)
            }
        }
    }

  return (
    <View style={[styles.container, hasShadow && shawdowStyles]}>
      <View style={styles.header}>
            <View style={styles.userInfo}>
                <Avatar
                    size={hp(4.5)}
                    rounded={Theme.radius.md} 
                    uri={survey?.user?.avatar}
                />
                <View style={{gap: 4}}>
                    <Text style={styles.username}>{getFullName(survey?.user?.first_name, survey?.user?.last_name)}</Text>
                    <Text style={styles.postTime}>{getTimeFromNow(survey?.created_date)}</Text>
                </View>
            </View>

            <TouchableOpacity>
                <Icon name={'threeDotsHorizontal'} size={hp(3.4)} strokeWidth={3} color={Theme.colors.text}/>
            </TouchableOpacity>
            
    
      </View>

      <View style={styles.content}>
            <View style={styles.postBody}>
                <View style={{marginBottom: 10}}>
                {
                    survey?.caption && (
                        <HTMLView
                            value={survey?.caption}
                            stylesheet={styles.tagsStyle}
                            // onLinkPress={(url) => console.log(`Link clicked: ${url}`)}
                        />
                    )
                }
                </View>

                {loading ? (
                    <ActivityIndicator size="small" color={Theme.colors.primary} />
                ) : (
                    responses.map((response) => (
                        <TouchableOpacity
                            key={response}
                            style={[
                                styles.responseItem,
                                selectedResponse === response && styles.selectedResponse,
                            ]}
                            onPress={() => handleSelectResponse(response)}
                        >
                            <Text style={styles.responseText}>{response}</Text>
                        </TouchableOpacity>
                    ))
                )}

                
            </View>
      </View>
    </View>
  )
}

export default SurvyCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: Theme.radius.xxl,
        padding: 10,
        paddingVertical: 12,
        borderCurve: 'continuous',
        borderWidth: 0.5,
        backgroundColor: 'white',
        shadowColor: '#000',
        borderColor: Theme.colors.gray
    }, 
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    username: {
        fontSize: 18,
        color: Theme.colors.textDrak,
        fontWeight: Theme.fonts.medium
    },
    postTime: {
        fontSize: 14,
        color: Theme.colors.textLight,
        fontWeight: Theme.fonts.medium
    },
    content: {
        gap: 10
    },
    postBody: {
        marginLeft: 12,
        marginTop: 10,
        // marginBottom: -30
    },
    tagsStyle: {
        color: Theme.colors.text,
        fontSize: 18,

        p: {
            color: Theme.colors.text,
            fontSize: 18,
        },

        div: {
            color: Theme.colors.text,
            fontSize: 18,
        }
    },
    responseItem: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginVertical: 5,
    },
    selectedResponse: {
        backgroundColor: Theme.colors.primaryLight,
    },
    responseText: {
        fontSize: 16,
        color: Theme.colors.text,
    },
})