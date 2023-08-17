import React, { useCallback, useEffect, useRef, useState } from "react";
import Styles from "./Styles";
import { Animated, Appearance, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Card, Chip, Menu, Modal, Portal, Text, Tooltip } from "react-native-paper";


import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import * as SQLite from 'expo-sqlite'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'

import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import Slider from "@react-native-community/slider";
import FontAwesome from '@expo/vector-icons/FontAwesome'
import axios from "axios";
import { firebase } from '../firebase'
import * as FileSystem from 'expo-file-system'
import ImageKit from "imagekit-javascript";


SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height
const CreateNote = (props) => {



    const [image, setImage] = useState(null);
    const [visible, setVisible] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);
    const [status, requestPermission] = ImagePicker.useCameraPermissions();
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme)
    const refInput = useRef(null);
    const refTitle = useRef(null)
    const [titleText, setTitleText] = useState("")
    const [noteText, setNoteText] = useState("")
    const [saveButton, setSaveButton] = useState("Save")


    const colorSection = new Animated.Value(0)
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
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM notes WHERE id =${props.route.params.id}`, [],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
                            setTitleText(rs.rows.item(0).title)
                            setNoteText(rs.rows.item(0).note)
                            setPageColor(rs.rows.item(0).pageColor.toString())
                            setFontColor(rs.rows.item(0).fontColor)
                            console.log(rs.rows.item(0));
                            setFontStyle(rs.rows.item(0).fontStyle)
                            setFontSize(Math.floor(rs.rows.item(0).fontSize))
                            setSaveButton("Update")
                        }
                    },
                    error => {
                        console.log("Error");
                    })
            })
        }
    }, [])





    const PickColor = () => {
        if (open) {
            refInput.current.blur()
            refTitle.current.blur()
            Animated.timing(colorSection, {
                toValue: 0,
                duration: 100,
                useNativeDriver: false
            }).start(() => {
                setOpen(false)
            })

        } else {
            refInput.current.blur()
            refTitle.current.blur()
            Animated.spring(colorSection, {
                toValue: 370,
                duration: 50,
                useNativeDriver: false
            }).start(() => {
                setOpen(true)
            })
        }
    }

    

    const UploadImage = async (image) => {
        const data = new FormData()
        data.append('file',image)
        data.append('upload_preset', 'imagetotext')
        data.append('cloud_name','pankajisrani')

        fetch('https://api.cloudinary.com/v1_1/pankajisrani/image/upload',{
            method:'post',
            body:data
        }).then(res=>res.json()).then((response)=>{
            setTimeout(() => {
                fetch(`https://api.ocr.space/parse/imageurl?apikey=K88712079788957&url=${response.url}`).then(res=>res.json()).
                then((resp)=>{
                    setNoteText(resp.ParsedResults[0].ParsedText)
                }).catch((error)=>{
                    //show alert of error here
                })
            }, 100);
            
        })
        
    }

    const LaunchCamera = async () => {
        await ImagePicker.getCameraPermissionsAsync()
        let result = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.back,
            allowsEditing: true,
            aspect: [5, 5],
            quality: 0.5,
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        })

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setTimeout(() => {
                let newfile = {uri:result.assets[0].uri, type:`test/${result.assets[0].uri.split(".")[1]}`, name:`test.${result.assets[0].uri.split(".")[1]}`}
                UploadImage(newfile)
            }, 100);

        }
    }

    const PickImage = async () => {
        ImagePicker.getMediaLibraryPermissionsAsync()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [5, 5],
            quality: 0.5,
        });


        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setTimeout(() => {
                let newfile = {uri:result.assets[0].uri, type:`test/${result.assets[0].uri.split(".")[1]}`, name:`test.${result.assets[0].uri.split(".")[1]}`}
                UploadImage(newfile)
            }, 100);

        }
    };


    const UpdateData = (id, title, note, date, time, pageColor, fontColor, fontStyle, fontSize) => {
        if (refTitle.current.isFocused() == true) {
            refTitle.current.blur()
        }
        if (refInput.current.isFocused() == true) {
            refInput.current.blur()
        }
        if (titleText || noteText) {
            db.transaction(tx => {
                tx.executeSql(`UPDATE notes SET title = (?), note = (?), date = (?), time = (?), pageColor = (?), fontColor = (?), fontStyle = (?), fontSize = (?) WHERE id = ${id}`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
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
            console.log("Error");
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





    const InsertData = async (textTitle, noteText, dateText, timeText, pageColor, fontColor, fontStyle, fontSize) => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO notes (title, note, date, time, pageColor, fontColor, fontStyle, fontSize) values (?,?,?,?,?,?,?,?)`, [textTitle, noteText, dateText, timeText, pageColor, fontColor, fontStyle, fontSize],
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
            InsertData(titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
        }
    }


    return (
        <View
            enabled={true} style={{ flex: 1 }}
            behavior="padding">

            <SafeAreaView style={[Styles.container, {}]} onLayout={onLayoutRootView}>
                <View style={[Styles.container, { justifyContent: 'space-between', }]}>
                    <KeyboardAvoidingView style={{ width: screenWidth, alignItems: 'center', height: '90%' }} behavior="padding">
                        <ImageBackground style={{ width: screenWidth, height: 1500, backgroundColor: pageColor === 'default' ? null : pageColor, position: 'absolute', opacity: 0.3, alignSelf: 'center', marginTop: -500 }} />
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => { props.navigation.navigate("Home") }} style={{ margin: 20 }}>
                                <MaterialIcons name="arrow-back-ios" size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity style={{ marginEnd: 30 }} onPress={() => { PickColor() }}>
                                    <Ionicons name={open ? "close" : "color-fill-outline"} size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    saveButton === "Update" ?
                                        UpdateData(props.route.params.id, titleText, noteText, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), pageColor, fontColor, fontStyle, fontSize)
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
                        <Animated.View style={{ width: screenWidth, height: colorSection, opacity: colorSection }}>
                            <View style={{ width: screenWidth }}>
                                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Page Colour</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: screenWidth }}>
                                    <TouchableOpacity onPress={() => { setPageColor('default') }}
                                    >
                                        <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageColor('default') }}
                                    >
                                        <View style={{ backgroundColor: black, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageColor(pinkish) }}>
                                        <View style={{ backgroundColor: pinkish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageColor(yellowish) }}>
                                        <View style={{ backgroundColor: yellowish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageColor(blueish) }}>
                                        <View style={{ backgroundColor: blueish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setPageColor(greenish) }}>
                                        <View style={{ backgroundColor: greenish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ width: screenWidth }}>
                                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, marginStart: 25, marginTop: 10, marginBottom: 10 }}>Font Colour</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: screenWidth }}>
                                    <TouchableOpacity onPress={() => { setFontColor(greenish) }}>
                                        <View style={{ backgroundColor: greenish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setFontColor(blueish) }}>
                                        <View style={{ backgroundColor: blueish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setFontColor(yellowish) }}>
                                        <View style={{ backgroundColor: yellowish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setFontColor(pinkish) }}>
                                        <View style={{ backgroundColor: pinkish, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setFontColor(black) }}
                                    >
                                        <View style={{ backgroundColor: black, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setFontColor(white) }}
                                    >
                                        <View style={{ backgroundColor: white, borderWidth: 2, borderColor: 'lightgray', borderRadius: 20 }}><View style={{ padding: 10 }}></View></View>
                                    </TouchableOpacity>
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
                        </Animated.View>

                        <Text style={{ marginBottom: 10, fontSize: 12 }}>{dateText} {timeText}</Text>

                        <View style={{ width: screenWidth, alignItems: 'center', marginHorizontal: 20 }}>
                            <TextInput placeholder="Title" placeholderTextColor="#606060" style={{
                                width: '90%', backgroundColor: 'transparent',
                                fontFamily: fontStyle === 'default' ? 'mulish' : fontStyle, fontSize: fontStyle === 'default' ? fontSize + 6 : fontSize + 14, fontWeight: fontStyle === 'default' ? 'bold' : 'normal', marginStart: 20, marginTop: 20
                                , color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#101010' : fontColor
                            }}

                                multiline value={titleText} onChangeText={(text) => { setTitleText(text) }}
                                ref={refTitle}
                                maxLength={100} activeOutlineColor="transparent" outlineColor="transparent"
                                underlineColor="transparent" underlineColorAndroid="transparent"
                                selectionColor="#FFBC01" activeUnderlineColor="transparent"
                                cursorColor="yellow" />

                            <TextInput placeholder="Note" placeholderTextColor="#606060" style={{
                                width: '90%', backgroundColor: 'transparent',
                                fontFamily: fontStyle === 'default' ? null : fontStyle, fontSize: fontSize, marginStart: 20, marginTop: 30,
                                color: fontColor === 'default' ? colorScheme === 'dark' ? white : '#202020' : fontColor, marginBottom: 25
                            }}
                                scrollEnabled={true} selectionColor="#FFBC01"
                                textContentType="none"

                                multiline={true} ref={refInput} value={noteText} onChangeText={(text) => { setNoteText(text) }}
                                maxLength={4000} activeOutlineColor="transparent" outlineColor="transparent"
                                underlineColor="transparent" underlineColorAndroid="transparent"
                                activeUnderlineColor="transparent"
                                cursorColor="yellow" autoFocus={props.route.params == undefined ? true : false}

                                onBlur={() => { }} />
                        </View>

                    </KeyboardAvoidingView>
                    <View style={{ width: screenWidth, paddingHorizontal: 25, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Tooltip title="Browse Internet">
                            <TouchableOpacity style={{}} onPress={() => {
                                props.navigation.navigate("Browser")
                            }}>
                                <Ionicons name="globe-outline" size={25} color={pageColor === 'default' ? "#FFBC01" : 'black'} />
                            </TouchableOpacity>
                        </Tooltip>
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
            </SafeAreaView>

        </View>
    )
}


export default CreateNote