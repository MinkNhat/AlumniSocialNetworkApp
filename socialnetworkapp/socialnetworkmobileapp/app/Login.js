import { View, Text, Pressable, Alert } from "react-native";
import React, { useContext, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import { StatusBar } from "expo-status-bar";
import Styles from "../styles/Styles";
import Input from "../components/Input";
import Button from "../components/Button";
import { Theme } from "../configs/Theme";
import { useNavigation } from "@react-navigation/native";
import APIs, { authApis, endpoints } from "../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { MyDispatchContext } from "../configs/MyUserContext";
import { getToken, hp, saveToken } from "../configs/Common";
import { HelperText } from "react-native-paper";
import { validateField } from "../configs/ValidateInput";

const Login = () => {
  const { CLIENT_ID, CLIENT_SECRET } = Constants.expoConfig.extra;
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const [errMessage, setErrMessage] = useState(null);
  const dispatch = useContext(MyDispatchContext);

  const nav = useNavigation();

  const users = {
    username: {
      title: "Tên đăng nhập",
      field: "username",
      icon: "user",
      secure: false,
    },
    password: {
      title: "Mật khẩu",
      field: "password",
      icon: "lock",
      secure: true,
    },
  };

  const inputChange = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const validate = () => {
    for (const key in users) {
      const field = users[key].field;
      const value = user[field];

      const error = validateField(field, value, user, true);
      if (error) {
        setErr(true);
        setErrMessage(error);
        return false;
      }
    }
    return true;
  };

  const login = async () => {
    if (validate()) {
      setErr(false);
      setErrMessage(null);
      setLoading(true);

      try {
        let res = await APIs.post(endpoints["login"], {
          ...user,
          grant_type: "password",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        });

        await saveToken("token", res.data.access_token);

        setTimeout(async () => {
          let user = await authApis(res.data.access_token).get(
            endpoints["current-user"]
          );
          dispatch({
            type: "login",
            payload: user.data,
          });
        }, 100);
      } catch (ex) {
        // setErr(true)
        // setErrMessage({'msg':'Mật khẩu không chính xác!', 'field':'password'})
        if (ex.response) {
          Alert.alert("Lỗi đăng nhập", ex.response.data.error_description);
        }
        return false;
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />

      <View style={Styles.container}>
        <BackButton title="Đăng Nhập" />

        <View style={{ gap: 30, marginTop: hp(10) }}>
          {Object.values(users).map((u) => (
            <Input
              icon={u.icon}
              placeholder={u.title}
              key={u.field}
              value={user[u.field]}
              onChangeText={(value) => inputChange(value, u.field)}
              passwordField={u.secure}
              hasError={
                errMessage && errMessage.field === u.field ? true : false
              }
            />
          ))}

          {!err ? (
            <></>
          ) : (
            <HelperText type="error" visible={err} style={Styles.errorMessage}>
              {errMessage ? errMessage.msg : ""}
            </HelperText>
          )}

          <Text
            style={{ alignSelf: "flex-end", fontSize: 16, marginBottom: 20 }}
          >
            Quên mật khẩu?
          </Text>

          <Button
            title={"Đăng nhập"}
            loading={loading}
            onPress={login}
            textStyle={{ fontSize: 20 }}
          />

          <View style={{ flexDirection: "row", margin: "auto" }}>
            <Text style={Styles.footerText}>Nếu chưa có tài khoản?</Text>
            <Pressable
              onPress={() => {
                nav.navigate("register");
              }}
            >
              <Text
                style={[
                  Styles.footerText,
                  {
                    color: Theme.colors.primary,
                    marginLeft: "6",
                    fontWeight: Theme.fonts.semiBold,
                  },
                ]}
              >
                Đăng kí ngay
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;
