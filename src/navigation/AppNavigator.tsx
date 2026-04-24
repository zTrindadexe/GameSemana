import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList, RootStackParamList } from '../types/Navigation';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { IndicacaoFormScreen } from '../screens/IndicacaoFormScreen';
import { IndicacaoDetailsScreen } from '../screens/IndicacaoDetailsScreen';
import { ApiSearchScreen } from '../screens/ApiSearchScreen';
import { HistoryScreen } from '../screens/HistoryScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigatorStack() {
  const { usuario, logout } = useAuth();

  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Joga Essa 🎮',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={{ marginRight: 4 }}>
              <Text style={{ color: '#aaa', fontSize: 13 }}>
                {usuario?.nome}  ·  Sair
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <AppStack.Screen
        name="IndicacaoForm"
        component={IndicacaoFormScreen}
        options={({ route }) => ({
          title: route.params?.id ? 'Editar Indicação' : 'Nova Indicação',
        })}
      />
      <AppStack.Screen
        name="IndicacaoDetails"
        component={IndicacaoDetailsScreen}
        options={{ title: 'Detalhes' }}
      />
      <AppStack.Screen
        name="ApiSearch"
        component={ApiSearchScreen}
        options={{ title: 'Buscar na API' }}
      />
      <AppStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Histórico' }}
      />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const { usuario } = useAuth();

  return (
    <NavigationContainer>
      {usuario ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
