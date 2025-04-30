import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
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
import AIAssistant from './src/components/AIAssistant';
import FavoriteRecipesScreen from './screens/FavoriteRecipesScreen';
import RecommendedItemsScreen from './screens/RecommendedItemsScreen';
import theme from './styles/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Recipe') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'AddItem') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Recommended') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.COLORS.PRIMARY,
        tabBarInactiveTintColor: theme.COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: theme.COLORS.BACKGROUND,
          borderTopColor: theme.COLORS.LIGHT_GRAY,
        },
        headerStyle: {
          backgroundColor: theme.COLORS.BACKGROUND,
        },
        headerTintColor: theme.COLORS.TEXT_PRIMARY,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: '首页',
        }}
      />
      <Tab.Screen 
        name="Recipe" 
        component={RecipeScreen}
        options={{ title: '菜谱' }}
      />
      <Tab.Screen 
        name="AddItem" 
        component={AddItemScreen}
        options={{ title: '添加物品' }}
      />
      <Tab.Screen 
        name="Recommended" 
        component={RecommendedItemsScreen}
        options={{ title: '推荐' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={UserProfileScreen}
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { user, loading } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
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
        ) : (
          // 已登录状态
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
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
        )}
      </Stack.Navigator>
      <UserMenu
        visible={isMenuVisible}
        onClose={handleMenuClose}
      />
      <AIAssistant />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
});

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
