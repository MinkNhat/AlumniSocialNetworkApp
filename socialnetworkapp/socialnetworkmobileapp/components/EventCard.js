import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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


const EventCard = ({
    event,
    hasShadow = true,
}) => {
    const [loading, setLoading] = useState(true)
    const user = useContext(MyUserContext)
    const nav = useNavigation()

    // console.log(event)

    const shawdowStyles = {
        shadowOffset: {
            with: 0,
            height: 2
        },
        shadowOpacity: 0.06, 
        shadowRadius: 6,
        elevantion: 1
    }

  return (
    <View style={[styles.container, hasShadow && shawdowStyles]}>
      <View style={styles.header}>
            <View style={styles.userInfo}>
                <Avatar
                    size={hp(4.5)}
                    rounded={Theme.radius.md} 
                    uri={event?.user?.avatar}
                />
                <View style={{gap: 4}}>
                    <Text style={styles.username}>{getFullName(event?.user?.first_name, event?.user?.last_name)}</Text>
                    <Text style={styles.postTime}>{getTimeFromNow(event?.created_date)}</Text>
                </View>
            </View>

            <TouchableOpacity>
                <Icon name={'threeDotsHorizontal'} size={hp(3.4)} strokeWidth={3} color={Theme.colors.text}/>
            </TouchableOpacity>
            
    
      </View>

      <View style={styles.content}>
            <View style={styles.postBody}>
                {
                    event?.caption && (
                        <HTMLView
                            value={event?.caption}
                            stylesheet={styles.tagsStyle}
                            // onLinkPress={(url) => console.log(`Link clicked: ${url}`)}
                        />
                    )
                }

                <View style={styles.eventBox}>
                    <View style={styles.infoContainer}>
                        <Icon name="star" size={24} color={Theme.colors.yellow} fill={Theme.colors.yellow}/>
                        <Text style={[styles.eventText, {fontWeight: '600'}]}>
                            {event?.name}
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Icon name="canledar" size={24} color={Theme.colors.text} />
                        <Text style={styles.eventText}>
                            {event.date ? new Date(event.date).toLocaleDateString("vi-VN") : "Đang cập nhật..."}
                        </Text>
                    </View>

                    <View style={styles.infoContainer}>
                        <Icon name="location" size={24} color={Theme.colors.rose} />
                        <Text style={styles.eventText}>
                            {event.location || "Đang cập nhật..."}
                        </Text>
                    </View>
                </View>
            </View>
      </View>
    </View>
  )
}

export default EventCard

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
    eventBox: {
        backgroundColor: Theme.colors.primaryLight,
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        marginVertical: hp(2),
        marginRight: hp(1),
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5, 
      },
      infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      },
      eventText: {
        marginLeft: 12,
        fontSize: 18,
        color: '#000',
      },
})