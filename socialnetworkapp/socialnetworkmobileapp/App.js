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
import Chatbox from './app/Chatbox';
import UserProfile from './app/UserProfile';
import Icon from './assets/icons';
import { useContext, useEffect, useReducer, useState } from 'react';
import MyUserReducers from './configs/MyUserReducers';
import { MyDispatchContext, MyUserContext } from './configs/MyUserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApis, endpoints } from './configs/APIs';
import { getToken } from './configs/Common';
import Home from './app/Home';

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

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="home" component={Home} options={{title: "Màn hình chính", tabBarIcon: () => <Icon name={'home'} size={20} />}} />
      <Tab.Screen name="chat" component={Chatbox} options={{title: "Chatbox", tabBarIcon: () => <Icon name={'home'} size={20} />}} />
      <Tab.Screen name="profile" component={UserProfile} options={{title: "Tài khoản", tabBarIcon: () => <Icon name={'home'} size={20} />}} />
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

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MyUserContext.Provider value={user}>
          <MyDispatchContext.Provider value={dispatch}>
            {user!==null? <TabNavigator/> : <StackNavigator/>}
          </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
