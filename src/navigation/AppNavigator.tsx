import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/Navigation';

import { HomeScreen } from '../screens/HomeScreen';
import { IndicacaoFormScreen } from '../screens/IndicacaoFormScreen';
import { IndicacaoDetailsScreen } from '../screens/IndicacaoDetailsScreen';
import { ApiSearchScreen } from '../screens/ApiSearchScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Joga Essa 🎮' }}
        />
        <Stack.Screen
          name="IndicacaoForm"
          component={IndicacaoFormScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Editar Indicação' : 'Nova Indicação',
          })}
        />
        <Stack.Screen
          name="IndicacaoDetails"
          component={IndicacaoDetailsScreen}
          options={{ title: 'Detalhes' }}
        />
        <Stack.Screen
          name="ApiSearch"
          component={ApiSearchScreen}
          options={{ title: 'Buscar na API' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Histórico' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
