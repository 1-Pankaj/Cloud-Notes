import React, { useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, BackHandler, Dimensions, ScrollView, ToastAndroid, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Modal, Text } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";


const db = SQLite.openDatabase('CloudNotes.db')

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const PersonalFolder = (props) => {

    const [firstTime, setFirstTime] = useState(false)
    const [firstTimeModal, setFirstTimeModal] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [optin, setOptin] = useState(true)
    const [password, setPassword] = useState('')
    const [biometric, setBiometric] = useState(false)
    const [verified, setVerified] = useState(false)

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    }, [])

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

    const FirstTimeCheck = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS personalFirstTime (firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM personalFirstTime", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setFirstTime(false)
                            } else {
                                setFirstTime(true)
                                setFirstTimeModal(true)
                            }
                        }, error => { })
                })
        })
    }

    const CreatePassTable = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS personalfolderpass(password VARCHAR(20), biometric Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM personalfolderpass", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setFirstTime(false)
                                setFirstTimeModal(false)
                                setPassword(rs.rows._array[0].password)
                                setBiometric(rs.rows._array[0].biometric)

                            }
                        }, error => { })
                }, error => {
                })
        })
    }

    useEffect(() => {
        if (props.route.params == undefined) {

        } else {
            if (props.route.params.verified == true) {
                setVerified(true)
            }
            if (props.route.params.cancel == true) {
                props.navigation.goBack()
            }
        }
    }, [isFocused, props])

    useEffect(() => {
        db.transaction((sql) => {
            sql.executeSql("SELECT * FROM personalfolderpass", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        setFirstTime(false)
                        setFirstTimeModal(false)
                        setPassword(rs.rows._array[0].password)
                        setBiometric(rs.rows._array[0].biometric)
                        if(verified){

                        }else{
                            props.navigation.navigate('PersonalPassword', {
                                optin: rs.rows._array[0].biometric == 1 ? true : false,
                                page: 'verify',
                                firstTime: false
                            })
                        }
                    }
                }, error => { })
        })
    }, [])

    const isFocused = useIsFocused()

    useEffect(() => {
        FirstTimeCheck()
        CreatePassTable()
    }, [isFocused, props])


    return (
        <View style={Styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: screenWidth }}>
                <TouchableOpacity style={{ margin: 25 }} onPress={() => { props.navigation.goBack() }}>
                    <MaterialIcons name="arrow-back-ios" size={27} color="#FFBC01" />
                </TouchableOpacity>
                <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => { BackHandler.exitApp() }}>
                    <Text style={{ fontSize: 18, color: '#FFBC01' }}>Quick Exit</Text>
                </TouchableOpacity>
            </View>
            {firstTime ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="lock" size={100} color="#FFBC01" />
                    <Text style={{ marginTop: 30, fontSize: 18 }}>Personal Folder is locked</Text>
                </View>
                :
                <View>
                    {verified ?
                        <View style={{ flex: 1, alignItems: 'center' }}>

                        </View>
                        :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialIcons name="lock" size={100} color="#FFBC01" onPress={()=>{props.navigation.navigate('PersonalPassword', {
                            optin: false,
                            page: 'verify',
                            firstTime: false
                        })}}/>
                            <Text style={{ marginTop: 30, fontSize: 18, paddingHorizontal:30, textAlign:'center' }}>Personal Folder is locked. Press the lock icon to try unlocking again.</Text>
                        </View>}
                </View>}
            <Modal visible={firstTimeModal} onDismiss={() => {
                setFirstTimeModal(false)
                props.navigation.goBack()
            }} dismissable style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: screenWidth - 30, height: screenHeight - 150, borderRadius: 20, backgroundColor: colorScheme == 'dark' ? '#1c1c1c' : '#f4f4f4' }}>
                    <ScrollView style={{ flex: 1, width: '100%', height: '100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                        <View style={{ marginTop: 30, alignItems: 'center', width: '100%' }}>
                            <MaterialIcons name="lock" size={56} color="#FFBC01" />
                            <Text style={{ fontSize: 20, paddingHorizontal: 20, textAlign: 'center', fontWeight: 'bold', marginTop: 80 }}>CloudNotes offers Personal Folders, where you can create, edit and manage your personal folders and notes with ease. {'\n\n'}Personal Folder data is synced to your CloudNotes profile when you are signed in. To start using personal folder set a password first and then opt in for screen lock unlocking.</Text>
                            <TouchableOpacity style={{ width: '70%', height: 60, backgroundColor: '#FFBC01', borderRadius: 10, marginTop: 50, alignItems: 'center', justifyContent: 'center' }}
                                activeOpacity={0.6} onPress={() => {
                                    props.navigation.navigate('PersonalPassword', {
                                        optin: true,
                                        page: 'set',
                                        firstTime: true
                                    })
                                }}>
                                <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>Continue and Opt-in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '70%', height: 60, borderWidth: 1, borderColor: '#FFBC01', borderRadius: 10, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}
                                activeOpacity={0.6} onPress={() => {
                                    props.navigation.navigate('PersonalPassword', {
                                        optin: false,
                                        page: 'set',
                                        firstTime: true
                                    })
                                }}>
                                <Text style={{ fontSize: 16, color: '#FFBC01', fontWeight: 'bold' }}>Continue without Opt-in</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 11, paddingHorizontal: 40, marginVertical: 80, textAlign: 'center' }}>
                                By Opt-in, you agree our terms and conditions of using your phone screen lock method for unlocking your personal folder internally. This data will only be used inside CloudNotes app and until it's installed. If you wish to Opt-out you can do so from settings on home screen and so-on for Opting-in if you previously selected without Opt-in.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    )
}

export default PersonalFolder