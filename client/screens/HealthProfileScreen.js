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
import { API_URL } from '../config/constants';

const HealthProfileScreen = () => {
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [healthProfile, setHealthProfile] = useState({
        basicInfo: {
            height: null,
            weight: null,
            age: null,
            gender: null,
            bloodType: ''
        },
        healthConditions: {
            hasDiabetes: false,
            hasHypertension: false,
            hasHeartDisease: false,
            hasKidneyDisease: false,
            hasAllergies: []
        },
        lifestyle: {
            isVegetarian: false,
            isVegan: false,
            isGlutenFree: false,
            isLactoseFree: false,
            activityLevel: 'moderate'
        },
        dietaryGoals: {
            weightGoal: 'maintain',
            calorieGoal: null,
            proteinGoal: null,
            carbGoal: null,
            fatGoal: null
        },
        healthTags: []
    });

    useEffect(() => {
        loadHealthProfile();
    }, []);

    const loadHealthProfile = async () => {
        try {
            setLoading(true);
            const token = await authService.getToken();
            const response = await fetch(`${API_URL}/health/profile`, {
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
            const response = await fetch(`${API_URL}/health/profile`, {
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
            {/* 基本信息 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>基本信息</Text>
                {editing ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.height?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    height: parseFloat(text) || null
                                }
                            })}
                            placeholder="身高(cm)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.weight?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    weight: parseFloat(text) || null
                                }
                            })}
                            placeholder="体重(kg)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.basicInfo.age?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    age: parseInt(text) || null
                                }
                            })}
                            placeholder="年龄"
                            keyboardType="numeric"
                        />
                        <Picker
                            selectedValue={healthProfile.basicInfo.gender}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    gender: value
                                }
                            })}
                        >
                            <Picker.Item label="请选择性别" value={null} />
                            <Picker.Item label="男" value="male" />
                            <Picker.Item label="女" value="female" />
                            <Picker.Item label="其他" value="other" />
                        </Picker>
                        <Picker
                            selectedValue={healthProfile.basicInfo.bloodType}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                basicInfo: {
                                    ...healthProfile.basicInfo,
                                    bloodType: value
                                }
                            })}
                        >
                            <Picker.Item label="请选择血型" value="" />
                            <Picker.Item label="A型" value="A" />
                            <Picker.Item label="B型" value="B" />
                            <Picker.Item label="AB型" value="AB" />
                            <Picker.Item label="O型" value="O" />
                        </Picker>
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>身高: {healthProfile.basicInfo.height ? `${healthProfile.basicInfo.height}cm` : '未设置'}</Text>
                        <Text style={styles.text}>体重: {healthProfile.basicInfo.weight ? `${healthProfile.basicInfo.weight}kg` : '未设置'}</Text>
                        <Text style={styles.text}>年龄: {healthProfile.basicInfo.age || '未设置'}</Text>
                        <Text style={styles.text}>性别: {healthProfile.basicInfo.gender === 'male' ? '男' : healthProfile.basicInfo.gender === 'female' ? '女' : healthProfile.basicInfo.gender === 'other' ? '其他' : '未设置'}</Text>
                        <Text style={styles.text}>血型: {healthProfile.basicInfo.bloodType || '未设置'}</Text>
                    </>
                )}
            </View>

            {/* 健康状况 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>健康状况</Text>
                {editing ? (
                    <>
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.healthConditions.hasDiabetes && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    healthConditions: {
                                        ...healthProfile.healthConditions,
                                        hasDiabetes: !healthProfile.healthConditions.hasDiabetes
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>糖尿病</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.healthConditions.hasHypertension && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    healthConditions: {
                                        ...healthProfile.healthConditions,
                                        hasHypertension: !healthProfile.healthConditions.hasHypertension
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>高血压</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.healthConditions.hasHeartDisease && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    healthConditions: {
                                        ...healthProfile.healthConditions,
                                        hasHeartDisease: !healthProfile.healthConditions.hasHeartDisease
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>心脏病</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.healthConditions.hasKidneyDisease && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    healthConditions: {
                                        ...healthProfile.healthConditions,
                                        hasKidneyDisease: !healthProfile.healthConditions.hasKidneyDisease
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>肾病</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={healthProfile.healthConditions.hasAllergies.join(', ')}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                healthConditions: {
                                    ...healthProfile.healthConditions,
                                    hasAllergies: text.split(',').map(item => item.trim())
                                }
                            })}
                            placeholder="过敏原（用逗号分隔）"
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>糖尿病: {healthProfile.healthConditions.hasDiabetes ? '是' : '否'}</Text>
                        <Text style={styles.text}>高血压: {healthProfile.healthConditions.hasHypertension ? '是' : '否'}</Text>
                        <Text style={styles.text}>心脏病: {healthProfile.healthConditions.hasHeartDisease ? '是' : '否'}</Text>
                        <Text style={styles.text}>肾病: {healthProfile.healthConditions.hasKidneyDisease ? '是' : '否'}</Text>
                        <Text style={styles.text}>过敏原: {healthProfile.healthConditions.hasAllergies.length > 0 ? healthProfile.healthConditions.hasAllergies.join(', ') : '无'}</Text>
                    </>
                )}
            </View>

            {/* 生活方式 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>生活方式</Text>
                {editing ? (
                    <>
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.lifestyle.isVegetarian && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    lifestyle: {
                                        ...healthProfile.lifestyle,
                                        isVegetarian: !healthProfile.lifestyle.isVegetarian
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>素食</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.lifestyle.isVegan && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    lifestyle: {
                                        ...healthProfile.lifestyle,
                                        isVegan: !healthProfile.lifestyle.isVegan
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>纯素</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.lifestyle.isGlutenFree && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    lifestyle: {
                                        ...healthProfile.lifestyle,
                                        isGlutenFree: !healthProfile.lifestyle.isGlutenFree
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>无麸质</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.checkbox, healthProfile.lifestyle.isLactoseFree && styles.checkboxSelected]}
                                onPress={() => setHealthProfile({
                                    ...healthProfile,
                                    lifestyle: {
                                        ...healthProfile.lifestyle,
                                        isLactoseFree: !healthProfile.lifestyle.isLactoseFree
                                    }
                                })}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.checkboxText}>无乳糖</Text>
                            </TouchableOpacity>
                        </View>
                        <Picker
                            selectedValue={healthProfile.lifestyle.activityLevel}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                lifestyle: {
                                    ...healthProfile.lifestyle,
                                    activityLevel: value
                                }
                            })}
                        >
                            <Picker.Item label="久坐不动" value="sedentary" />
                            <Picker.Item label="轻度活动" value="light" />
                            <Picker.Item label="中度活动" value="moderate" />
                            <Picker.Item label="高度活动" value="active" />
                            <Picker.Item label="非常活跃" value="very_active" />
                        </Picker>
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>素食: {healthProfile.lifestyle.isVegetarian ? '是' : '否'}</Text>
                        <Text style={styles.text}>纯素: {healthProfile.lifestyle.isVegan ? '是' : '否'}</Text>
                        <Text style={styles.text}>无麸质: {healthProfile.lifestyle.isGlutenFree ? '是' : '否'}</Text>
                        <Text style={styles.text}>无乳糖: {healthProfile.lifestyle.isLactoseFree ? '是' : '否'}</Text>
                        <Text style={styles.text}>活动水平: {
                            healthProfile.lifestyle.activityLevel === 'sedentary' ? '久坐不动' :
                            healthProfile.lifestyle.activityLevel === 'light' ? '轻度活动' :
                            healthProfile.lifestyle.activityLevel === 'moderate' ? '中度活动' :
                            healthProfile.lifestyle.activityLevel === 'active' ? '高度活动' :
                            healthProfile.lifestyle.activityLevel === 'very_active' ? '非常活跃' : '未设置'
                        }</Text>
                    </>
                )}
            </View>

            {/* 饮食目标 */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>饮食目标</Text>
                {editing ? (
                    <>
                        <Picker
                            selectedValue={healthProfile.dietaryGoals.weightGoal}
                            onValueChange={(value) => setHealthProfile({
                                ...healthProfile,
                                dietaryGoals: {
                                    ...healthProfile.dietaryGoals,
                                    weightGoal: value
                                }
                            })}
                        >
                            <Picker.Item label="减重" value="lose" />
                            <Picker.Item label="维持体重" value="maintain" />
                            <Picker.Item label="增重" value="gain" />
                        </Picker>
                        <TextInput
                            style={styles.input}
                            value={healthProfile.dietaryGoals.calorieGoal?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                dietaryGoals: {
                                    ...healthProfile.dietaryGoals,
                                    calorieGoal: parseInt(text) || null
                                }
                            })}
                            placeholder="每日卡路里目标"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.dietaryGoals.proteinGoal?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                dietaryGoals: {
                                    ...healthProfile.dietaryGoals,
                                    proteinGoal: parseInt(text) || null
                                }
                            })}
                            placeholder="每日蛋白质目标(g)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.dietaryGoals.carbGoal?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                dietaryGoals: {
                                    ...healthProfile.dietaryGoals,
                                    carbGoal: parseInt(text) || null
                                }
                            })}
                            placeholder="每日碳水目标(g)"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.input}
                            value={healthProfile.dietaryGoals.fatGoal?.toString() || ''}
                            onChangeText={(text) => setHealthProfile({
                                ...healthProfile,
                                dietaryGoals: {
                                    ...healthProfile.dietaryGoals,
                                    fatGoal: parseInt(text) || null
                                }
                            })}
                            placeholder="每日脂肪目标(g)"
                            keyboardType="numeric"
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.text}>体重目标: {
                            healthProfile.dietaryGoals.weightGoal === 'lose' ? '减重' :
                            healthProfile.dietaryGoals.weightGoal === 'maintain' ? '维持体重' :
                            healthProfile.dietaryGoals.weightGoal === 'gain' ? '增重' : '未设置'
                        }</Text>
                        <Text style={styles.text}>每日卡路里目标: {healthProfile.dietaryGoals.calorieGoal || '未设置'}</Text>
                        <Text style={styles.text}>每日蛋白质目标: {healthProfile.dietaryGoals.proteinGoal ? `${healthProfile.dietaryGoals.proteinGoal}g` : '未设置'}</Text>
                        <Text style={styles.text}>每日碳水目标: {healthProfile.dietaryGoals.carbGoal ? `${healthProfile.dietaryGoals.carbGoal}g` : '未设置'}</Text>
                        <Text style={styles.text}>每日脂肪目标: {healthProfile.dietaryGoals.fatGoal ? `${healthProfile.dietaryGoals.fatGoal}g` : '未设置'}</Text>
                    </>
                )}
            </View>

            {/* 健康标签 */}
            {healthProfile.healthTags.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>健康标签</Text>
                    <View style={styles.tagsContainer}>
                        {healthProfile.healthTags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

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
    checkboxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    checkbox: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#e0e0e0',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    checkboxText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#e0e0e0',
        padding: 5,
        borderRadius: 5,
        margin: 5,
    },
    tagText: {
        fontSize: 14,
        color: '#333',
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