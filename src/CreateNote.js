import React, { useCallback, useEffect, useRef, useState } from "react";
import Styles from "./Styles";
import { Appearance, Dimensions, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import * as SQLite from 'expo-sqlite'

import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height
const CreateNote = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme)
    const refInput = useRef(null);
    const refTitle = useRef(null)
    const [titleText, setTitleText] = useState("")
    const [noteText, setNoteText] = useState("")
    const [saveButton, setSaveButton] = useState("Save")
    const [dateText, setDateText] = useState(new Date().toUTCString().slice(0,16))
    const  [timeText, setTimeText] = useState(", " + new Date().toLocaleTimeString().slice(0,4)+" "+
    new Date().toLocaleTimeString().slice(8,10))
    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    useEffect(() => {
        if (props.route.params == undefined) {

        }
        else {
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM notes WHERE id =${props.route.params.id}`, [],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
                            setTitleText(rs.rows.item(0).title)
                            setNoteText(rs.rows.item(0).note)
                            setSaveButton("Update")
                        }
                    },
                    error => {
                        console.log("Error");
                    })
            })
        }
    }, [])


    const UpdateData = (id, title, note, date, time) => {
        if (refTitle.current.isFocused() == true) {
            refTitle.current.blur()
        }
        if (refInput.current.isFocused() == true) {
            refInput.current.blur()
        }
        if (titleText || noteText) {
            db.transaction(tx => {
                tx.executeSql(`UPDATE notes SET title = (?), note = (?), date = (?), time = (?) WHERE id = ${id}`, [title, note, date, time],
                    (sql, rs) => {
                        console.log("Done");
                        props.navigation.navigate("Home")
                    },
                    error => {
                        console.log("Error");
                    })
            })
        }
        
    }

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }





    const InsertData = async (textTitle, noteText, dateText, timeText) => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO notes (title, note, date, time) values (?,?,?,?)`, [textTitle, noteText, dateText, timeText],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM notes", [],
                        (sql, rs) => {
                            props.navigation.navigate("Home")
                        },
                        error => {
                            console.log("Error");
                        })
                },
                error => {
                    console.log("Error");
                })
        })
    }



    const SaveToDatabase = () => {
        if (titleText === "" && noteText === "") {
            if (refTitle.current.isFocused() == true) {
                refTitle.current.blur()
            }
            if (refInput.current.isFocused() == true) {
                refInput.current.blur()
            }
            
        } else {
            InsertData(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString())
        }
    }




    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, {}]}>
                <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => { props.navigation.navigate("Home") }} style={{ margin: 20 }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { 
                        saveButton === "Update"?
                        UpdateData(props.route.params.id, titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString())
                        :
                        SaveToDatabase() }}>
                        <Text style={{
                            color: '#FFBC01', fontSize: 19,
                            marginEnd: 20, fontFamily: 'mulish'
                        }}>{saveButton}</Text>
                    </TouchableOpacity>
                </View>
                <Text>{dateText} {timeText}</Text>
                <View style={{ width: screenWidth, alignItems: 'center', marginHorizontal: 20 }}>
                    <TextInput placeholder="Title" placeholderTextColor="#606060" style={{
                        width: '90%', backgroundColor: 'transparent',
                        fontFamily: 'mulish', fontSize: 22, fontWeight: 'bold'
                    }}
                        textColor={colorScheme === "dark" ? "white" : "black"}
                        multiline value={titleText} onChangeText={(text) => { setTitleText(text) }}
                        ref={refTitle}
                        maxLength={100} activeOutlineColor="transparent" outlineColor="transparent"
                        underlineColor="transparent" underlineColorAndroid="transparent"
                        selectionColor="#FFBC01" activeUnderlineColor="transparent"
                        cursorColor="yellow" />
                    <TextInput placeholder="Note" placeholderTextColor="#606060" style={{
                        width: '90%', backgroundColor: 'transparent',
                        fontFamily: 'mulish', fontSize: 16, maxHeight:400
                    }}
                        scrollEnabled  selectionColor="#FFBC01"
                        textColor={colorScheme === "dark" ? "white" : "black"}
                        multiline ref={refInput} value={noteText} onChangeText={(text) => { setNoteText(text) }}
                        maxLength={4000} activeOutlineColor="transparent" outlineColor="transparent"
                        underlineColor="transparent" underlineColorAndroid="transparent"
                        activeUnderlineColor="transparent"
                        cursorColor="yellow"
                        
                        onBlur={() => { }} />
                    <TouchableOpacity style={{}} activeOpacity={0} onPress={() => { refInput.current.focus() }}>
                        <View style={{ width: screenWidth, flex: 1 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default CreateNote