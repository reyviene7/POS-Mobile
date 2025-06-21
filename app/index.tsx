import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/EggCited-Logo-wo-bg.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.tagline}>
        “Where Every Bite Cracks Joy — The OG Korean Eggdrop Sandwich!”
      </Text>

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
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#FCD34D',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '600',
  },
});
