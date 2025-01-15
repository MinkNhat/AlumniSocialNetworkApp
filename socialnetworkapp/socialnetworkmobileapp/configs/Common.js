import { Dimensions } from "react-native"
import * as SecureStore from 'expo-secure-store'

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


