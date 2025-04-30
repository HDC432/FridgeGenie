/**
 * Navigation configuration for the application
 * Sets up the bottom tab navigation and stack navigation structure
 */
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

/**
 * Stack navigator for the Home screen
 * Currently only contains the Home screen with header hidden
 * @returns {JSX.Element} Stack navigator component
 */
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

/**
 * Main application navigator component
 * Implements a bottom tab navigation with themed styling
 * @returns {JSX.Element} Tab navigator component
 */
const AppNavigator = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Recipe') {
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
                    title: 'Home',
                    headerShown: false
                }}
            />
            <Tab.Screen 
                name="Recipe" 
                component={RecipeScreen}
                options={{ title: 'Recipes' }}
            />
            <Tab.Screen 
                name="Family" 
                component={FamilyScreen}
                options={{ title: 'Family' }}
            />
            <Tab.Screen 
                name="Health" 
                component={HealthProfileScreen}
                options={{ title: 'Health Profile' }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator; 