import React from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View, StyleSheet } from 'react-native';

const KeyboardAvoidingWrapper = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
