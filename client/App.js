import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import ItemDetailsScreen from './screens/ItemDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: '冰箱库存管理' }}
          />
          <Stack.Screen 
            name="AddItem" 
            component={AddItemScreen} 
            options={{ title: '添加食材' }}
          />
          <Stack.Screen 
            name="ItemDetails" 
            component={ItemDetailsScreen} 
            options={{ title: '食材详情' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
} 