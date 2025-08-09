import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Link, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };

    checkAuth();
  }, []);

  if (isLoggedIn === null) {
    // Still loading, optionally show a splash or loading spinner
    return <View style={styles.container}><Text>Checking Login...</Text></View>;
  }

  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Image
        source="https://res.cloudinary.com/dzwjjpvdb/image/upload/v1750505959/EggCited/ixxau4ellammx0drebgo.png"
        style={styles.logo} contentFit="contain"
      />
      <Text style={styles.tagline}>
        “At EggCited, we take the humble egg sandwich to the next level ✨”
      </Text>
      <Link href="/PointOfSales" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🛒 Point of Sales</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/Inventory" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📦 Inventory</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#F43F5E' }]}
        onPress={async () => {
        await AsyncStorage.multiRemove(['isLoggedIn', 'username']);
          setIsLoggedIn(false);
        }}
      >
        <Text style={[styles.buttonText, { color: '#FFF' }]}>🚪 Logout</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 253, 235, 0.95)', // Light buttery yellow
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Toasty crust
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCD34D', // Cheesy yellow
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  headerEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  logo: {
    width: wp('80%'),
    height: wp('80%'),
    marginBottom: 20,
    borderRadius: wp('6%'),
    borderTopLeftRadius: wp('3%'),
    borderBottomRightRadius: wp('3%'),
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  tagline: {
    fontSize: wp('4.5%'), 
    paddingHorizontal: wp('4%'),
    color: '#431407', // Toasted brown
    fontFamily: 'Comic Sans MS',
    fontStyle: 'italic',
    marginBottom: hp('4%'),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: '#FCD34D', 
    borderRadius: wp('6%'),
    borderTopLeftRadius: wp('3%'),
    borderBottomRightRadius: wp('3%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('15%'),
    marginBottom: hp('2%'),
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#431407',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    fontSize: wp('5%'),
    color: '#431407',
    fontWeight: 'bold',
    fontFamily: 'Comic Sans MS',
  },
});