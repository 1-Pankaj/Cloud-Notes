import React, { useEffect, useState } from "react";

import { Appearance, Dimensions, FlatList, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { useIsFocused } from "@react-navigation/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import * as SQLite from 'expo-sqlite'
import { Surface, Text, TouchableRipple } from "react-native-paper";
import AnimatedLottieView from "lottie-react-native";
import { Drawer } from "react-native-ui-lib";

const screenWidth = Dimensions.get('window').width

const db = SQLite.openDatabase('CloudNotes.db')

const OpenFolder = (props) => {

    const [folderName, setFolderName] = useState('')
    const [extraName, setExtraName] = useState('')
    const [data, setData] = useState(null)
    const [notebackgroundEnabled, setNotebackgroundEnabled] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const GetFeatures = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT notebackground FROM features", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let notebackground = rs.rows._array[0].notebackground
                        if (notebackground) {
                            setNotebackgroundEnabled(true)
                        }
                    }
                }, error => {
                    console.log("Error 11");
                })
        })
    }

    const MoveNote = (id) => {
        props.navigation.navigate('Folder', {
            id: id,
            folderName: folderName,
            page: 'Move',
            extraName:extraName
        })
    }

    const DeleteNote = (id) => {

    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM ${folderName}`, [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let pageColor = rs.rows._array[i].pageColor
                            let fontColor = rs.rows._array[i].fontColor
                            let fontStyle = rs.rows._array[i].fontStyle
                            let fontSize = rs.rows._array[i].fontSize

                            results.push({ id: id, title: title, note: note, date: date, time: time, pageColor: pageColor, fontColor: fontColor, fontStyle: fontStyle, fontSize: fontSize })
                        }

                        setData(results)
                    } else {
                        setData(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const isFocused = useIsFocused()

    useEffect(() => {
        if (props.route.params === undefined) {

        } else {
            setFolderName(props.route.params.foldername)
            setExtraName(props.route.params.extraname)
        }

        if (folderName) {
            GetData()
        }
    }, [isFocused, folderName])
    return (
        <SafeAreaView style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={{ marginStart: 10, flexDirection: 'row', alignItems: 'center' }} onPress={() => { props.navigation.replace('Folder') }}>
                    <MaterialIcons name="arrow-back-ios" size={27} color="#FFBC01" />
                    <Text style={{ fontSize: 23, color: '#FFBC01', fontWeight: 'bold' }}>{extraName}</Text>
                </TouchableOpacity>
            </View>
            {data ?
                <View style={{ width: screenWidth, flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'mulish', fontSize: 18, alignSelf: 'flex-start', marginTop: 40, marginStart: 25 }}>Contents of {extraName}</Text>
                    <FlatList
                        data={data}
                        key={item => item.id}
                        style={{ marginTop: 20 }}
                        renderItem={(body) => {
                            const item = body.item
                            return (
                                <Drawer
                                    rightItems={[{ icon: require('../assets/delete.png'), text: 'Trash', width: 80, background: 'red', onPress: () => { DeleteNote(item.id) } }]}
                                    leftItem={{ icon: require('../assets/move.png'), text: 'Move', width: 80, onPress: () => { MoveNote(item.id) } }}
                                    useNativeAnimations itemsIconSize={20} style={{ borderRadius: 10, width: screenWidth - 20, alignItems: 'center', marginTop: 10 }}
                                    fullRightThreshold={0.7} onFullSwipeRight={() => { }} bounciness={100}
                                    fullSwipeRight disableHaptic>

                                    <TouchableHighlight style={[{
                                        borderRadius: 10
                                    }]} borderRadius={10}
                                        underlayColor={colorScheme === 'dark' ? '#404040' : '#e3e3e3'}
                                        onLongPress={() => { }}
                                        onPress={() => {
                                            props.navigation.navigate("CreateNote", {
                                                id: item.id,
                                                page: 'Folders',
                                                folderName: folderName,
                                                extraName: extraName,
                                                editing: true
                                            })
                                        }} >


                                        <View style={{ width: screenWidth - 20, height: 75, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                            {notebackgroundEnabled ?
                                                <View style={{ width: '100%', height: '100%', borderRadius: 7.3, backgroundColor: item.pageColor === "default" ? colorScheme === 'dark' ? '#202020' : 'white' : item.pageColor, opacity: 0.6, position: 'absolute' }} />
                                                :
                                                null}
                                            <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={{
                                                        fontFamily: 'mulish', fontSize: 18,
                                                        fontWeight: 'bold', color: colorScheme === 'dark' ? 'white' : '#202020'
                                                    }}
                                                        numberOfLines={1}>
                                                        {item.title.slice(0, 20).trim()}
                                                    </Text>
                                                    <Text style={{
                                                        fontFamily: 'mulish', fontSize: 12
                                                        , color: colorScheme === 'dark' ? 'white' : '#202020'
                                                    }}
                                                        numberOfLines={1}>
                                                        {item.note.slice(0, 30).trim()}
                                                    </Text>
                                                </View>
                                                <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                                                    <View style={{ alignItems: 'center', marginEnd: 20 }}>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{item.date.length === 9 ? item.date.slice(0, 4) : item.date.slice(0, 5)}</Text>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{item.time.length === 10 ? item.time.slice(0, 4) + item.time.slice(7, 10) : item.time.slice(0, 5) + item.time.slice(8, 11)}</Text>
                                                    </View>
                                                    <MaterialIcons name="arrow-forward-ios" size={22} color={notebackgroundEnabled ? item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableHighlight>
                                </Drawer>
                            )
                        }}
                    />
                </View>
                :
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
                    <AnimatedLottieView
                        source={require('../assets/folderanim.json')} autoPlay loop style={{ width: screenWidth }}
                    />
                    <Text style={{ fontSize: 18 }}>Empty Folder</Text>
                </View>}


            <View style={{ width: screenWidth, marginVertical: 10 }}>
                <Surface style={{ alignSelf: 'flex-end', marginEnd: 20, borderRadius: 50 }}>
                    <TouchableRipple borderless style={{
                        width: 60, height: 60, backgroundColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 50
                    }}
                        onPress={() => {
                            props.navigation.navigate('CreateNote', {
                                page: 'Folders',
                                folderName: folderName,
                                extraName: extraName,
                                editing: false
                            })
                        }} rippleColor='#F0CA5E'>
                        <View style={{
                            width: 60, height: 60, backgroundColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 50
                        }}>
                            <MaterialIcons name="add" size={35} color="white" />
                        </View>
                    </TouchableRipple>
                </Surface>
            </View>


        </SafeAreaView>
    )
}

export default OpenFolder