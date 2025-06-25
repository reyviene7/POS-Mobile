import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.success}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🥪</Text>
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.error}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconCircleError}>
          <Text style={styles.iconEmoji}>🍞😣</Text>
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={styles.info}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      renderLeadingIcon={() => (
        <View style={styles.iconCircleInfo}>
          <Text style={styles.iconEmoji}>🥖ℹ️</Text>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  success: {
    backgroundColor: 'rgba(254, 243, 199, 0.95)', // Buttery sandwich glow with slight transparency
    borderRadius: 24,
    borderTopLeftRadius: 12, // Bitten sandwich corner
    borderBottomRightRadius: 12, // Bitten sandwich corner
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Toasty crust
    transform: [{ scale: 1.03 }], // Bouncier effect
  },
  error: {
    backgroundColor: 'rgba(255, 228, 230, 0.95)', // Soft pink for oopsies
    borderRadius: 24,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 2.5,
    borderColor: '#F43F5E', // Red crust
    transform: [{ scale: 1.03 }],
  },
  info: {
    backgroundColor: 'rgba(224, 242, 254, 0.95)', // Breezy blue for info
    borderRadius: 24,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    shadowColor: '#431407',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 2.5,
    borderColor: '#3B82F6', // Blue crust
    transform: [{ scale: 1.03 }],
  },
  contentContainer: {
    paddingHorizontal: 14,
    flex: 1,
  },
  text1: {
    fontSize: 19,
    fontWeight: '700',
    color: '#431407', // Rich toasted brown
    fontFamily: 'Comic Sans MS', // Playful (suggest Bubblegum Sans)
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  text2: {
    fontSize: 15,
    color: '#713F12', // Warm brown
    fontFamily: 'Comic Sans MS',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FCD34D', // Cheesy yellow
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircleError: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDA4AF', // Rosy pink
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#F43F5E',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircleInfo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#93C5FD', // Sky blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    shadowColor: '#431407',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconEmoji: {
    fontSize: 28,
    textAlign: 'center',
  },
});