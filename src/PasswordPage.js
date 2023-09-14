import React, { useCallback, useEffect, useState } from "react";
import { Appearance, BackHandler, Dimensions, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as LocalAuthentication from 'expo-local-authentication'
import { useIsFocused } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const PasswordPage = (props) => {

    const [input1, setInput1] = useState('-')
    const [input2, setInput2] = useState('-')
    const [input3, setInput3] = useState('-')
    const [input4, setInput4] = useState('-')
    const [password, setPassword] = useState('')
    const [param, setParam] = useState('')
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const SetPassword = () => {
        if (input1 == '-' || input2 == '-' || input3 == '-' || input4 == '-') {

        } else {
            db.transaction((tx) => {
                tx.executeSql("UPDATE archivepass set password = (?) where firsttime = 'false'", [input1 + input2 + input3 + input4],
                    (sql, rs) => {
                        props.navigation.replace('ArchivePage')
                    }, error => {
                    })
            })
        }
    }
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

    const SelectPassword = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT password from archivepass", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {
                        setPassword('')
                    } else {
                        setPassword(rs.rows._array[0].password)
                    }
                }, error => {
                })
        })
    }

    const isFocused = useIsFocused()

    const Authenticate = () => {
        if (LocalAuthentication.hasHardwareAsync()) {
            if (LocalAuthentication.isEnrolledAsync()) {
                LocalAuthentication.authenticateAsync().then((rs) => {
                    if (rs.success) {
                        props.navigation.replace('ArchivePage')
                    }
                })
            }
        }
    }
    useEffect(() => {
        SelectPassword()
        if (props.route.params == undefined) {
        } else {
            setParam(props.route.params.params)
        }
        setTimeout(() => {
            if (param == '' && !password == '') {
                Authenticate()
            }    
        }, 100);
        
    }, [password])

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })




    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }

    const SetNextValue = (value) => {
        if (input1 == '-') {
            setInput1(value)
        } else if (input2 == '-') {
            setInput2(value)
        }
        else if (input3 == '-') {
            setInput3(value)
        }
        else if (input4 == '-') {
            setInput4(value)
        }
    }

    const VerifyPassword = () => {
        if (password == input1 + input2 + input3 + input4) {
            props.navigation.replace('ArchivePage')
        } else {

        }
    }

    const RemovePassword = () => {
        if (password == input1 + input2 + input3 + input4) {
            db.transaction((tx) => {
                tx.executeSql("UPDATE archivepass set password = ('') where firsttime = 'false'", [],
                    (sql, rs) => {
                        props.navigation.replace('ArchivePage')
                    }, error => {
                    })
            })
        } else {

        }
    }

    const ResetPassword = () => {
        if (input1 == '-' || input2 == '-' || input3 == '-' || input4 == '-') {

        } else {
            db.transaction((tx) => {
                tx.executeSql("UPDATE archivepass set password = (?) where firsttime = 'false'", [input1 + input2 + input3 + input4],
                    (sql, rs) => {
                        props.navigation.replace('ArchivePage')
                    }, error => {
                    })
            })
        }
    }


    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })



    return (
        <View style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { width: screenWidth, justifyContent: 'space-between' }]}>
                <Text style={{
                    alignSelf: 'flex-start', margin: 20, fontSize: 20,
                    color: '#FFBC01', fontWeight: 'bold'
                }}>{param == '' ? password == '' ? 'Set Your Password here' : 'Verify yourself' : param == 'reset' ? 'Reset your password' : 'Verify to remove password'}</Text>
                <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                        paddingHorizontal: 20, paddingVertical: 15,
                        borderRadius: 5, borderWidth: 2, borderColor: 'gray', marginStart: 20
                    }}>
                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>{input1}</Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 20, paddingVertical: 15, borderRadius: 5,
                        borderWidth: 2, borderColor: 'gray', marginStart: 20
                    }}>
                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>{input2}</Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 20, paddingVertical: 15,
                        borderRadius: 5, borderWidth: 2, borderColor: 'gray', marginStart: 20
                    }}>
                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>{input3}</Text>
                    </View>
                    <View style={{
                        paddingHorizontal: 20, paddingVertical: 15,
                        borderRadius: 5, borderWidth: 2, borderColor: 'gray', marginStart: 20, marginEnd: 20
                    }}>
                        <Text style={{ fontSize: 25, fontWeight: 'bold' }}>{input4}</Text>
                    </View>
                </View>
                <View style={{ width: screenWidth }}>
                    <TouchableOpacity style={{
                        alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFBC01', width: 50, height: 50,
                        borderRadius: 25, alignSelf: 'flex-end', marginEnd: 25, marginBottom: 30, marginTop: 25
                    }}
                        onPress={() => {
                            {
                                param == '' ?
                                    password ?
                                        VerifyPassword()
                                        :
                                        SetPassword()
                                    :
                                    param == 'reset' ?
                                        ResetPassword()
                                        :
                                        RemovePassword()
                            }
                        }}>
                        <MaterialIcons name="navigate-next" size={35} color='white' />
                    </TouchableOpacity>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Appearance.getColorScheme() == 'dark' ? '#202020' : 'white', borderTopStartRadius: 20, borderTopEndRadius: 20 }}>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('1') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>1</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('2') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>2</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('3') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>3</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Appearance.getColorScheme() == 'dark' ? '#202020' : 'white' }}>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('4') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>4</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('5') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>5</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('6') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>6</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Appearance.getColorScheme() == 'dark' ? '#202020' : 'white' }}>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('7') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>7</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('8') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>8</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('9') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>9</Text>
                        </TouchableHighlight>
                    </View>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', width: screenWidth, backgroundColor: Appearance.getColorScheme() == 'dark' ? '#202020' : 'white', marginBottom: -10 }}>

                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => { SetNextValue('0') }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>0</Text>
                        </TouchableHighlight>
                        <TouchableHighlight style={{ width: screenWidth / 3, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}
                            onPress={() => {
                                setInput1('-')
                                setInput2('-')
                                setInput3('-')
                                setInput4('-')
                            }} underlayColor={Appearance.getColorScheme() === 'dark' ? '#101010' : '#dedede'}>

                            <MaterialIcons name="backspace" size={25} color='gray' />
                        </TouchableHighlight>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default PasswordPage