import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, TextInput, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'

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

    const SetPassword = () => {
        if (input1 == '-' || input2 == '-' || input3 == '-' || input4 == '-') {

        } else {
            db.transaction((tx) => {
                tx.executeSql("UPDATE archivepass set password = (?) where firsttime = 'false'", [input1 + input2 + input3 + input4],
                    (sql, rs) => {
                        props.navigation.replace('ArchivePage')
                    }, error => {
                        console.log("Error");
                    })
            })
        }
    }

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
                    console.log("Error");
                })
        })
    }

    useEffect(() => {
        SelectPassword()
        if (props.route.params == undefined) {
        } else {
            setParam(props.route.params.params)
        }
    }, [])

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

    const RemovePassword = () =>{
        if (password == input1 + input2 + input3 + input4) {
            db.transaction((tx) => {
                tx.executeSql("UPDATE archivepass set password = ('') where firsttime = 'false'", [],
                    (sql, rs) => {
                        props.navigation.replace('ArchivePage')
                    }, error => {
                        console.log("Error");
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
                        console.log("Error");
                    })
            })
        }
    }





    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { width: screenWidth, justifyContent: 'space-between' }]}>
                <Text style={{
                    alignSelf: 'flex-start', margin: 20, fontSize: 20,
                    color: '#FFBC01', fontWeight: 'bold'
                }}>{param == '' ? password == '' ? 'Set Your Password here' : 'Verify yourself' : param == 'reset'? 'Reset your password' : 'Verify to remove password'}</Text>
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
                                    param == 'reset'?
                                    ResetPassword()
                                    :
                                    RemovePassword()
                            }
                        }}>
                        <MaterialIcons name="navigate-next" size={35} color='white' />
                    </TouchableOpacity>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('1') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('2') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>2</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('3') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>3</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('4') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>4</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('5') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('6') }}>

                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>6</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('7') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>7</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('8') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>8</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 2, width: screenWidth / 3, height: 60 }}
                            onPress={() => { SetNextValue('9') }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>9</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end', width: screenWidth }}>

                        <TouchableOpacity style={{ width: screenWidth / 3, height: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center', }}
                            onPress={() => {
                                SetNextValue('0')
                            }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: screenWidth / 3, height: 60, borderWidth: 2, alignItems: 'center', justifyContent: 'center', }}
                            onPress={() => {
                                setInput1('-')
                                setInput2('-')
                                setInput3('-')
                                setInput4('-')
                            }}>
                            <MaterialIcons name="backspace" size={25} color='gray' />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default PasswordPage