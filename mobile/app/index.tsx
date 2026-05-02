import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function RootIndex() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      setIsSplashVisible(false);
    }
  }, [isLoading]);

  if (isSplashVisible || isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  splashLogo: {
    width: '80%',
    height: 150,
  },
});
