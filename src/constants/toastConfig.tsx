import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <SandwichToast
      {...props}
      bgColor="#FFF5E6"  // Toasty bread color
      borderColor="#F59E0B"  // Golden crust
      emoji="🥪"  // Sandwich emoji
    />
  ),
  error: (props: any) => (
    <SandwichToast
      {...props}
      bgColor="#FFEBEE"  // Light pink for errors
      borderColor="#EF4444"  // Tomato red
      emoji="😢"  // Sad bread
    />
  ),
  info: (props: any) => (
    <SandwichToast
      {...props}
      bgColor="#EFF6FF"  // Light blue for info
      borderColor="#3B82F6"  // Blue cheese?
      emoji="🥖✨"  // Baguette with sparkles
    />
  ),
};

const SandwichToast = ({ 
  bgColor, 
  borderColor, 
  emoji, 
  ...props 
}: any) => (
  <BaseToast
    {...props}
    style={[styles.toastBase, { 
      backgroundColor: bgColor, 
      borderColor: borderColor 
    }]}
    contentContainerStyle={styles.content}
    text1Style={styles.text1}
    text2Style={styles.text2}
    text1NumberOfLines={1}
    text2NumberOfLines={2}
    renderLeadingIcon={() => (
      <View style={[styles.emojiCircle, { borderColor }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  toastBase: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    width: '90%',
  },
  content: {
    paddingHorizontal: 12,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#431407',  // Dark toasted brown
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    color: '#78350F',  // Medium brown
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 20,
  },
});