import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, View, TouchableOpacity, ScrollView, TextInput, ToastAndroid, ImageBackground, Appearance, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Speech from 'expo-speech'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'

import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";
import Styles from "./Styles";

import Ionicons from '@expo/vector-icons/Ionicons'
import { Button, Chip, Divider, Menu, Modal, Surface, Text } from "react-native-paper";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import ToggleSwitch from "toggle-switch-react-native";
import * as Clipboard from 'expo-clipboard'
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import ViewShot from "react-native-view-shot";
import { SegmentedControl } from "react-native-ui-lib";


const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const ReadingMode = (props) => {


    const [noteid, setNoteId] = useState('')
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const textInputRef = useRef(null)
    const [wordCount, setWordCount] = useState(0)
    const [selected, setSelected] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [modalmode, setModalMode] = useState('Display')
    const [fontSize, setFontSize] = useState(15)
    const [bold, setBold] = useState(false)
    const [italic, setItalic] = useState(false)
    const [underline, setUnderline] = useState(false)
    const [line, setLine] = useState(false)
    const [fontFamily, setFontFamily] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [scrollMode, setScrollMode] = useState(true)
    const [switchOn, setSwitchOn] = useState(true)
    const [pageColor, setPageColor] = useState('default')
    const [textColor, setTextColor] = useState('default')
    const [speaking, setSpeaking] = useState(false)
    const [speed, setSpeed] = useState(1)
    const [volume, setVolume] = useState(0.7)
    const [pitch, setPitch] = useState(1.0)
    const [voice, setVoice] = useState('en-us-x-tpc-local')
    const [menuVoice, setMenuVoice] = useState(false)
    const viewshotRef = useRef(null);
    const [modalShare, setModalShare] = useState(false)
    const [finalSelection, setFinalSelection] = useState('')
    const [includeTitle, setIncludeTitle] = useState(true)
    const [shareFontSize, setShareFontSize] = useState(15)
    const [shareItalic, setShareItalic] = useState(false)
    const [shareBold, setShareBold] = useState(false)
    const [shareUnderline, setShareUnderline] = useState(false)
    const [shareLine, setShareLine] = useState(false)
    const [shareFontFamily, setShareFontFamily] = useState('')
    const [shareTextColor, setShareTextColor] = useState('default')
    const [menuShare, setMenuShare] = useState(false)
    const [shareImage, setShareImage] = useState(false)
    const [metal, setMetal] = useState(false)
    const [oldpaper, setOldPaper] = useState(false)
    const [newspaper, setNewsPaper] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [wordModal, setWordModal] = useState(false)
    const [readingTime, setReadingTime] = useState(0)


    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })


    const GetWordCount = () => {
        if (title && note) {
            const word = title.trim().split(' ').length + note.trim().split(' ').length
            setWordCount(word)
        } else if (!title && note) {
            const word = note.trim().split(' ').length
            setWordCount(word)
        } else if (title && !note) {
            const word = title.trim().split(' ').length
            setWordCount(word)
        }
    }

    const GetReadingTime = () => {
        const words = wordCount;
        const wordsPerMinute = 150;
        const readingtime = Math.ceil(words / wordsPerMinute)
        setReadingTime(readingtime)
    }
    const GetSelectedText = (selection) => {
        if (selection.start == selection.end) {
            setSelected('')
        } else {
            const selectedText = note.substring(selection.start, selection.end)
            setSelected(selectedText)
        }
    }

    const SpeakNote = () => {
        Speech.isSpeakingAsync().then((rs) => {
            if (rs) {
                Speech.stop().then(() => {
                    setSpeaking(false)
                })
            } else {
                Speech.VoiceQuality.Enhanced
                if (title == '' && note == '') {
                    const thingsToSay = 'Both title and note are empty.'
                    Speech.speak(thingsToSay, {
                        onDone: () => {
                            setSpeaking(false)
                        },
                        onStart: () => {
                            setSpeaking(true)
                        },
                        onStopped: () => {
                            setSpeaking(false)
                        },
                        rate: speed,
                        volume: volume,
                        pitch: pitch,
                        voice: voice
                    })
                }
                else if (!title == '' && note == '') {
                    const thingsToSay = 'Title is. ' + title + '. But Note is Empty.'
                    Speech.speak(thingsToSay, {
                        onDone: () => {
                            setSpeaking(false)
                        },
                        onStart: () => {
                            setSpeaking(true)
                        },
                        onStopped: () => {
                            setSpeaking(false)
                        },
                        rate: speed,
                        volume: volume,
                        pitch: pitch,
                        voice: voice
                    })
                }
                else if (title == '' && !note == '') {
                    const thingsToSay = 'Title is Empty. But note is. ' + note
                    Speech.speak(thingsToSay, {
                        onDone: () => {
                            setSpeaking(false)
                        },
                        onStart: () => {
                            setSpeaking(true)
                        },
                        onStopped: () => {
                            setSpeaking(false)
                        },
                        rate: speed,
                        volume: volume,
                        pitch: pitch,
                        voice: voice
                    })
                }
                else {
                    const thingsToSay = 'Title is. ' + title + '. And note is. ' + note
                    Speech.speak(thingsToSay, {
                        onDone: () => {
                            setSpeaking(false)
                        },
                        onStart: () => {
                            setSpeaking(true)
                        },
                        onStopped: () => {
                            setSpeaking(false)
                        },
                        rate: speed,
                        volume: volume,
                        pitch: pitch,
                        voice: voice
                    })
                }


            }
        })
    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM notes WHERE id = (?)", [noteid],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let title = rs.rows._array[0].title
                        let note = rs.rows._array[0].note
                        let date = rs.rows._array[0].date
                        let time = rs.rows._array[0].time

                        setTitle(title)
                        setNote(note)
                        setDate(date)
                        setTime(time)
                    }
                })
        })
    }

    const DecreaseFontSize = () => {
        if (fontSize === 15) {

        } else {
            setFontSize(fontSize - 1)
        }
    }

    const IncreaseFontSize = () => {
        if (fontSize === 30) {

        } else {
            setFontSize(fontSize + 1)
        }
    }

    useEffect(() => {
        if (props.route.params === undefined) {

        } else {
            setNoteId(props.route.params.noteid)
            GetData()
            GetWordCount()
            GetReadingTime()
        }
    }, [isFocused, noteid, note, title])

    const isFocused = useIsFocused()

    useEffect(() => {
        GetData()
        GetWordCount()
        GetReadingTime()
    }, [noteid, note])


    const FinalSelection = () => {
        setFinalSelection(selected)
    }



    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf"),
        'amatic': require('../assets/fonts/amatic.ttf'),
        'dancingspirit': require('../assets/fonts/dancingspirit.ttf'),
        'gochihand': require('../assets/fonts/gochihand.ttf'),
        'greatvibes': require('../assets/fonts/greatvibes.ttf'),
        'kaushan': require('../assets/fonts/kaushan.ttf'),
        'thegreat': require('../assets/fonts/thegreat.ttf'),
    })


    const SaveToGallery = async () => {
        setLoading(true)
        await MediaLibrary.requestPermissionsAsync()
        await MediaLibrary.getPermissionsAsync()
        viewshotRef.current.capture().then((uri) => {
            MediaLibrary.saveToLibraryAsync(uri).then(() => {
                setLoading(false)
                setDone(true)
                ToastAndroid.show("File saved to gallery", ToastAndroid.SHORT)
                setTimeout(() => {
                    setLoading(false)
                    setDone(false)
                }, 5000)
            }).catch((err) => {
                setLoading(false)
                setDone(false)
                ToastAndroid.show("Error Encountered: ", err)
            })
        })
    }

    const ShareImageToOtherApps = async () => {
        Sharing.isAvailableAsync().then((rs) => {
            if (rs) {
                viewshotRef.current.capture().then((uri) => {
                    Sharing.shareAsync(uri)
                })
            }
        })
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

    const CopytoClipboard = async () => {
        await Clipboard.setStringAsync(selected)
        ToastAndroid.show('Copied to Clipboard!', ToastAndroid.SHORT)
    }


    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }



    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={{ width: screenWidth, height: screenHeight + 100, backgroundColor: pageColor === 'default' ? 'transparent' : pageColor, position: 'absolute' }} />
            <TouchableOpacity style={{ flexDirection: "row", alignSelf: 'flex-start', marginTop: 20, marginStart: 5, alignItems: 'center' }}
                onPress={() => { props.navigation.goBack() }}>
                <MaterialIcons name="arrow-back-ios" size={25} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                <Text style={{ color: pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor, fontSize: 23, fontWeight: 'bold', marginBottom: 2 }}>Reading Mode</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: screenWidth }}>
                <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 20 }} activeOpacity={0.6} onPress={() => { setWordModal(true) }}>
                    <View style={{ width: 130, height: 40, borderRadius: 30, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'mulish', color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor }}>{wordCount}</Text>
                        <Text style={{ fontFamily: 'mulish', color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor }}> Words</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 20 }} activeOpacity={0.6} onPress={() => { setScrollMode(!scrollMode) }}>
                    <View style={{ width: 130, height: 40, borderRadius: 30, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor }}>{scrollMode ? 'Scroll Mode' : 'Selection'}</Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color={textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView style={{ width: screenWidth }} showsVerticalScrollIndicator={true}>
                <Text selectable={false} style={{ alignSelf: 'flex-start', marginHorizontal: 30, marginTop: 10, fontSize: 30, fontWeight: 'bold', textAlign: 'left', color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : 'black' : textColor }}>
                    {title.trim()}
                </Text>

                {
                    scrollMode ?
                        <Text selectable={false} style={{
                            alignSelf: 'flex-start', marginHorizontal: 30, marginTop: 10, fontSize: fontSize, textAlign: 'left', marginBottom: 20, color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : 'black' : textColor,
                            fontWeight: bold ? 'bold' : 'normal', textDecorationLine: underline ? 'underline' : line ? 'line-through' : 'none', fontStyle: italic ? 'italic' : 'normal', fontFamily: fontFamily === '' ? null : fontFamily
                        }}>{note.trim()}</Text>
                        :
                        <TextInput value={note.trim()} focusable={false} ref={textInputRef} scrollEnabled
                            onSelectionChange={(txt) => { GetSelectedText(txt.nativeEvent.selection) }}
                            selectionColor="#FFBC01" multiline style={{
                                alignSelf: 'flex-start', marginHorizontal: 30, marginTop: 10, fontSize: fontSize, textAlign: 'left', marginBottom: 20, color: textColor === 'default' ? colorScheme === 'dark' ? 'white' : 'black' : textColor,
                                fontWeight: bold ? 'bold' : 'normal', textDecorationLine: underline ? 'underline' : line ? 'line-through' : 'none', fontStyle: italic ? 'italic' : 'normal', fontFamily: fontFamily === '' ? null : fontFamily
                            }}
                            onChangeText={() => {
                                ToastAndroid.show("Editing not allowed, only Selection allowed!", ToastAndroid.SHORT)
                            }} />
                }
            </ScrollView>
            <View style={{ width: screenWidth - 50, flexDirection: 'row', alignItems: 'center', marginVertical: 5, justifyContent: 'space-between' }}>
                <TouchableOpacity style={{}}
                    onPress={() => {
                        SpeakNote()
                    }}>
                    <MaterialCommIcons name={speaking ? 'pause' : 'volume-high'} size={29} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                </TouchableOpacity>
                {
                    selected == '' ?
                        null
                        :
                        <View style={{ width: 150, height: 50, backgroundColor: colorScheme === 'dark' ? '#303030' : pageColor === 'default' ? '#e3e3e3' : 'darkgray', borderRadius: 30, alignItems: 'center', justifyContent: 'space-evenly', flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => {
                                FinalSelection()
                                textInputRef.current.blur()
                                setSelected('')
                                setModalShare(true)
                            }}>
                                <MaterialIcons name="ios-share" size={25} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                CopytoClipboard()
                            }}>
                                <MaterialIcons name="content-copy" size={25} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                            </TouchableOpacity>
                        </View>
                }

                <TouchableOpacity onPress={() => { setModalVisible(true) }}>
                    <Ionicons name="settings" size={27} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                </TouchableOpacity>
            </View>
            <Modal visible={modalShare} style={{ width: screenWidth, flex: 1, justifyContent: 'space-around', alignItems: 'center' }}
                onDismiss={() => { setModalShare(false) }} dismissableBackButton>
                <ViewShot ref={viewshotRef} options={{ fileName: 'CloudNotes' }} style={{ width: 300, height: 400, borderRadius: 30, backgroundColor: pageColor === 'default' ? colorScheme === 'dark' ? '#101010' : 'white' : pageColor, alignItems: 'center', alignSelf: 'center' }}>
                    <View style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 30 }}>


                        {shareImage ?
                            oldpaper ?
                                <ImageBackground source={require(`../assets/oldpaper.png`)} style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 30, }} />
                                :
                                newspaper ?
                                    <ImageBackground source={require(`../assets/newspaper.png`)} style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 30, }} />
                                    :
                                    <ImageBackground source={require(`../assets/metal.png`)} style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 30, }} />
                            :
                            <View style={{ width: '100%', height: '100%', position: 'absolute', borderRadius: 30, }} />
                        }
                    </View>
                    {includeTitle ?
                        <Text style={{ fontSize: shareFontSize + 8, marginTop: 20, marginHorizontal: 30, textAlign: 'left', alignSelf: 'flex-start', color: shareTextColor === 'default' ? textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor : shareTextColor, fontWeight: 'bold' }}>{title}</Text>
                        :
                        null}
                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20, width: '100%' }}>
                        <Text style={{ marginHorizontal: 30, alignSelf: 'flex-start', textAlign: 'left', marginVertical: 20, fontSize: shareFontSize, color: shareTextColor === 'default' ? textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor : shareTextColor, fontFamily: shareFontFamily === '' ? null : shareFontFamily, fontStyle: shareItalic ? 'italic' : 'normal', fontWeight: shareBold ? 'bold' : 'normal', textDecorationLine: shareLine ? 'line-through' : shareUnderline ? 'underline' : 'none' }}>{finalSelection.trim()}</Text>
                    </ScrollView>
                </ViewShot>
                <View style={{ width: screenWidth - 30, marginTop: 30, backgroundColor: colorScheme === 'dark' ? '#101010' : '#e3e3e3', borderRadius: 20, alignItems: 'center' }}>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', }}>
                        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 10 }}>
                            <View style={{ width: '35%', height: 50, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={{ width: '49%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                    onPress={() => {
                                        shareFontSize === 13 ?
                                            null
                                            :
                                            setShareFontSize(shareFontSize - 1)
                                    }}>
                                    <Text style={{ fontSize: 15 }}>A-</Text>
                                </TouchableOpacity>
                                <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                                <TouchableOpacity style={{ width: '49%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                    onPress={() => {
                                        shareFontSize === 30 ?
                                            null
                                            :
                                            setShareFontSize(shareFontSize + 1)
                                    }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 23 }}>A+</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={{ width: '55%', height: 50 }} onPress={() => { setMenuShare(true) }}>
                                <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 17 }}>Font Styles</Text>
                                    <Menu visible={menuShare} onDismiss={() => { setMenuShare(false) }}
                                        anchor={<MaterialIcons name="arrow-drop-down" size={30} color={colorScheme === 'dark' ? 'white' : '#101010'} />}>
                                        <Menu.Item title={<Text style={{ fontFamily: 'mulish' }}>Mulish</Text>} trailingIcon={shareFontFamily === 'mulish' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('mulish')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'amatic', fontSize: 19 }}>Amatic</Text>} trailingIcon={shareFontFamily === 'amatic' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }}
                                            onPress={() => {
                                                setShareFontFamily('amatic')
                                                setShareItalic(false)
                                                setShareBold(false)
                                                setMenuShare(false)
                                            }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'dancingspirit', fontSize: 17 }}>Dancing Spirit</Text>} trailingIcon={shareFontFamily === 'dancingspirit' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('dancingspirit')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'gochihand', fontSize: 17 }}>Gochihand</Text>} trailingIcon={shareFontFamily === 'gochihand' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('gochihand')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'greatvibes', fontSize: 17 }}>Great Vibes</Text>} trailingIcon={shareFontFamily === 'greatvibes' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('greatvibes')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'kaushan', fontSize: 17 }}>Kaushan</Text>} trailingIcon={shareFontFamily === 'kaushan' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('kaushan')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                        <Menu.Item title={<Text style={{ fontFamily: 'thegreat', fontSize: 17 }}>The Great</Text>} trailingIcon={shareFontFamily === 'thegreat' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                            setShareFontFamily('thegreat')
                                            setShareItalic(false)
                                            setShareBold(false)
                                            setMenuShare(false)
                                        }} />
                                    </Menu>
                                </View>
                            </TouchableOpacity>
                        </View>


                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 10 }}>
                        <View style={{ width: '70%', height: 50, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => {
                                    setShareItalic(false)
                                    setShareUnderline(false)
                                    setShareLine(false)
                                    setShareBold(false)
                                    setShareFontFamily('')
                                }}>
                                <MaterialIcons name="block" size={22} color={colorScheme == 'dark' ? 'white' : '#101010'} />
                            </TouchableOpacity>
                            <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                            <TouchableOpacity onPress={() => { setShareItalic(!shareItalic) }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialIcons name="format-italic" size={22} color={colorScheme == 'dark' ? 'white' : '#101010'} />
                            </TouchableOpacity>
                            <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                            <TouchableOpacity onPress={() => { setShareUnderline(!shareUnderline) }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 22, textDecorationLine: 'underline' }}>U</Text>
                            </TouchableOpacity>
                            <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                            <TouchableOpacity onPress={() => { setShareLine(!shareLine) }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 22, textDecorationLine: 'line-through' }}>Aa</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ width: '20%', height: 50 }} onPress={() => { setShareBold(!shareBold) }}>
                            <View style={{
                                width: '100%', height: '100%', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{ fontSize: 27, fontWeight: 'bold' }}>B</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '90%', paddingVertical: 10, paddingHorizontal: 5, height: 'auto', backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <TouchableOpacity style={{ width: '23%', height: 50 }} activeOpacity={0.6}
                                onPress={() => {
                                    setShareFontFamily('')
                                    setShareTextColor('default')
                                    setMetal(false)
                                    setOldPaper(false)
                                    setNewsPaper(false)
                                    setShareImage(false)
                                }}>
                                <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor == 'default' ? shareImage ? colorScheme === 'dark' ? '#707070' : '#101010' : '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? 'black' : 'white', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 20 }}>Aa</Text>
                                    <Text style={{ fontSize: 11 }}>Original</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '23%', height: 50 }} activeOpacity={0.6}
                                onPress={() => {
                                    setShareTextColor('white')
                                    setOldPaper(false)
                                    setMetal(true)
                                    setNewsPaper(false)
                                    setShareImage(true)
                                }}>
                                <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: metal ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: '#202020', alignItems: 'center', justifyContent: 'center' }}>

                                    <Text style={{ fontSize: 20, color: 'white' }}>Aa</Text>
                                    <Text style={{ fontSize: 11, color: 'white' }}>Metal</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '23%', height: 50 }} activeOpacity={0.6}
                                onPress={() => {
                                    setShareTextColor('black')
                                    setOldPaper(true)
                                    setMetal(false)
                                    setNewsPaper(false)
                                    setShareImage(true)
                                }}>
                                <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: oldpaper ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: '#C9B48D', alignItems: 'center', justifyContent: 'center' }}>

                                    <Text style={{ fontSize: 20, color: 'black' }}>Aa</Text>
                                    <Text style={{ fontSize: 11, color: 'black' }}>Old Paper</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: '23%', height: 50 }} activeOpacity={0.6}
                                onPress={() => {
                                    setShareTextColor('black')
                                    setOldPaper(false)
                                    setMetal(false)
                                    setNewsPaper(true)
                                    setShareImage(true)
                                }}>
                                <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: newspaper ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: '#e3e3e3', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 20, color: 'black' }}>Aa</Text>
                                    <Text style={{ fontSize: 11, color: 'black' }}>Newspaper</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ width: '100%', paddingHorizontal: 25, marginVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity onPress={() => {
                            SaveToGallery()
                        }}>
                            {loading ?
                                <MaterialCommIcons name="dots-horizontal" size={25} color="#FFBC01" />
                                :
                                done ?
                                    <MaterialIcons name="file-download-done" size={25} color="#FFBC01" />
                                    :
                                    <Ionicons name="download-outline" size={25} color="#FFBC01" />}

                        </TouchableOpacity>
                        <Button onPress={() => {
                            setIncludeTitle(!includeTitle)
                        }}>
                            {includeTitle ?
                                'Remove Title'
                                :
                                'Include Title'}
                        </Button>
                        <TouchableOpacity onPress={() => {
                            ShareImageToOtherApps()
                        }}>
                            <MaterialIcons name="ios-share" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal visible={modalVisible} style={{ width: screenWidth, height: screenHeight, flex: 1, justifyContent: 'flex-end' }}
                onDismiss={() => { setModalVisible(false) }} dismissableBackButton>
                <View style={{ width: screenWidth, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4', borderTopStartRadius: 20, borderTopEndRadius: 20, alignItems: 'center' }}>
                    <View style={{ width: 50, height: 5, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? '#303030' : '#e3e3e3', marginTop: 10 }} />
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginEnd: 25 }} onPress={() => { setModalVisible(false) }}>
                        <MaterialIcons name="close" size={25} color={pageColor === 'default' ? '#FFBC01' : textColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : textColor} />
                    </TouchableOpacity>
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 20 }}>
                        <SegmentedControl activeBackgroundColor="#FFBC01" style={{ width: 200, height: 50, borderColor: 'transparent' }}
                            backgroundColor={colorScheme === 'dark' ? '#353535' : '#e3e3e3'} segmentsStyle={{ height: 50 }} initialIndex={0}
                            outlineColor={colorScheme === 'dark' ? '#707070' : '#909090'}
                            borderRadius={10} activeColor="white"
                            segments={[{ label: 'Display' }, { label: 'Audio', }]} onChangeIndex={(num) => {
                                num == 1 ?
                                    setModalMode('Audio')
                                    :
                                    setModalMode('Display')
                            }} />
                    </View>
                    {modalmode === 'Display' ?
                        <View style={{ width: '100%', alignItems: 'center', marginTop: 20, justifyContent: 'space-around', marginBottom: 50 }}>
                            <Text style={{ marginBottom: 15, fontSize: fontSize, fontWeight: bold ? 'bold' : 'normal', textDecorationLine: underline ? 'underline' : line ? 'line-through' : 'none', fontStyle: italic ? 'italic' : 'normal', fontFamily: fontFamily === '' ? null : fontFamily }}>Aa Size</Text>
                            <View style={{ width: '80%', height: 150, backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly' }}>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <View style={{ width: '35%', height: 50, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <TouchableOpacity style={{ width: '49%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => { DecreaseFontSize() }}>
                                            <Text style={{ fontSize: 15 }}>A-</Text>
                                        </TouchableOpacity>
                                        <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                                        <TouchableOpacity style={{ width: '49%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => { IncreaseFontSize() }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 23 }}>A+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={{ width: '55%', height: 50 }} onPress={() => { setMenuVisible(true) }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 17 }}>Font Styles</Text>
                                            <Menu visible={menuVisible} onDismiss={() => { setMenuVisible(false) }}
                                                anchor={<MaterialIcons name="arrow-drop-down" size={30} color={colorScheme === 'dark' ? 'white' : '#101010'} />}>
                                                <Menu.Item title={<Text style={{ fontFamily: 'mulish' }}>Mulish</Text>} trailingIcon={fontFamily === 'mulish' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('mulish')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'amatic', fontSize: 19 }}>Amatic</Text>} trailingIcon={fontFamily === 'amatic' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }}
                                                    onPress={() => {
                                                        setFontFamily('amatic')
                                                        setItalic(false)
                                                        setBold(false)
                                                        setMenuVisible(false)
                                                    }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'dancingspirit', fontSize: 17 }}>Dancing Spirit</Text>} trailingIcon={fontFamily === 'dancingspirit' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('dancingspirit')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'gochihand', fontSize: 17 }}>Gochihand</Text>} trailingIcon={fontFamily === 'gochihand' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('gochihand')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'greatvibes', fontSize: 17 }}>Great Vibes</Text>} trailingIcon={fontFamily === 'greatvibes' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('greatvibes')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'kaushan', fontSize: 17 }}>Kaushan</Text>} trailingIcon={fontFamily === 'kaushan' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('kaushan')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                                <Menu.Item title={<Text style={{ fontFamily: 'thegreat', fontSize: 17 }}>The Great</Text>} trailingIcon={fontFamily === 'thegreat' ? "check" : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} onPress={() => {
                                                    setFontFamily('thegreat')
                                                    setItalic(false)
                                                    setBold(false)
                                                    setMenuVisible(false)
                                                }} />
                                            </Menu>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                    <View style={{ width: '70%', height: 50, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <TouchableOpacity style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => {
                                                setItalic(false)
                                                setUnderline(false)
                                                setLine(false)
                                                setBold(false)
                                                setFontFamily('')
                                            }}>
                                            <MaterialIcons name="block" size={22} color={colorScheme == 'dark' ? 'white' : '#101010'} />
                                        </TouchableOpacity>
                                        <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                                        <TouchableOpacity onPress={() => { setItalic(!italic) }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <MaterialIcons name="format-italic" size={22} color={colorScheme == 'dark' ? 'white' : '#101010'} />
                                        </TouchableOpacity>
                                        <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                                        <TouchableOpacity onPress={() => {
                                            setUnderline(!underline)
                                            line ?
                                                setLine(false)
                                                :
                                                null
                                        }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 22, textDecorationLine: 'underline' }}>U</Text>
                                        </TouchableOpacity>
                                        <View style={{ height: '100%', width: 1, backgroundColor: colorScheme === 'dark' ? 'white' : '#101010' }} />
                                        <TouchableOpacity onPress={() => {
                                            setLine(!line)
                                            underline ?
                                                setUnderline(false)
                                                :
                                                null
                                        }} style={{ width: '25%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 22, textDecorationLine: 'line-through' }}>Aa</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity style={{ width: '20%', height: 50 }} onPress={() => { setBold(!bold) }}>
                                        <View style={{
                                            width: '100%', height: '100%', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 2, alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Text style={{ fontSize: 27, fontWeight: 'bold' }}>B</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ width: '80%', paddingVertical: 15, height: 'auto', backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6}
                                        onPress={() => {
                                            setFontFamily('')
                                            setPageColor('default')
                                            setSwitchOn(true)
                                            setModalVisible(false)
                                            setTextColor('default')
                                            setTimeout(() => {
                                                setModalVisible(true)
                                            }, 1000)
                                        }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor == 'default' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? 'black' : 'white', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20 }}>Aa</Text>
                                            <Text style={{ fontSize: 11 }}>Original</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6} onPress={() => {
                                        setFontFamily('mulish')
                                        setPageColor(colorScheme === 'dark' ? '#202020' : '#e3e3e3')
                                        setModalVisible(false)
                                        setTextColor('default')
                                        setSwitchOn(false)
                                        setTimeout(() => {
                                            setModalVisible(true)
                                        }, 1000)
                                    }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor === '#202020' || pageColor == '#e3e3e3' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? '#202020' : '#e3e3e3', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, fontFamily: 'mulish' }}>Aa</Text>
                                            <Text style={{ fontSize: 11 }}>Paper</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6}
                                        onPress={() => {
                                            setFontFamily('')
                                            setTextColor('white')
                                            setSwitchOn(false)
                                            setPageColor(colorScheme === 'dark' ? '#2e271e' : '#544736')
                                            setModalVisible(false)
                                            setTimeout(() => {
                                                setModalVisible(true)
                                            }, 1000)
                                        }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor === '#2e271e' || pageColor == '#544736' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? '#2e271e' : '#544736', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, color: 'white' }}>Aa</Text>
                                            <Text style={{ fontSize: 11, color: 'white' }}>Calm</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 15 }}>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6} onPress={() => {
                                        setFontFamily('')
                                        setTextColor('black')
                                        setSwitchOn(false)
                                        setPageColor(colorScheme === 'dark' ? '#b29c6b' : '#ffdf99')
                                        setModalVisible(false)
                                        setTimeout(() => {
                                            setModalVisible(true)
                                        }, 1000)
                                    }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor === '#b29c6b' || pageColor == '#ffdf99' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? '#b29c6b' : '#ffdf99', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, color: 'black' }}>Aa</Text>
                                            <Text style={{ fontSize: 11, color: 'black' }}>Delightful</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6} onPress={() => {
                                        setFontFamily('')
                                        setTextColor('#fde355')
                                        setSwitchOn(false)
                                        setPageColor(colorScheme === 'dark' ? '#1f1f1f' : '#1f1f1f')
                                        setModalVisible(false)
                                        setTimeout(() => {
                                            setModalVisible(true)
                                        }, 1000)
                                    }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor == '#1f1f1f' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, color: '#fde355' }}>Aa</Text>
                                            <Text style={{ fontSize: 11, color: '#fde355' }}>Thoughts</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ width: '25%', height: 55 }} activeOpacity={0.6} onPress={() => {
                                        setFontFamily('mulish')
                                        setTextColor(colorScheme === 'dark' ? '#808080' : 'lightgray')
                                        setPageColor(colorScheme === 'dark' ? '#101010' : '#606060')
                                        setModalVisible(false)
                                        setSwitchOn(false)
                                        setTimeout(() => {
                                            setModalVisible(true)
                                        }, 1000)
                                    }}>
                                        <View style={{ width: '100%', height: '100%', borderWidth: 1, borderColor: pageColor === '#606060' || pageColor == '#101010' ? '#FFBC01' : colorScheme === 'dark' ? '#707070' : '#101010', borderRadius: 5, backgroundColor: colorScheme === 'dark' ? '#101010' : '#606060', alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, color: colorScheme === 'dark' ? '#808080' : '#e3e3e3', fontFamily: 'mulish' }}>Aa</Text>
                                            <Text style={{ fontSize: 11, color: colorScheme === 'dark' ? '#808080' : '#e3e3e3' }}>Faded</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flexDirection: "row", marginTop: 20, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Text style={{ fontWeight: 'bold', marginStart: 20, fontSize: 20 }}>Use system theme</Text>
                                    <ToggleSwitch isOn={switchOn} style={{ marginEnd: 20 }} onColor='#FFBC01' size="small"
                                        onToggle={() => {
                                            {
                                                switchOn ?
                                                    null :
                                                    setSwitchOn(true)
                                                setFontFamily('')
                                                setPageColor('default')
                                                setModalVisible(false)
                                                setTextColor('default')
                                                setTimeout(() => {
                                                    setModalVisible(true)
                                                }, 1000)
                                            }
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        :
                        <View style={{ width: screenWidth, alignItems: 'center', justifyContent: "space-around", marginBottom: 50 }}>
                            <View style={{ width: '80%', height: 100, backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Reading Speed</Text>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{ marginStart: 20 }} onPress={() => {
                                        speed <= 1.0 ?
                                            null
                                            :
                                            setSpeed(speed - 0.1)
                                    }}>
                                        <MaterialCommIcons name="minus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                    <Text style={{ fontWeight: 'bold', fontSize: 23 }}>{speed.toFixed(1)}x</Text>
                                    <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => {
                                        speed === 4 ?
                                            null
                                            :
                                            setSpeed(speed + 0.1)
                                    }}>
                                        <MaterialCommIcons name="plus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ width: '80%', height: 110, backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Reading Voice</Text>
                                <TouchableOpacity style={{ width: '80%', height: 50 }} onPress={() => { setMenuVoice(true) }}>
                                    <View style={{ width: '100%', height: '100%', borderRadius: 5, borderWidth: 1, borderColor: colorScheme === 'dark' ? "#707070" : '#101010', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                                        <Text>Speech Voice en-US</Text>
                                        <Menu visible={menuVoice} onDismiss={() => { setMenuVoice(false) }}
                                            anchor={<MaterialIcons name="arrow-drop-down" size={30} color={colorScheme === 'dark' ? 'white' : '#101010'} />}>
                                            <Menu.Item title="English Male (United-States)" leadingIcon={voice == 'en-us-x-iol-local' ? 'check' : null} onPress={() => {
                                                setMenuVoice(false)
                                                setVoice('en-us-x-iol-local')
                                            }} />
                                            <Menu.Item title="English Female (United-States)" leadingIcon={voice == 'es-US-language' ? 'check' : null} onPress={() => {
                                                setMenuVoice(false)
                                                setVoice('es-US-language')
                                            }} />
                                            <Menu.Item title="English Female (India)" leadingIcon={voice == 'en-IN-language' ? 'check' : null} onPress={() => {
                                                setMenuVoice(false)
                                                setVoice('en-IN-language')
                                            }} />
                                            <Menu.Item title="English Female (US-High)" leadingIcon={voice == 'en-us-x-tpc-local' ? 'check' : null} onPress={() => {
                                                setMenuVoice(false)
                                                setVoice('en-us-x-tpc-local')
                                            }} />
                                        </Menu>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: '80%', height: 90, backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Reading Volume</Text>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{ marginStart: 20 }} onPress={() => {
                                        volume <= 0.1 ?
                                            null
                                            :
                                            setVolume(volume - 0.1)
                                    }}>
                                        <MaterialCommIcons name="minus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                    {/* <Text style={{ fontWeight: 'bold', fontSize: 23 }}>{volume.toFixed(1)}x</Text> */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.1 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray' }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.2 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.3 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.4 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.5 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.6 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.7 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.8 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 0.9 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                        <View style={{ width: 5, height: 15, borderRadius: 5, backgroundColor: volume.toFixed(1) >= 1.0 ? colorScheme === 'dark' ? 'white' : '#303030' : 'gray', marginStart: 5 }} />
                                    </View>
                                    <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => {
                                        volume >= 1.0 ?
                                            null
                                            :
                                            setVolume(volume + 0.1)
                                    }}>
                                        <MaterialCommIcons name="plus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ width: '80%', height: 90, backgroundColor: colorScheme == 'dark' ? '#181818' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Reading Voice Pitch</Text>
                                <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <TouchableOpacity style={{ marginStart: 20 }} onPress={() => {
                                        pitch <= 1.0 ?
                                            null
                                            :
                                            setPitch(pitch - 0.1)
                                    }}>
                                        <MaterialCommIcons name="minus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                    <Text style={{ fontWeight: 'bold', fontSize: 23 }}>{pitch.toFixed(1)}x</Text>
                                    <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => {
                                        pitch >= 3.0 ?
                                            null
                                            :
                                            setPitch(pitch + 0.1)
                                    }}>
                                        <MaterialCommIcons name="plus" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>}
                </View>
            </Modal>
            <Modal visible={wordModal} style={{ alignItems: 'center', justifyContent: 'center' }} onDismiss={() => { setWordModal(false) }}>
                <View style={{ width: 300, height: 400, borderRadius: 30, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 10, marginTop: 20, }} onPress={() => { setWordModal(false) }}>
                        <MaterialIcons name="close" size={30} color="#FFBC01" />
                        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#FFBC01', marginBottom: 2 }}> Extra Info</Text>
                    </TouchableOpacity>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 18 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginStart: 20 }}>Words Count</Text>
                        <View style={{ width: 100, height: 45, borderRadius: 30, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#202020', alignItems: 'center', justifyContent: 'center', marginEnd: 20 }}>
                            <Text>{wordCount}</Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 18 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginStart: 20 }}>Reading Time</Text>
                        <View style={{ width: 100, height: 45, borderRadius: 30, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#202020', alignItems: 'center', justifyContent: 'center', marginEnd: 20 }}>
                            <Text>{readingTime} min</Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 18 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginStart: 20 }}>Creation Date</Text>
                        <View style={{ width: 100, height: 45, borderRadius: 30, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#202020', alignItems: 'center', justifyContent: 'center', marginEnd: 20 }}>
                            <Text>{date}</Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 18 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginStart: 20 }}>Creation Time</Text>
                        <View style={{ width: 100, height: 45, borderRadius: 30, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#707070' : '#202020', alignItems: 'center', justifyContent: 'center', marginEnd: 20 }}>
                            <Text>{time}</Text>
                        </View>
                    </View>

                </View>
            </Modal>
        </SafeAreaView>
    )
}
//en-us-x-iol-local
//es-US-language
//en-IN-language
//en-us-x-tpc-local


export default ReadingMode