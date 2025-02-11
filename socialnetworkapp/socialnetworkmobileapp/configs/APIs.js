import axios from "axios"
import Constants from 'expo-constants'

const { BASE_URL } = Constants.expoConfig.extra;

export const endpoints = {
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'users': '/users/',
    'posts': '/posts/',
    'post-details': (postId) => `/posts/${postId}/`,
    'media': (postId) => `/posts/${postId}/media/`,
    'action': (postId) => `/posts/${postId}/action/`,
    'comments': (postId) => `/posts/${postId}/comments/`,
    'comment-details': (commentId) => `/comments/${commentId}/`,
    'messages_list': '/messages/list/',
    'events': '/events/' ,
    'surveys': '/surveys/',
    'responses': (surveyId) => `/surveys/${surveyId}/responses/`,
    'timeline': (userId) => `/users/${userId}/user-posts/`,
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