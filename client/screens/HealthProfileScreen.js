import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { databaseService } from '../services/databaseService';
import authService from '../services/authService';

const HealthProfileScreen = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [healthProfile, setHealthProfile] = useState({
        allergies: [],
        dietaryRestrictions: [],
        healthConditions: [],
        medications: [],
        bloodType: '',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        }
    });

    useEffect(() => {
        loadHealthProfile();
    }, []);

    const loadHealthProfile = async () => {
        try {
            setLoading(true);
            const token = await authService.getToken();
            const response = await fetch('http://localhost:3000/api/health/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.data) {
                setHealthProfile(data.data);
            }
        } catch (error) {
            console.error('加载健康档案失败:', error);
            Alert.alert('错误', '加载健康档案失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = await authService.getToken();
            const response = await fetch('http://localhost:3000/api/health/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(healthProfile)
            });
            const data = await response.json();
            if (data.message === '健康档案更新成功') {
                Alert.alert('成功', '健康档案已更新');
                setEditing(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('保存健康档案失败:', error);
            Alert.alert('错误', '保存健康档案失败');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>过敏信息</Text>
                {editing ? (
                    <TextInput
                        style={styles.input}
                        value={healthProfile.allergies.join(', ')}
                        onChangeText={(text) => setHealthProfile({
                            ...healthProfile,
                            allergies: text.split(',').map(item => item.trim())
                        })}
                        placeholder="输入过敏信息，用逗号分隔"
                    />
                ) : (
                    <Text style={styles.text}>
                        {healthProfile.allergies.length > 0 ? healthProfile.allergies.join(', ') : '无'}
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>饮食限制</Text>
                {editing ? (
                    <TextInput
                        style={styles.input}
                        value={healthProfile.dietaryRestrictions.join(', ')}
                        onChangeText={(text) => setHealthProfile({
                            ...healthProfile,
                            dietaryRestrictions: text.split(',').map(item => item.trim())
                        })}
                        placeholder="输入饮食限制，用逗号分隔"
                    />
                ) : (
                    <Text style={styles.text}>
                        {healthProfile.dietaryRestrictions.length > 0 ? healthProfile.dietaryRestrictions.join(', ') : '无'}
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>健康状况</Text>
                {editing ? (
                    <TextInput
                        style={styles.input}
                        value={healthProfile.healthConditions.join(', ')}
                        onChangeText={(text) => setHealthProfile({
                            ...healthProfile,
                            healthConditions: text.split(',').map(item => item.trim())
                        })}
                        placeholder="输入健康状况，用逗号分隔"
                    />
                ) : (
                    <Text style={styles.text}>
                        {healthProfile.healthConditions.length > 0 ? healthProfile.healthConditions.join(', ') : '无'}
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>药物信息</Text>
                {editing ? (
                    <TextInput
                        style={styles.input}
                        value={healthProfile.medications.join(', ')}
                        onChangeText={(text) => setHealthProfile({
                            ...healthProfile,
                            medications: text.split(',').map(item => item.trim())
                        })}
                        placeholder="输入药物信息，用逗号分隔"
                    />
                ) : (
                    <Text style={styles.text}>
                        {healthProfile.medications.length > 0 ? healthProfile.medications.join(', ') : '无'}
                    </Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>血型</Text>
                {editing ? (
                    <Picker
                        selectedValue={healthProfile.bloodType}
                        onValueChange={(value) => setHealthProfile({
                            ...healthProfile,
                            bloodType: value
                        })}
                    >
                        <Picker.Item label="请选择血型" value="" />
                        <Picker.Item label="A型" value="A" />
                        <Picker.Item label="B型" value="B" />
                        <Picker.Item label="AB型" value="AB" />
                        <Picker.Item label="O型" value="O" />
                    </Picker>
                ) : (
                    <Text style={styles.text}>{healthProfile.bloodType || '未设置'}</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>紧急联系人</Text>
                {editing ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={healthProfile.emergencyContact.name}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                emergencyContact: {
                                    ...healthProfile.emergencyContact,
                                    name: text
                                }
                            })}
                            placeholder="姓名"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.emergencyContact.phone}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                emergencyContact: {
                                    ...healthProfile.emergencyContact,
                                    phone: text
                                }
                            })}
                            placeholder="电话"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.emergencyContact.relationship}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                emergencyContact: {
                                    ...healthProfile.emergencyContact,
                                    relationship: text
                                }
                            })}
                            placeholder="关系"
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>姓名: {healthProfile.emergencyContact.name || '未设置'}</Text>
                        <Text style={styles.text}>电话: {healthProfile.emergencyContact.phone || '未设置'}</Text>
                        <Text style={styles.text}>关系: {healthProfile.emergencyContact.relationship || '未设置'}</Text>
                    </>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {editing ? (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>保存</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setEditing(false)}
                        >
                            <Text style={styles.buttonText}>取消</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() => setEditing(true)}
                    >
                        <Text style={styles.buttonText}>编辑</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        ...Platform.select({
            web: {
                height: '100%',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
            },
            default: {
                flex: 1,
            },
        }),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    section: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        flexGrow: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    text: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        marginBottom: 40
    },
    button: {
        padding: 15,
        borderRadius: 5,
        minWidth: 120,
        alignItems: 'center'
    },
    editButton: {
        backgroundColor: '#007AFF'
    },
    saveButton: {
        backgroundColor: '#34C759'
    },
    cancelButton: {
        backgroundColor: '#FF3B30'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default HealthProfileScreen; 