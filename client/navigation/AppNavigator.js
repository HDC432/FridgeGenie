import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import RecipeScreen from '../screens/RecipeScreen';
import FamilyScreen from '../screens/FamilyScreen';
import HealthProfileScreen from '../screens/HealthProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Recipes') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Family') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Health') {
                        iconName = focused ? 'medkit' : 'medkit-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeStack}
                options={{ 
                    title: '首页',
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Recipes" 
                component={RecipeScreen}
                options={{ title: '菜谱' }}
            />
            <Tab.Screen 
                name="Family" 
                component={FamilyScreen}
                options={{ title: '家庭' }}
            />
            <Tab.Screen 
                name="Health" 
                component={HealthProfileScreen}
                options={{ title: '健康档案' }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator; 