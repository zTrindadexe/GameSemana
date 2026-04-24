import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { getDatabase } from '../database/database';

const { width } = Dimensions.get('window');

type Props = {
  onPronto: () => void;
};

export function SplashScreenApp({ onPronto }: Props) {
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(escala, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const init = async () => {
      const inicio = Date.now();
      await getDatabase();
      const decorrido = Date.now() - inicio;
      const espera = Math.max(0, 2200 - decorrido);
      setTimeout(onPronto, espera);
    };

    init();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: opacidade, transform: [{ scale: escala }] }}>
        <Image
          source={require('../../assets/LogoJogaEssa.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <ActivityIndicator
        size="small"
        color="#6c63ff"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.75,
    height: width * 0.75,
  },
  spinner: {
    position: 'absolute',
    bottom: 60,
  },
});
