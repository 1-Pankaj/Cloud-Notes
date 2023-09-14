import React, { useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler, Dimensions, Image, View, TouchableOpacity, Appearance } from "react-native";
import Styles from "./Styles";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Button, Modal, Text } from "react-native-paper";

const db = SQLite.openDatabase('CloudNotes.db')

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const Moodify = (props) => {

    const [mainModal, setMainModal] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [createMode, setCreateMode] = useState(false)
    const [data, setData] = useState(null)

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    function handleBackButtonClick() {
        props.navigation.goBack()
        return true
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [])

    return (
        <View style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={{ marginStart: 10, flexDirection: 'row', alignItems: 'center' }}
                    activeOpacity={0.6} onPress={() => { props.navigation.goBack() }}>
                    <MaterialIcons name="arrow-back-ios" size={27} color="#FFBC01" />
                    <Text style={{ fontWeight: 'bold', fontSize: 23, color: '#FFBC01' }}>Moodify</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginEnd: 15 }} activeOpacity={0.6} onPress={() => { }}>
                    <MaterialCommIcons name="dots-horizontal-circle-outline" size={27} color="#FFBC01" />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Image source={require('../assets/moodifybackground.png')} style={{ width: 280, height: 245 }} />
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20 }}>Keep track of your mood data and create custom filters</Text>

                <View>
                    <TouchableOpacity style={{ width: screenWidth - 70, height: 55, borderRadius: 20, backgroundColor: '#FFBC01', alignItems: 'center', justifyContent: 'center' }}
                        activeOpacity={0.6} onPress={() => {
                            setMainModal(true)
                            setCreateMode(false)
                        }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                            Use Existing
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        width: screenWidth - 70, height: 55, borderRadius: 20, borderWidth: 1, borderColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                        marginTop: 20
                    }} onPress={() => {
                        setMainModal(true)
                        setCreateMode(true)
                    }}
                        activeOpacity={0.6}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#FFBC01', marginBottom: 1, marginStart: 10 }}>
                                Create New{' '}
                            </Text>
                            <MaterialIcons name="add" size={20} color="#FFBC01" />
                        </View>
                    </TouchableOpacity>
                </View>
                <Text style={{ textAlign: 'center', paddingHorizontal: 30 }}>Use above buttons to either create a new theme filter or use one from existing filters or apply the theme previously created by you.</Text>
            </View>
            <Modal visible={mainModal} dismissable dismissableBackButton
                onDismiss={() => {
                    setMainModal(false)
                }}
                style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ width: screenWidth, height: screenHeight, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#F4F4F4', borderTopEndRadius: 10, borderTopStartRadius: 10, padding: 10, flex: 1 }}>
                    <TouchableOpacity style={{ marginTop: 20, marginStart: 0, flexDirection: 'row', alignItems: 'center' }}
                        activeOpacity={0.6} onPress={() => { setMainModal(false) }}>
                        <MaterialIcons name="close" size={30} color="#FFBC01" />
                        <Text style={{
                            marginStart: 5, fontSize: 22, marginBottom: 2, fontWeight: 'bold',
                            color: '#FFBC01'
                        }}>{createMode ? 'Create New' : 'All Themes'}</Text>
                    </TouchableOpacity>
                </View>

            </Modal>
        </View>
    )
}

export default Moodify