import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Index from './app/Index';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './app/Welcome';
import { NavigationContainer } from '@react-navigation/native';
import Login from './app/Login';
import Register from './app/Register';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserProfile from './app/UserProfile';
import Icon from './assets/icons';
import { useContext, useEffect, useReducer, useState } from 'react';
import MyUserReducers from './configs/MyUserReducers';
import { MyDispatchContext, MyUserContext } from './configs/MyUserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from './configs/APIs';
import { getToken } from './configs/Common';
import Home from './app/Home';
import CreateNewPost from './app/CreateNewPost';
import { db } from "./configs/Firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import PostDetails from './app/PostDetails';
import { PaperProvider } from 'react-native-paper';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import ChatListScreen from './app/ChatListScreen';
import ChatScreen from './app/ChatScreen';
import ChangePassword from './app/ChangePassword';
import CreateEventPost from './app/CreateEventPost';
import CreateSurveyPost from './app/CreateSurveyPost';
import TimeLine from './app/TimeLine';

// config prevent warning from reanimated
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // default = true
});


const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='index' component={Index}/>
      <Stack.Screen name='welcome' component={Welcome}/>
      <Stack.Screen name='login' component={Login}/>
      <Stack.Screen name='register' component={Register}/>
    </Stack.Navigator>
  );
}

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='home' component={Home}/>
      <Stack.Screen name='create-new-post' component={CreateNewPost}/>
      <Stack.Screen name='create-survey-post' component={CreateSurveyPost}/>
      <Stack.Screen name='create-event-post' component={CreateEventPost}/>
      <Stack.Screen name='time-line' component={TimeLine}/>
      <Stack.Screen name='post-details' component={PostDetails} options={{presentation: 'modal'}}/>
    </Stack.Navigator>
  )
}

const ChatStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='chatlist' component={ChatListScreen}/>
      <Stack.Screen name='chatscreen' component={ChatScreen}/>
    </Stack.Navigator>
  )
}

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='user-profile' component={UserProfile}/>
      <Stack.Screen name='change-password' component={ChangePassword}/>
    </Stack.Navigator>
  )
}

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="home-stack" component={HomeStackNavigator} options={{title: "Màn hình chính", tabBarIcon: () => <Icon name={'home'} size={20} />}} />
      <Tab.Screen name="chat" component={ChatStackNavigator} options={{title: "Chatbox", tabBarIcon: () => <Icon name={'user'} size={20} />}} />
      <Tab.Screen name="profile" component={ProfileStackNavigator} options={{title: "Tài khoản", tabBarIcon: () => <Icon name={'lock'} size={20} />}} />
    </Tab.Navigator>
  );
}

export default function App() {
const [user, dispatch] = useReducer(MyUserReducers, null)

const checkLoginStatus = async () => {
  try {
    const token = await getToken('token')
    if (token) {
      let user = await authApis(token).get(endpoints['current-user']);
      dispatch({
        type: 'login',
        payload: user.data,
      });
    }
  } catch (error) {
    // setIsLogged(false)
  } finally {
    
  }
};

useEffect(() => {
  checkLoginStatus();
}, [])

useEffect(() => {
  const checkFirestore = async () => {
      try {
          const testDocs = await getDocs(collection(db, "test"));
          console.log("Firestore Connected: ", testDocs.size);
      } catch (error) {
          console.error("Firestore Error:", error.message);
      }
  };
  checkFirestore();
}, []);

  return (
    <ActionSheetProvider>
    <PaperProvider>
    <SafeAreaProvider>
      <NavigationContainer>
        <MyUserContext.Provider value={user}>
          <MyDispatchContext.Provider value={dispatch}>
            {user!==null? <TabNavigator/> : <StackNavigator/>}
          </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      </NavigationContainer>
    </SafeAreaProvider>
    </PaperProvider>
    </ActionSheetProvider>
  );
}
