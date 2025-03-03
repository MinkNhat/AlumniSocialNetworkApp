import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Index from './app/Index';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './app/Welcome';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
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
import Constants from 'expo-constants';
import EditProfile from './app/EditProfile';
import { Theme } from './configs/Theme';

// config prevent warning from reanimated
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // default = true
});

// console.log("Expo Config Extra:", Constants.expoConfig.extra);


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
      <Stack.Screen name='edit-profile' component={EditProfile}/>
    </Stack.Navigator>
  )
}

const ChatStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='chatlist' component={ChatListScreen}/>
      <Stack.Screen
        name="chatscreen"
        component={ChatScreen}
        options={({ route }) => ({
          tabBarStyle: { display: 'none' }, // Ẩn tab bar
        })}
      />
    </Stack.Navigator>
  )
}

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name='user-profile' component={UserProfile}/>
      <Stack.Screen name='change-password' component={ChangePassword}/>
      <Stack.Screen name='time-line' component={TimeLine}/>
      <Stack.Screen name='edit-profile' component={EditProfile}/>
    </Stack.Navigator>
  )
}

const CustomTabBarStyle = {
  position: 'absolute',
  height: 80, // Độ cao của bottom bar
  left: 20, // Căn lề trái để tạo bo góc
  right: 20, // Căn lề phải để tạo bo góc
  // bottom: 20, // Khoảng cách từ bottom
  borderTopLeftRadius: 25, // Bo góc trên trái
  borderTopRightRadius: 25, // Bo góc trên phải
  backgroundColor: 'white',
  borderWidth: 0.2,
  paddingTop: 4,
  borderColor: Theme.colors.text,
}

const TabNavigator = () => {
  return (
    <Tab.Navigator 
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: CustomTabBarStyle,
      tabBarActiveTintColor: Theme.colors.primaryDark,
      tabBarInactiveTintColor: '#A0A0A0',
      tabBarLabelStyle: { fontSize: 12 },
      tabBarVisible: route.name !== 'chatscreen' || !useIsFocused(), // Ẩn khi ở ChatScreen
    })}
    >
      <Tab.Screen name="home-stack" component={HomeStackNavigator} options={{title: "Home", tabBarIcon: () => <Icon name={'home'} size={20} color={Theme.colors.text}/>}} />
      <Tab.Screen name="chat" component={ChatStackNavigator} options={{title: "Chat", tabBarIcon: () => <Icon name={'message'} size={20} color={Theme.colors.text}/>}} />
      <Tab.Screen name="profile" component={ProfileStackNavigator} options={{title: "Profile", tabBarIcon: () => <Icon name={'user'} size={20} color={Theme.colors.text}/>}} />
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
