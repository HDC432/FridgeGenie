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
const ProfileStack = createStackNavigator();

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FCD34D',
        },
        headerTintColor: '#1F2B40',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={UserProfileScreen}
        options={{ title: '我的' }}
      />
      <ProfileStack.Screen
        name="HealthProfile"
        component={HealthProfileScreen}
        options={{ title: '健康信息' }}
      />
      <ProfileStack.Screen
        name="FavoriteRecipes"
        component={FavoriteRecipesScreen}
        options={{ title: '收藏的菜谱' }}
      />
      <ProfileStack.Screen
        name="Family"
        component={FamilyScreen}
        options={{ title: '我的家庭' }}
      />
    </ProfileStack.Navigator>
  );
};

const TabNavigator = () => {
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
        tabBarActiveTintColor: '#FCD34D',
        tabBarInactiveTintColor: '#1F2B40',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
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
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'My Fridge' }}
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
        component={ProfileStackNavigator}
        options={{ 
          title: '我的',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

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
          headerShown: false,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
          </>
        ) : (
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
          <AIAssistant />
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
