import React, { useCallback, useEffect, useRef, useState } from "react";
import Styles from "./Styles";
import {  Appearance, BackHandler, Dimensions, KeyboardAvoidingView, Platform, ScrollView, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Card, Chip, Menu, Modal, Portal, Snackbar, Text, Tooltip } from "react-native-paper";


import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import * as SQLite from 'expo-sqlite'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'

import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Slider from "@react-native-community/slider";
import FontAwesome from '@expo/vector-icons/FontAwesome'
import * as Speech from 'expo-speech'
import Voice from '@react-native-voice/voice'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { ColorPicker, Colors, ExpandableSection } from "react-native-ui-lib";


SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const CreateNote = (props) => {


    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme)
    const refInput = useRef(null);
    const refTitle = useRef(null)
    const [titleText, setTitleText] = useState("")
    const [noteText, setNoteText] = useState("")
    const [saveButton, setSaveButton] = useState("Save")
    const [loading, setLoading] = useState(false)
    const [snackbar, setSnackBar] = useState({ visible: false, message: '' })
    const [recording, setRecording] = useState(false)
    const [results, setResults] = useState([])
    const [starVisible, setStarVisible] = useState(false)
    const [folderName, setFolderName] = useState('')
    const [extraName, setExtraName] = useState('')
    const [editing, setEditing] = useState(false)
    const [editingId, setEditingId] = useState('')
    const [expandedView, setExpandedView] = useState(false)
    const [focusedTitle, setFocusedTitle] = useState(false)
    const [pageColors, setPageColors] = useState([Colors.black, Colors.white, '#FFBC01'])
    const [fontColors, setFontColors] = useState([Colors.black, Colors.white, '#FFBC01'])


    const [open, setOpen] = useState(false)
    const [pageColor, setPageColor] = useState('default')
    const [fontColor, setFontColor] = useState('default')
    const [fontStyle, setFontStyle] = useState('default')
    const [fontSize, setFontSize] = useState(18)
    const white = "#FFF"
    const black = "#202020"
    const pinkish = "#BB42AF"
    const yellowish = "#FFBC01"
    const blueish = "#3142D3"
    const greenish = "#4FC73B"

    const StartStopRecording = async () => {
        if (recording === true) {
            Voice.stop()
        } else {
            await Voice.start('en-US');
            setRecording(true)
        }
    }

    const onSpeechResults = (res) => {
        setResults(res.value)
        res.value.map((res, index) => {
            setNoteText(noteText.trim() + '\n' + res.trim())
        })
    }
    const onSpeechEnd = (res) => {
        setRecording(false)
    }

    const onSpeechError = (error) => {
        setRecording(false)
        Voice.stop().then(Voice.destroy())
    }


    useEffect(() => {

        Voice.onSpeechError = onSpeechError
        Voice.onSpeechResults = onSpeechResults
        Voice.onSpeechEnd = onSpeechEnd

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, [])


    const [dateText, setDateText] = useState(new Date().toUTCString().slice(0, 16))
    const [timeText, setTimeText] = useState(", " + new Date().toLocaleTimeString())
    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf"),
        'amatic': require("../assets/fonts/amatic.ttf"),
        'dancingspirit': require("../assets/fonts/dancingspirit.ttf"),
        'gochihand': require("../assets/fonts/gochihand.ttf"),
        'kaushan': require("../assets/fonts/kaushan.ttf"),
        'thegreat': require('../assets/fonts/thegreat.ttf'),
        'greatvibes': require("../assets/fonts/greatvibes.ttf")
    })

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    useEffect(() => {
        if (props.route.params == undefined) {

        }
        else {
            if (props.route.params.page == "Home") {

                setStarVisible(true)
                db.transaction(tx => {
                    tx.executeSql(`SELECT * FROM notes WHERE id =${props.route.params.id}`, [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setTitleText(rs.rows.item(0).title)
                                setNoteText(rs.rows.item(0).note)
                                setPageColor(rs.rows.item(0).pageColor.toString())
                                setFontColor(rs.rows.item(0).fontColor)
                                setFontStyle(rs.rows.item(0).fontStyle)
                                setFontSize(Math.floor(rs.rows.item(0).fontSize))
                                setSaveButton("Update")
                            }
                        },
                        error => {
                        })
                })
            }
            else if (props.route.params.page == 'Archive') {

                db.transaction((tx) => {
                    tx.executeSql(`SELECT * FROM archived WHERE id = ${props.route.params.id}`, [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setTitleText(rs.rows.item(0).title)
                                setNoteText(rs.rows.item(0).note)
                                setPageColor(rs.rows.item(0).pageColor.toString())
                                setFontColor(rs.rows.item(0).fontColor)
                                setFontStyle(rs.rows.item(0).fontStyle)
                                setFontSize(Math.floor(rs.rows.item(0).fontSize))
                                setSaveButton("Update archive")
                            }
                        }, error => {
                        })
                })
            }
            else if (props.route.params.page == 'HomeCamera') {
                LaunchCamera()
            }
            else if (props.route.params.page == 'Starred') {

                db.transaction((tx) => {
                    tx.executeSql(`SELECT * FROM starrednotes WHERE id = ${props.route.params.id}`, [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setTitleText(rs.rows.item(0).title)
                                setNoteText(rs.rows.item(0).note)
                                setPageColor(rs.rows.item(0).pageColor.toString())
                                setFontColor(rs.rows.item(0).fontColor)
                                setFontStyle(rs.rows.item(0).fontStyle)
                                setFontSize(Math.floor(rs.rows.item(0).fontSize))
                                setSaveButton("Update Star")
                            }
                        }, error => {
                        })
                })
            } else if (props.route.params.page == 'Folders') {
                setFolderName(props.route.params.folderName)
                setExtraName(props.route.params.folderName)
                setSaveButton('Save to Folder')
                if (props.route.params.editing == true) {
                    setEditing(true)
                    db.transaction((tx) => {
                        tx.executeSql(`SELECT * FROM ${props.route.params.folderName}`, [],
                            (sql, rs) => {
                                setTitleText(rs.rows.item(0).title)
                                setNoteText(rs.rows.item(0).note)
                                setPageColor(rs.rows.item(0).pageColor.toString())
                                setFontColor(rs.rows.item(0).fontColor)
                                setFontStyle(rs.rows.item(0).fontStyle)
                                setFontSize(Math.floor(rs.rows.item(0).fontSize))
                                setSaveButton("Save to Folder")
                            }, error => {
                            })
                    })
                    setEditingId(props.route.params.id)
                } else {
                    setEditing(false)
                }
            }
        }
    }, [])











    const UploadImage = async (image) => {
        const data = new FormData()
        data.append('file', image)
        data.append('upload_preset', 'imagetotext')
        data.append('cloud_name', 'pankajisrani')

        fetch('https://api.cloudinary.com/v1_1/pankajisrani/image/upload', {
            method: 'post',
            body: data
        }).then(res => res.json()).then((response) => {
            setTimeout(() => {
                fetch(`https://api.ocr.space/parse/imageurl?apikey=K88712079788957&url=${response.url}`, error => {
                    setLoading(false)
                    setSnackBar({ visible: true, message: 'Error generating text, either image is curropt or servers are not responding!' })
                }).then(res => res.json()).
                    then((resp) => {
                        setLoading(false)
                        setSnackBar({ visible: true, message: 'Text Generated Successfully!' })
                        setNoteText(noteText.trim() + '\n' + resp.ParsedResults[0].ParsedText.trim())
                    }, error => {
                        setLoading(false)
                        setSnackBar({ visible: true, message: 'Error generating text, either image is curropt or servers are not responding!' })
                    }).catch((error) => {
                        setLoading(false)
                        setSnackBar({ visible: true, message: 'Error generating text, either image is curropt or servers are not responding!' })
                    })
            }, 100);

        }, error => {
            setLoading(false)
            setSnackBar({ visible: true, message: 'Error generating text, either image is curropt or servers are not responding!' })
        })

    }

    const LaunchCamera = async () => {
        await ImagePicker.getCameraPermissionsAsync()
        let result = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.back,
            quality: 0.7,
            allowsEditing: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        })

        if (!result.canceled) {
            setTimeout(() => {
                setLoading(true)
                let newfile = { uri: result.assets[0].uri, type: `test/${result.assets[0].uri.split(".")[1]}`, name: `test.${result.assets[0].uri.split(".")[1]}` }
                UploadImage(newfile)
            }, 100);

        }
    }

    const PickImage = async () => {
        ImagePicker.getMediaLibraryPermissionsAsync()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });


        if (!result.canceled) {
            setTimeout(() => {
                let newfile = { uri: result.assets[0].uri, type: `test/${result.assets[0].uri.split(".")[1]}`, name: `test.${result.assets[0].uri.split(".")[1]}` }
                setLoading(true)
                UploadImage(newfile)
            }, 100);

        }
    };

    const SpeakText = () => {


        if (titleText == '' && noteText == '') {
            const thingsToSay = 'Both title and note are empty.'
            Speech.speak(thingsToSay)
        }
        else if (!titleText == '' && noteText == '') {
            const thingsToSay = 'Title is. ' + titleText + '. But Note is Empty.'
            Speech.speak(thingsToSay)
        }
        else if (titleText == '' && !noteText == '') {
            const thingsToSay = 'Title is Empty. But note is. ' + noteText
            Speech.speak(thingsToSay)
        }
        else {
            const thingsToSay = 'Title is. ' + titleText + '. And note is. ' + noteText
            Speech.speak(thingsToSay)
        }


    }


    const UpdateData = (id, title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        if (titleText || noteText) {
            db.transaction(tx => {
                tx.executeSql(`UPDATE notes SET title = (?), note = (?), date = (?), time = (?), pageColor = (?), fontColor = (?), fontStyle = (?), fontSize = (?) WHERE id = ${id}`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                    (sql, rs) => {
                        props.navigation.navigate("Home")
                    },
                    error => {
                    })
            })
        }

    }


    const SaveToFolder = (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        
        if (titleText || noteText) {
            if (editing) {
                db.transaction(tx => {
                    tx.executeSql(`UPDATE ${folderName} set title = (?),note = (?),date =(?),time = (?),pageColor = (?),fontColor =(?),fontStyle = (?),fontSize = (?) WHERE id = ${editingId}`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                        (sql, rs) => {
                            props.navigation.navigate('OpenFolder', {
                                foldername: folderName,
                                extraname: extraName
                            })
                        },
                        error => {
                        })
                })
            } else {
                db.transaction(tx => {
                    tx.executeSql(`INSERT INTO ${folderName}(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                        (sql, rs) => {
                            props.navigation.navigate('OpenFolder', {
                                foldername: folderName,
                                extraname: extraName
                            })
                        },
                        error => {
                        })
                })
            }
        }

    }
    function handleBackButtonClick() {
        if (expandedView == true) {
            setExpandedView(false)
            return true;
        } else {
            props.navigation.goBack()
            return true
        }
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [expandedView, props])


    const UpdateArchive = (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        
        if (titleText || noteText) {
            db.transaction((tx) => {
                tx.executeSql(`UPDATE archived SET title = (?), note = (?), date = (?), time = (?), pageColor = (?), fontColor = (?), fontStyle = (?), fontSize = (?) WHERE id = ${props.route.params.id}`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                    (sql, rs) => {
                        props.navigation.navigate('ArchivePage')
                    }, error => {
                    })
            })
        }
    }

    const UpdateStarred = (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        
        if (titleText || noteText) {
            db.transaction((tx) => {
                tx.executeSql(`UPDATE starrednotes SET title = (?), note = (?), date = (?), time = (?), pageColor = (?), fontColor = (?), fontStyle = (?), fontSize = (?) WHERE id = ${props.route.params.id}`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                    (sql, rs) => {
                        props.navigation.navigate('StarredNotes')
                    }, error => {
                    })
            })
        }
    }


    const SetFontSizeSlider = (prop) => {
        if (prop < 25 || prop == 25) {
            setFontSize(18)
        } else if (prop > 25 && prop < 50 || prop == 50) {
            setFontSize(22)
        } else if (prop > 50 && prop < 75 || prop == 75) {
            setFontSize(26)
        } else if (prop > 75 || prop == 100) {
            setFontSize(30)
        } else {
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



    const StarNote = (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        db.transaction((sql) => {
            sql.executeSql("INSERT INTO starrednotes(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                (sql, rs) => {
                    ToastAndroid.show(`Note ${title} Starred!`, ToastAndroid.SHORT)
                }, error => {
                })
        })
    }


    const InsertData = async (textTitle, noteText, dateText, timeText, pageColor, fontColor, fontStyle, fontSize) => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO notes (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) values (?,?,?,?,?,?,?,?)`, [textTitle, noteText, dateText, timeText, pageColor, fontColor, fontStyle, fontSize],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM notes", [],
                        (sql, rs) => {
                            props.navigation.goBack()
                        },
                        error => {
                        })
                },
                error => {
                })
        })
    }


    const UpdateColor = (color) => {
        if (color == Colors.white || color == Colors.black) {
            setPageColor('default')
        } else {
            setPageColor(color)
        }
    }

    const AutoSaveNote = (text) => {
        setNoteText(text)

        if (props.route.params == undefined) {

        }
    }



    const SaveToDatabase = () => {
        InsertData(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
    }


    return (
        <SafeAreaView style={[Styles.container, {}]} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { justifyContent: 'space-between', }]}>
                <View style={{ width: screenWidth, alignItems: 'center', height: '90%', }} behavior={Platform.OS === 'ios' ? 'height' : 'padding'}>
                    <View style={{ width: screenWidth, height: 1500, backgroundColor: pageColor === 'default' ? 'transparent' : pageColor, position: 'absolute', opacity: 0.6, alignSelf: 'center', marginTop: -500 }} />
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => {
                            saveButton == 'Save to Folder' ?
                                props.navigation.navigate('OpenFolder', {
                                    foldername: folderName,
                                    extraname: extraName
                                })
                                :
                                props.navigation.goBack()
                        }} style={{ margin: 20 }}>
                            <MaterialIcons name="arrow-back-ios" size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={{ marginEnd: 30 }} onPress={() => { setOpen(!open) }}>
                                <Ionicons name={open ? "close" : "color-fill-outline"} size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                saveButton === "Update" ?
                                    UpdateData(props.route.params.id, titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                    :
                                    saveButton == "Update archive" ?
                                        UpdateArchive(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                        :
                                        saveButton == 'Update Star' ?
                                            UpdateStarred(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                            :
                                            saveButton == 'Save to Folder' ?
                                                SaveToFolder(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                                :
                                                SaveToDatabase()
                            }}>
                                <Text style={{
                                    color: pageColor === 'default' ? "#FFBC01" : 'black', fontSize: 19,
                                    marginEnd: 20, fontFamily: 'mulish'
                                }}>{saveButton}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ExpandableSection
                        top={false}
                        expanded={open}>
                        <View style={{ width: screenWidth }}>

                            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Page Colour</Text>
                            <View style={{ alignItems: 'flex-start', width: screenWidth }}>
                                <ColorPicker
                                    colors={pageColors}
                                    initialColor={Colors.green10}
                                    value={'#FFBC01'}
                                    center doneButtonColor="#FFBC01" visible
                                    backgroundColor="transparent"
                                    onDismiss={() => { }}
                                    onSubmit={(color) => {
                                        let colorsArray = pageColors
                                        colorsArray.push(color)
                                        setPageColors(colorsArray)
                                        setPageColor(color)
                                        setOpen(false)
                                    }}
                                    onValueChange={(color) => {
                                        UpdateColor(color)
                                        setOpen(false)
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ width: screenWidth }}>
                            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Font Colour</Text>
                            <View style={{ alignItems: 'flex-start', width: screenWidth }}>
                                <ColorPicker
                                    colors={fontColors}
                                    initialColor={Colors.green10}
                                    value={'#FFBC01'}
                                    center doneButtonColor="#FFBC01" visible
                                    backgroundColor="transparent"
                                    onDismiss={() => { }}
                                    onSubmit={(color) => {
                                        let colorsArray = fontColors
                                        colorsArray.push(color)
                                        setFontColors(colorsArray)
                                        setFontColor(color)
                                        setOpen(false)
                                    }}
                                    onValueChange={(color) => {
                                        setFontColor(color)
                                        setOpen(false)
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ width: screenWidth, marginBottom: 5 }}>
                            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Font Style</Text>
                            <ScrollView horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ alignItems: 'center', marginBottom: 20, marginStart: 20, marginTop: 10, marginEnd: 20 }}>
                                <Chip selected={fontStyle === 'default' ? true : false} onPress={() => { setFontStyle('default') }} mode="outlined" style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: 'mulish', fontSize: 16 }}>Default</Text></Chip>
                                <Chip selected={fontStyle === 'amatic' ? true : false} onPress={() => { setFontStyle('amatic') }} style={{ marginStart: 20, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined" ><Text style={{ fontFamily: 'amatic', fontSize: 18 }}>Amatic</Text></Chip>
                                <Chip selected={fontStyle === 'dancingspirit' ? true : false} onPress={() => { setFontStyle('dancingspirit') }} style={{ marginStart: 20, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined"><Text style={{ fontFamily: 'dancingspirit', fontSize: 18 }}>Dancing Spirit</Text></Chip>
                                <Chip selected={fontStyle === 'gochihand' ? true : false} onPress={() => { setFontStyle('gochihand') }} style={{ marginStart: 20, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined"><Text style={{ fontFamily: 'gochihand', fontSize: 18 }}>Gochihand</Text></Chip>
                                <Chip selected={fontStyle === 'greatvibes' ? true : false} onPress={() => { setFontStyle('greatvibes') }} style={{ marginStart: 20, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined"><Text style={{ fontFamily: 'greatvibes', fontSize: 16 }}>Great Vibes</Text></Chip>
                                <Chip selected={fontStyle === 'kaushan' ? true : false} onPress={() => { setFontStyle('kaushan') }} style={{ marginStart: 20, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined"><Text style={{ fontFamily: 'kaushan', fontSize: 16 }}>Kaushan</Text></Chip>
                                <Chip selected={fontStyle === 'thegreat' ? true : false} onPress={() => { setFontStyle('thegreat') }} style={{ marginStart: 20, marginEnd: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} mode="outlined"><Text style={{ fontFamily: 'thegreat', fontSize: 16 }}>The Great Frederika</Text></Chip>
                            </ScrollView>
                        </View>
                        <View style={{ width: screenWidth, }}>
                            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Font Size</Text>
                            <Slider value={0} thumbTintColor="#FFBC01" maximumTrackTintColor="gray" minimumTrackTintColor="#FFBC01" onValueChange={(tx) => { SetFontSizeSlider(Math.floor(tx)) }}
                                minimumValue={0} maximumValue={100}
                            />
                            <View style={{ width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' }}>
                                <FontAwesome name="font" size={12} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                <FontAwesome name="font" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />

                            </View>
                        </View>
                    </ExpandableSection>

                    <Text style={{ marginBottom: 10, fontSize: 12 }}>{dateText} {timeText}</Text>

                    <TextInput placeholder="Title" placeholderTextColor="#606060" style={{
                        width: '90%', backgroundColor: 'transparent',
                        fontFamily: fontStyle === 'default' ? 'mulish' : fontStyle, fontSize: fontStyle === 'default' ? fontSize + 6 : fontSize + 14, fontWeight: fontStyle === 'default' ? 'bold' : 'normal', marginStart: 20, marginTop: 20
                        , color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#101010' : fontColor,
                    }} multiline onKeyPress={(e) => {
                        if (e.nativeEvent.key == 'Enter') {
                            refTitle.current.blur()
                            refInput.current.focus()
                            setTimeout(() => {
                                setTitleText(titleText.trim())
                            }, 100)
                        }
                    }} onFocus={() => { setFocusedTitle(true) }}
                        value={titleText} onChangeText={(text) => { setTitleText(text) }}
                        ref={refTitle} onBlur={() => { setFocusedTitle(false) }}
                        maxLength={100} activeOutlineColor="transparent" outlineColor="transparent"
                        underlineColor="transparent" underlineColorAndroid="transparent"
                        selectionColor="#FFBC01" activeUnderlineColor="transparent"
                        cursorColor="yellow" />
                    <KeyboardAvoidingView style={{ width: screenWidth, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginStart: 20, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 30, }}>
                            <TextInput placeholder="Note" placeholderTextColor="#606060" style={{
                                width: '80%', backgroundColor: 'transparent',
                                fontFamily: fontStyle === 'default' ? 'mulish' : fontStyle, fontSize: fontSize, marginStart: 20,
                                color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#202020' : fontColor,
                            }} onFocus={() => { setFocusedTitle(false) }}
                                scrollEnabled={true} selectionColor="#FFBC01"
                                onKeyPress={(e) => {
                                    if (e.nativeEvent.key == 'Backspace') {
                                        noteText ? null : refTitle.current.focus()
                                    }
                                }}
                                multiline={true} ref={refInput} value={noteText} onChangeText={(text) => { AutoSaveNote(text) }}
                                maxLength={5000} activeOutlineColor="transparent" outlineColor="transparent"
                                underlineColor="transparent" underlineColorAndroid="transparent"
                                activeUnderlineColor="transparent"
                                cursorColor="yellow" autoFocus={props.route.params == undefined ? true : false} />
                            <Tooltip title="Expand">
                                <TouchableOpacity onPress={() => {
                                    setExpandedView(true)
                                }}>
                                    <MaterialCommIcons name="arrow-expand" size={20} style={{ marginEnd: 10, marginStart: 10 }} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                                </TouchableOpacity>
                            </Tooltip>
                        </View>
                    </KeyboardAvoidingView>

                </View>
                <View style={{ width: screenWidth, paddingHorizontal: 25, paddingBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                    <TouchableOpacity style={{}} onPress={() => {
                        SpeakText()

                    }}>
                        <MaterialIcons name="volume-up" size={30} color={pageColor === 'default' ? '#FFBC01' : 'black'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { StartStopRecording() }}>
                        {recording ?
                            <Card style={{ width: 75, height: 75, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'red' }}>
                                <MaterialIcons name="keyboard-voice" size={30} color="red" />
                            </Card>
                            :
                            <MaterialIcons name="keyboard-voice" size={25} color={pageColor === 'default' ? '#FFBC01' : 'black'} />}
                    </TouchableOpacity>
                    {starVisible ?
                        <TouchableOpacity onPress={() => { StarNote(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize) }}>
                            <MaterialIcons name="star-border" size={25} color={pageColor === 'default' ? '#FFBC01' : 'black'} />
                        </TouchableOpacity>
                        :
                        null}

                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}

                        anchor={<TouchableOpacity onPress={openMenu}>
                            <Ionicons name="camera" size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                        </TouchableOpacity>}>
                        <Menu.Item onPress={() => {
                            closeMenu()
                            LaunchCamera()
                        }} title="Camera" leadingIcon="camera" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                        <Menu.Item onPress={() => {
                            closeMenu()
                            PickImage()
                        }} title="Gallery" leadingIcon="image" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                    </Menu>

                </View>
            </View>
            <Portal>
                <Modal visible={loading}
                    dismissable={false}
                    contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ padding: 30, borderRadius: 50 }}>
                        <ActivityIndicator size={40} />
                    </Card>
                </Modal>
            </Portal>
            <Portal>
                <Snackbar visible={snackbar.visible} action={{ label: 'Done', onPress: () => { setSnackBar({ visible: false, message: '' }) } }} duration={3000} onDismiss={() => { setSnackBar({ visible: false, message: '' }) }}>
                    {snackbar.message}
                </Snackbar>
            </Portal>
            <Modal style={{ alignItems: "center", justifyContent: 'center' }} visible={expandedView} dismissable onDismiss={() => { setExpandedView(false) }} dismissableBackButton>
                <View style={{
                    marginTop: 20, width: screenWidth, height: screenHeight, borderTopStartRadius: 20, borderTopEndRadius: 20, alignItems: 'center',
                    flex: 1, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4'
                }}>

                    <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: pageColor === 'default' ? colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4' : pageColor, opacity: 0.6, borderTopEndRadius: 20, borderTopStartRadius: 20 }} />
                    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 15 }}>
                        <TouchableOpacity onPress={() => { setExpandedView(false) }}>
                            <MaterialIcons name="close" size={30} color={pageColor === 'default' ? '#FFBC01' : 'black'} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            saveButton === "Update" ?
                                UpdateData(props.route.params.id, titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                :
                                saveButton == "Update archive" ?
                                    UpdateArchive(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                    :
                                    saveButton == 'Update Star' ?
                                        UpdateStarred(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                        :
                                        saveButton == 'Save to Folder' ?
                                            SaveToFolder(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
                                            :
                                            SaveToDatabase()
                        }}>
                            <Text style={{
                                color: pageColor === 'default' ? "#FFBC01" : 'black', fontSize: 21, fontFamily: 'mulish'
                            }}>{saveButton}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginBottom: 10, fontSize: 12, marginTop: 10 }}>{dateText} {timeText}</Text>
                    <KeyboardAvoidingView style={{ width: '90%', alignItems: 'flex-start', alignSelf: 'flex-start', flex: focusedTitle ? 0.5 : 0.2 }}>
                        <TextInput placeholder="Title" placeholderTextColor="#606060" style={{
                            width: '100%', backgroundColor: 'transparent',
                            fontFamily: fontStyle === 'default' ? 'mulish' : fontStyle, fontSize: fontStyle === 'default' ? fontSize + 6 : fontSize + 14, fontWeight: fontStyle === 'default' ? 'bold' : 'normal', marginStart: 20, marginTop: 20
                            , color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#101010' : fontColor
                        }} multiline onFocus={() => { setFocusedTitle(true) }} onKeyPress={(e) => {
                            if (e.nativeEvent.key == 'Enter') {
                                refTitle.current.blur()
                                refInput.current.focus()
                                setTimeout(() => {
                                    setTitleText(titleText.trim())
                                }, 100)
                            }
                        }}
                            value={titleText} onChangeText={(text) => { setTitleText(text) }}
                            onBlur={() => {
                                setFocusedTitle(false)
                            }}
                            maxLength={100} activeOutlineColor="transparent" outlineColor="transparent"
                            underlineColor="transparent" underlineColorAndroid="transparent"
                            selectionColor="#FFBC01" activeUnderlineColor="transparent"
                            cursorColor="yellow" />
                    </KeyboardAvoidingView>
                    <KeyboardAvoidingView style={{ width: '90%', flex: 1, alignItems: 'flex-start', alignSelf: 'flex-start', }}>
                        <TextInput placeholder="Note" placeholderTextColor="#606060" style={{
                            width: '100%', backgroundColor: 'transparent',
                            fontFamily: fontStyle === 'default' ? null : fontStyle, fontSize: fontSize, marginStart: 20,
                            color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#202020' : fontColor,
                        }}
                            scrollEnabled={true} selectionColor="#FFBC01"
                            onKeyPress={(e) => {
                                if (e.nativeEvent.key == 'Backspace') {
                                    noteText ? null : refTitle.current.focus()
                                }
                            }}
                            multiline={true} value={noteText} onChangeText={(text) => { AutoSaveNote(text) }}
                            maxLength={5000} activeOutlineColor="transparent" outlineColor="transparent"
                            underlineColor="transparent" underlineColorAndroid="transparent"
                            activeUnderlineColor="transparent"
                            cursorColor="yellow" autoFocus={props.route.params == undefined ? true : false} />

                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>

    )
}


export default CreateNote