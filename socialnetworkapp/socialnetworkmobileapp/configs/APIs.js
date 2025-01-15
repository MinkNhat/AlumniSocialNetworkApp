import axios from "axios"
import Constants from 'expo-constants'

const { BASE_URL } = Constants.expoConfig.extra;

export const endpoints = {
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'register': '/users/'
}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}   

export default axios.create({
    baseURL: BASE_URL  
})   