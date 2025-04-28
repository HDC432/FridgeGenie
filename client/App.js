import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import FamilyScreen from './screens/FamilyScreen';
import AddItemScreen from './screens/AddItemScreen';
import RecipeScreen from './screens/RecipeScreen';
import UserAvatar from './components/UserAvatar';
import UserMenu from './components/UserMenu';

const Stack = createStackNavigator();

const Navigation = () => {
  const { user, loading } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  console.log('Navigation rendered, user:', user);
  console.log('Menu visible:', menuVisible);

  if (loading) {
    return null; // 或者显示加载指示器
  }

  const handleMenuPress = () => {
    console.log('Menu button pressed');
    setMenuVisible(true);
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          // 已登录状态
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: '冰箱物品清单',
                headerRight: () => (
                  <View style={styles.headerRight}>
                    <UserAvatar
                      user={user}
                      onPress={handleMenuPress}
                    />
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{ title: '添加物品' }}
            />
            <Stack.Screen
              name="Recipe"
              component={RecipeScreen}
              options={{ title: '菜谱' }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfileScreen}
              options={{ title: '用户信息' }}
            />
            <Stack.Screen
              name="Family"
              component={FamilyScreen}
              options={{ title: '我的家庭' }}
            />
          </>
        ) : (
          // 未登录状态
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>

      <UserMenu
        visible={menuVisible}
        onClose={() => {
          console.log('Menu closing');
          setMenuVisible(false);
        }}
      />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Navigation />
        </View>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        height: '100vh',
        overflow: 'visible',
      },
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
});
