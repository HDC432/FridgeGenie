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
import HealthProfileScreen from './screens/HealthProfileScreen';
import FavoriteRecipesScreen from './screens/FavoriteRecipesScreen';
import theme from './styles/theme';

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
            backgroundColor: '#FCD34D',
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
          headerTintColor: '#1F2B40',
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
                title: 'My Fridge',
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
            <Stack.Screen
              name="HealthProfile"
              component={HealthProfileScreen}
              options={{ title: '健康信息' }}
            />
            <Stack.Screen
              name="FavoriteRecipes"
              component={FavoriteRecipesScreen}
              options={{ title: '收藏的菜谱' }}
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
        overflow: 'auto',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
});
