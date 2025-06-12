import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/wizard.png')} // <-- Replace with your wizard image path
        style={styles.wizardImage}
        contentFit="contain"
      />
      <Text style={styles.title}>THE POS WIZARD</Text>
      <Link href="/PointOfSales" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Point of Sales</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/Inventory" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Inventory</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  wizardImage: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C6F68D',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#222',
    fontSize: 20,
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
});