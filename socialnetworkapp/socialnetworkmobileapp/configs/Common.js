import { Dimensions } from "react-native"
import * as SecureStore from 'expo-secure-store'
// import moment from 'moment'
import moment from 'moment-timezone';
// import 'moment/locale/vi'

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

export const hp = percentage => {
    return (percentage*deviceHeight) / 100;
}

export const wp = percentage => {
    return (percentage*deviceWidth) / 100;
}

export const saveToken = async (key, value) => {
    await SecureStore.setItemAsync(key, value);
}

export const getToken = async (key) => {
    return await SecureStore.getItemAsync(key);
}

export const deleteToken = async (key) => {
    await SecureStore.deleteItemAsync(key);
}

export const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>?/gm, '')
}

export const getFullName = (first_name, last_name) => {
    if(first_name !== 'undefined') return first_name + " " + last_name
    else return last_name
}

// moment.locale('vi')
export const getTimeFromNow = (created_date) => {
    // console.log(created_date)
    // return moment(created_date).fromNow()
    return moment.utc(created_date).tz("Asia/Ho_Chi_Minh").fromNow()
}
