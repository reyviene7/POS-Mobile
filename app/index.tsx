import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Toast from 'react-native-toast-message';
import api from '../api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: '🍞😣 Oops!',
        text2: 'Please enter both username and password.',
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/login', { username, password });
      console.log('Login response:', response.data);

      const { token, user, message } = response.data;

      // Use user details from login response or fallback to username
      const usernameToStore = user?.username || username;
      const firstnameToStore = user?.firstname || '';
      const userDetails = {
        age: user?.age || 0,
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        role: user?.role || '',
        username: user?.username || username,
      };

      // Store credentials
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('username', usernameToStore);
      await AsyncStorage.setItem('firstname', firstnameToStore);
      await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));

      if (token) {
        await AsyncStorage.setItem('token', token);
      } else {
        console.warn('Login succeeded but no token received');
      }

      // Log user details
      console.log('User details:', userDetails);

      Toast.show({
        type: 'success',
        text1: '🥪 Welcome to EggCited!',
        text2: `Welcome, ${firstnameToStore}! You’re ready to make some toasty sandwiches!`,
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 40,
      });

      setTimeout(() => {
        router.replace('/Home');
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Try again!';

      if (error?.message?.includes('Network Error')) {
        errorMessage = 'No connection to the kitchen!';
      } else if (error?.response?.data === 'Invalid credentials') {
        errorMessage = 'Wrong recipe! Try again.';
      }

      Toast.show({
        type: 'error',
        text1: '🍞 Oops!',
        text2: errorMessage,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 40,
        props: {
          emoji: '😣',
          bgColor: '#FFEBEE',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.headerIcon}>
              <Image
                source={{
                  uri: 'https://res.cloudinary.com/dzwjjpvdb/image/upload/v1754622867/LOGO_TRANSPARENT_ICON_rawimp.png',
                }}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>EggCited Sandwich Shop</Text>
            <Text style={styles.subtitle}>Login to start toasting!</Text>
            <TextInput
              placeholder="Username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#713F12"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#713F12"
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={26} color="#431407" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.buttonText}>🥖 Toast In!</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(255, 253, 235, 0.95)', // Light buttery yellow
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('6%'),
  },
  headerIcon: {
    width: wp('28%'),
    height: wp('28%'),
    borderRadius: wp('14%'),
    backgroundColor: '#FCD34D', // Cheesy yellow
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Toasty crust
    marginBottom: hp('3%'),
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerImage: {
    width: '80%',   // adjust to keep some padding in the yellow circle
    height: '80%',
  },
  title: {
    fontSize: wp('7.5%'),
    fontWeight: '700',
    color: '#431407', 
    textAlign: 'center',
    fontFamily: 'Comic Sans MS',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: wp('5%'),
    color: '#713F12', // Warm brown
    fontFamily: 'Comic Sans MS',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  input: {
    fontSize: wp('4.5%'), padding: hp('2%') , 
    borderWidth: 1.5,
    borderColor: '#F59E0B', // Toasty crust
    backgroundColor: '#FFF7ED', // Light bread color
    marginVertical: hp('0.5%'),
    borderRadius: wp('4%'),
    color: '#431407',
    fontFamily: 'Comic Sans MS',
    width: '100%',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eyeIcon: {
    position: 'absolute',
    right: wp('3%'),
    padding: wp('2%'),
  },
  loginButton: {
    backgroundColor: '#F43F5E', // Red for action
    borderRadius: wp('6%'),
    borderTopLeftRadius: 12, // Bitten corner
    borderBottomRightRadius: 12,
    paddingVertical: hp('2.2%'),
    paddingHorizontal: wp('10%'),
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#431407',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonText: {
    fontSize: wp('5%'),
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Comic Sans MS',
  },
});