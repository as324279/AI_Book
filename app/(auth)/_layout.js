// app/(auth)/_layout.js
import { Stack } from 'expo-router';

const AuthLayout = ()=> {
  return <Stack screenOptions={{ headerShown: false }} />;
}
export default AuthLayout;