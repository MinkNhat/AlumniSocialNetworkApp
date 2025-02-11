import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Theme } from '../configs/Theme'
import Avatar from './Avatar'
import { getFullName, getTimeFromNow, getToken, hp } from '../configs/Common'
import Icon from '../assets/icons'
import { MyUserContext } from '../configs/MyUserContext'
import { ActionSheetProvider, useActionSheet } from '@expo/react-native-action-sheet'
import APIs, { authApis, endpoints } from '../configs/APIs'


const CommentItem = ({
  item,
  onUpdateComment,
  updatedCommentId,
  onDeteleComment

}) => {
  const user = useContext(MyUserContext)
  const [hightlight, setHightlight] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()

  const showMenu = async () => {
    let res = await APIs.get(endpoints['post-details'](item.post))
    const post = res.data

    const canDelete = user.id === item.user.id || user.id === post.user.id
    const canUpdate = user.id === item.user.id

    let options = ["Báo cáo"]
    if (canUpdate) options.push("Chỉnh sửa")
    if (canDelete) options.push("Xóa")
    options.push("Hủy")

    const destructiveButtonIndex = canDelete ? options.indexOf("Xóa") : undefined
    const cancelButtonIndex = options.indexOf("Hủy")

    showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (selectedIndex) => {
            if (selectedIndex === options.indexOf("Báo cáo")) Alert.alert("", "Đã báo cáo bình luận này!")
            if (canUpdate && selectedIndex === options.indexOf("Chỉnh sửa")) updateComment()
            if (canDelete && selectedIndex === options.indexOf("Xóa")) deleteComment()
        }
    );
};

  useEffect(() => {
    if (updatedCommentId === item.id) {
      setHightlight(false)
    }
  }, [updatedCommentId])


  const updateComment = () => {
    setHightlight(true)
    onUpdateComment(item)
  }

  const deleteComment = async () => {
    const token = await getToken('token')
    await authApis(token).delete(endpoints['comment-details'](item.id))
    onDeteleComment(item)
  }

  return (
    <View style={styles.container}>
      <Avatar uri={item?.user?.avatar}/>

      <TouchableOpacity onLongPress={showMenu} style={{flex: 1}}>
        <View style={[styles.content, hightlight ? styles.hightlight : null]}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={styles.nameContainer}>
              <Text style={styles.text}>{getFullName(item?.user?.first_name, item?.user?.last_name)}</Text>
              <Text style={styles.time}>{getTimeFromNow(item?.created_date)}</Text>
            </View>

            <TouchableOpacity onPress={showMenu}>
              <Icon name={'threeDotsHorizontal'} size={hp(3.6)} strokeWidth={3} color={Theme.colors.text}/>
            </TouchableOpacity>
          </View>

          <Text style={[styles.text, {fontWeight: 'normal'}]}>
            {item?.content}
          </Text>
        </View>
      </TouchableOpacity>

    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    marginBottom: hp(2),
  },
  content: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    flex: 1,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Theme.radius.md,
    borderCurve: 'continuous',
  },
  hightlight: {
    borderWidth: 0.2,
    backgroundColor: 'white',
    borderColor: Theme.colors.dark,
    shadowColor: Theme.colors.dark,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  text: {
    fontSize: 16,
    fontWeight: Theme.fonts.medium,
    color: Theme.colors.textDrak
  }, 
  time: {
    color: Theme.colors.textLight,
    fontSize: 14,
    marginLeft: 16
  },
})   