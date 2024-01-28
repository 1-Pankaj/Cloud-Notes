import React, { useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, BackHandler, Dimensions, ToastAndroid, TouchableHighlight, View } from "react-native";
import Styles from "./Styles";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text } from "react-native-paper";
import * as LocalAuthentication from 'expo-local-authentication'
import { useIsFocused } from "@react-navigation/native";

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const db = SQLite.openDatabase('CloudNotes.db')

const PersonalPassword = (props) => {

    const [optIn, setOptIn] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [input1, setInput1] = useState('-')
    const [input2, setInput2] = useState('-')
    const [input3, setInput3] = useState('-')
    const [input4, setInput4] = useState('-')
    const [password, setPassword] = useState('')
    const [param, setParam] = useState('')
    const [firsttime, setFirstTime] = useState(true)

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    }, [])

    function handleBackButtonClick() {
        props.navigation.navigate('PersonalFolder',{
            cancel:true
        })
        return true
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

    const Authenticate = () => {
        if (LocalAuthentication.hasHardwareAsync()) {
            if (LocalAuthentication.isEnrolledAsync()) {
                LocalAuthentication.authenticateAsync().then((rs) => {
                    if (rs.success) {
                        props.navigation.navigate('PersonalFolder', {
                            verified: true
                        })
                    }
                })
            }
        }
    }

    useEffect(() => {
        setTimeout(() => {
            props.route.params.optin && param == 'verify'?
            Authenticate()
            :
            null
        }, 1000);
    }, [props, param])

    const VerifyPassword = () => {
        if (input1 == '-' || input2 == '-' || input3 == '-' || input4 == '-') {

        } else {
            db.transaction((tx) => {
                tx.executeSql("SELECT password from personalfolderpass", [],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
                            let password = rs.rows._array[0].password

                            if (input1 + input2 + input3 + input4 == password) {
                                props.navigation.navigate('PersonalFolder', {
                                    verified: true
                                })
                            } else {
                                ToastAndroid.show("Incorrect password", ToastAndroid.SHORT)
                            }
                        }
                    }, error => { })
            })
        }
    }

    const SetNewPassword = () => {
        if (input1 == '-' || input2 == '-' || input3 == '-' || input4 == '-') {

        } else {
            if (firsttime) {
                db.transaction((tx) => {
                    tx.executeSql("SELECT * FROM personalfolderpass", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                sql.executeSql("update personalfolderpass set password = (?)", [input1 + input2 + input3 + input4],
                                    (sql, rs) => {
                                        props.navigation.navigate('PersonalFolder', {
                                            verified: true
                                        })
                                    }, error => { })
                            } else {
                                sql.executeSql("INSERT INTO personalfolderpass (password, biometric) values (?,?)", [input1 + input2 + input3 + input4, optIn],
                                    (sql, rs) => {
                                        sql.executeSql("INSERT INTO personalFirstTime (firsttime) values (false)", [],
                                            (sql, rs) => {
                                                props.navigation.navigate('PersonalFolder', {
                                                    verified: true
                                                })
                                            }, error => { })
                                    }, error => { })
                            }
                        }, error => {

                        })
                })
            }
        }
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [])

    const isFocused = useIsFocused()

    useEffect(() => {
        setOptIn(props.route.params.optin)
        setParam(props.route.params.page)
        setFirstTime(props.route.params.firstTime)
    }, [isFocused, props])

    return (
        <View style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ marginStart: 30, marginTop: 20 }} onPress={() => {
                    props.navigation.navigate('PersonalFolder',{
                        cancel:true
                    })
                }}>
                    <Text style={{ color: '#FFBC01', fontSize: 18 }}>Cancel</Text>
                </TouchableOpacity>
            </View>
            {optIn ?
                <Text style={{ alignSelf: 'center', fontSize: 12, paddingHorizontal: 50, textAlign: 'center', marginTop: 30 }}>
                    {param =='set'?'You have Opted in for biometric and screen lock security. This security method will be applied automatically next time you open your Personal Folder.'
                    :
                    ''}
                </Text>
                :
                null}

            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
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
                            param == 'set' ?
                                SetNewPassword()
                                :
                                VerifyPassword()
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
    )
}

export default PersonalPassword