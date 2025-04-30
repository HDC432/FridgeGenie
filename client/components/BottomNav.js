import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const routeName = route.name;

  return (
    <SafeAreaView style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('HomeScreen')}>
        <Ionicons 
          name="home-outline" 
          size={24} 
          color={routeName === 'HomeScreen' ? COLORS.PRIMARY : '#999'} 
        />
        <Text style={[styles.label, routeName === 'HomeScreen' ? { color: COLORS.PRIMARY } : {}]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Add Tab */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('AddItemScreen')}>
        <Ionicons 
          name="add-circle-outline" 
          size={24} 
          color={routeName === 'AddItemScreen' ? COLORS.PRIMARY : '#999'} 
        />
        <Text style={[styles.label, routeName === 'AddItemScreen' ? { color: COLORS.PRIMARY } : {}]}>
          Add
        </Text>
      </TouchableOpacity>

      {/* Scan Tab */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('ScanReceiptScreen')}>
        <Ionicons 
          name="scan-outline" 
          size={24} 
          color={routeName === 'ScanReceiptScreen' ? COLORS.PRIMARY : '#999'} 
        />
        <Text style={[styles.label, routeName === 'ScanReceiptScreen' ? { color: COLORS.PRIMARY } : {}]}>
          Scan
        </Text>
      </TouchableOpacity>

      {/* Recommended Tab */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('RecommendedItemsScreen')}>
        <Ionicons 
          name="star-outline" 
          size={24} 
          color={routeName === 'RecommendedItemsScreen' ? COLORS.PRIMARY : '#999'} 
        />
        <Text style={[styles.label, routeName === 'RecommendedItemsScreen' ? { color: COLORS.PRIMARY } : {}]}>
          推荐
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('UserProfileScreen')}>
        <Ionicons 
          name="person-outline" 
          size={24} 
          color={routeName === 'UserProfileScreen' ? COLORS.PRIMARY : '#999'} 
        />
        <Text style={[styles.label, routeName === 'UserProfileScreen' ? { color: COLORS.PRIMARY } : {}]}>
          Profile
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  tab: {
    flex: 1,
    alignItems: 'center'
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    color: '#999'
  }
});

export default BottomNav; 