import React, { useEffect, useRef, useState } from "react";


import Voice from '@react-native-voice/voice'
import { Appearance, Dimensions, FlatList, ScrollView, TextInput, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Card, Menu, Modal, Text } from "react-native-paper";
import { Fader, FaderPosition } from "react-native-ui-lib";
import AnimatedLottieView from "lottie-react-native";
import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import * as Speech from 'expo-speech'

const screenWidth = Dimensions.get('window').width

const db = SQLite.openDatabase('CloudNotes.db')

const VoiceSearch = (props) => {

    const [recording, setRecording] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [result, setResult] = useState('')
    const [speaking, setSpeaking] = useState(false)
    const [data, setData] = useState(null)
    const [speakon, setSpeakOn] = useState(true)
    const listRef = useRef(null)
    const [speed, setSpeed] = useState(1)
    const [volume, setVolume] = useState(0.7)
    const [pitch, setPitch] = useState(1.0)
    const [voice, setVoice] = useState('')
    const [menuVoice, setMenuVoice] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [moreOptions, setMoreOptions] = useState(false)
    const [operationId, setOperationId] = useState(0)
    const [chat, setChat] = useState(false)

    const dataMore = [
        {
            id: 1,
            title: 'Help!',
            icon: 'help',
            more: "Provides more data about how to use CloudNotes and all of it's features."
        },
        {
            id: 2,
            title: 'Search in Browser.',
            icon: 'search-web',
            more: "Search for a spoken text in CloudNotes browser."
        },
        {
            id: 3,
            title: 'Search for a setting.',
            icon: 'cog-outline',
            more: "Search for a particular spoken setting in CloudNotes."
        },
        {
            id: 4,
            title: 'ToDo Records (Tasks).',
            icon: 'format-list-checks',
            more: "Shows records for your previously completed tasks."
        },
        {
            id: 5,
            title: 'Reminder Records.',
            icon: 'sticker-check-outline',
            more: "Shows records for your previously completed reminders."
        },
        {
            id: 6,
            title: 'Search something globally.',
            icon: 'layers-search-outline',
            more: "Search for a spoken text in whole CloudNotes storage globally."
        },
        {
            id: 7,
            title: 'Delete completed reminders.',
            icon: 'delete-clock',
            more: "Delete all reminders that are already completed."
        },
        {
            id: 8,
            title: 'Empty Trash.',
            icon: 'delete-off',
            more: "Fills a void in your bin or just Empties your Trash, LOL!"
        },
        {
            id: 9,
            title: 'Delete All Reminders.',
            icon: 'delete',
            more: "Delete all of your created reminders if any."
        },

    ]

    const OpenMoreOptions = () => {
        setMoreOptions(true)
    }

    Voice.onSpeechStart = () => setRecording(true)
    Voice.onSpeechEnd = () => setRecording(false)
    Voice.onSpeechError = () => setRecording(false)

    Voice.onSpeechResults = (reslt) => {
        if (operationId != 0) {
            if (operationId == 2) {
                InsertData(`Searching for ${reslt.value[0].trim()} in Browser.`, 'bot')
                setOperationId(0)
                setTimeout(() => {
                    props.navigation.navigate('Browser', {
                        page: 'GlobalSearch',
                        url: reslt.value[0].trim()
                    })

                }, 1500);
            } else {

            }
        } else {
            InsertData(reslt.value[0].trim(), 'me')
            let res = reslt.value[0].trim()
            setResult(res)

            if (res.includes('new note') || res.includes('notes') || res.includes('Note') || res.includes('open notes') || res.includes('Notes') || res.includes('note')) {
                InsertData('Creating a new note.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('CreateNote')
                }, 250);
            } else if (res.includes('exit') || res.includes("Exit") || res.includes('go back') || res.includes('home') || res.includes('homepage')) {
                InsertData('Going back to home screen', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Home')
                }, 1500);
            } else if (res.includes('directory') || res.includes('Directory') || res.includes('directly') || res.includes("Director") || res.includes("director")) {

                InsertData('Opening your Cloud Notes Directory.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Directory')
                }, 1200);
            } else if (res.includes("Archive") || res.includes("archive")) {
                InsertData('Opening your Cloud Notes Archive.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('ArchivePage')
                }, 1200);
            }
            else if (res.includes("star") || res.includes("Star") || res.includes("Starred") || res.includes("starred")) {
                InsertData('Opening your Starred Notes.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('StarredNotes')
                }, 1200);
            }
            else if (res.includes("todo") || res.includes('to do') || res.includes("TODO") || res.includes("task") || res.includes("Task") || res.includes("tasks") || res.includes("Tasks")) {
                InsertData('Opening your ToDo List.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('ToDo')
                }, 1200);
            }
            else if (res.includes("reminder") || res.includes("Reminder") || res.includes("reminders") || res.includes("Reminders") || res.includes("remind") || res.includes("Remind")) {
                InsertData('Opening your Reminders.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Reminders')
                }, 1200);
            }
            else if (res.includes("theme") || res.includes("Theme") || res.includes("themes") || res.includes("Themes") || res.includes("mood") || res.includes("Mood") || res.includes("Moodify") || res.includes("Moodify") || res.includes("mood data") || res.includes("Mood Data") || res.includes("modify") || res.includes("Modify")) {
                InsertData('Opening Cloud Notes Moodify to Change Themes.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Moodify')
                }, 1500);
            }
            else if (res.includes("marketplace") || res.includes("Marketplace") || res.includes("Market") || res.includes("market") || res.includes("extensions") || res.includes("extension") || res.includes("Extension") || res.includes("package") || res.includes("Package") || res.includes("plugin") || res.includes("Plugin") || res.includes("extras") || res.includes("Extras")) {
                InsertData('Opening Cloud Notes Marketplace of extensions.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Marketplace')
                }, 1200);
            }
            else if (res.includes("trash") || res.includes("Trash") || res.includes("recycle") || res.includes("bin") || res.includes("deleted") || res.includes("Recycle") || res.includes("Bin")) {
                InsertData('Opening Recycle bin.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('TrashPage')
                }, 1200);
            }
            else if (res.includes("bookmark") || res.includes("bukmark") || res.includes("Bookmark")) {
                InsertData('Opening Cloud Notes browser Bookmarks.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('BookmarkAndHistory', {
                        page: 'Bookmark'
                    })
                }, 1200);
            }
            else if (res.includes("browser history")) {
                InsertData('Opening Cloud Notes browser History.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('BookmarkAndHistory', {
                        page: 'History'
                    })
                }, 1200);
            }
            else if (res.includes("folder") || res.includes("Folder")) {
                InsertData('Opening Cloud Notes Folders.', 'bot')
                setTimeout(() => {
                    props.navigation.navigate('Folder')
                }, 1200);
            }
            else if (res.includes("camera") || res.includes("Camera") || res.includes("scan") || res.includes("Scan")) {
                InsertData('Opening camera to scan documents.', 'bot')
                props.navigation.navigate('CreateNote', {
                    page: 'HomeCamera'
                })
            }
            else if (res.includes('hello') || res.includes('how are you') || res.includes("Hello") || res.includes('How are you')) {
                if (auth().currentUser) {
                    let name = auth().currentUser.displayName
                    InsertData(`Hello ${name}, welcome to CloudNotes. Start by saying 'Create a new Note' or say 'Open Directory' to get started with all the features CloudNotes provides.\n\nThis conversation is saved so if you miss any information you like to check again you can just open this page again. To delete this conversation simply press Delete button on top right of screen.\n\nFor more information and to open helping menu say 'Help'.`, 'bot')
                } else {
                    InsertData("Hello there, welcome to CloudNotes. Start by saying 'Create a new Note' or say 'Open Directory' to get started with all the features CloudNotes provides.\n\nIt seems that you're not signed in CloudNotes. To experience everything CloudNotes offers sign in from home screen or Directory. Some features may not work until you sign in such as your Profile, Cloud data sync, etc.\n\nThis conversation is saved so if you miss any information you like to check again you can just open this page again. To delete this conversation simply press Delete button on top right of screen.\n\nFor more information and to open helping menu say 'Help'.", 'bot')
                }
            }
            else {
                InsertData('No data found for this command.', 'bot')
            }
        }

    }

    const StopSpeech = () => {
        Speech.stop().then(() => {
            setSpeaking(false)
        })
    }




    const SpeakText = (text) => {
        Speech.speak(text, {
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
            voice: voice ? voice : ''
        })
    }

    const SetOperation = (id) => {
        StopRecording()
        if (id == 1) {
            InsertData('Help', 'me')
            InsertData("Welcome to CloudNotes, here you will get most of the information regarding using this application and features it offers."
                + "\n\nTo get Started, start by creating a note by pressing the Plus button on home page. You can also start by either installing an extension from marketplace for more features or open" +
                " your Directory to check more available options.\n\nTo delete a note from homepage, either swipe from right to left or simply just long press the note for more options. Swipe for more options is avilable everywhere in CloudNotes.\n\nCreate a reminder or ToDo task and then set if you want to record your completed reminders or tasks everytime."
                + " CloudNotes also has an integrated browser, so if you want to use the browser simply access it from anywhere in CloudNotes.\n\nIf you are stuck at any point in CloudNotes, create a quick query in settings page of this application or from browser by starting a chat with our AI or by choosing 'Create a new query' in settings."
                + " You can provide suggestions for improvement and request help from the developer from there.\n\nThanks for using CloudNotes, have a nice day!", 'bot')
            GetData()
        }
        if (id == 2) {
            InsertData('Search in browser...', 'me')
            GetData()
            setOperationId(id)
            StartRecording()
        }
        setMoreOptions(false)
    }


    const InsertData = (title, sentBy) => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO voicesearch (title, sentBy) values (?,?)", [title, sentBy],
                (sql, rs) => {
                    GetData()
                    if (sentBy == 'bot') {
                        SpeakText(title)
                    }

                }, error => { })
        })
    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS voicesearch (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(5000), sentBy VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM voicesearch", [],
                        (sql, rs) => {
                            let result = []
                            if (rs.rows.length > 0) {
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let title = rs.rows._array[i].title
                                    let sentBy = rs.rows._array[i].sentBy

                                    result.push({ id: id, title: title, sentBy: sentBy })
                                }
                                setData(result)
                                listRef.current.scrollToEnd({ animated: true })
                            } else {
                                setData(null)
                            }
                        }, error => { })
                }, error => {
                })
        })
    }

    const StartRecording = async () => {
        try {
            Speech.stop().then(() => {
                setSpeaking(false)
            })
            await Voice.start('en-US')
        } catch (err) {
            setRecording(false)
        }
    }


    const DeleteSearchData = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM voicesearch", [],
                (sql, rs) => {
                    GetData()
                    setResult('')
                }, error => { })
        })
    }

    const isFocused = useIsFocused()



    useEffect(() => {
        GetData()
    }, [isFocused, props])

    useEffect(() => {
        setTimeout(() => {
            if (listRef.current) {
                listRef.current.scrollToEnd({ animated: true })
            }
        }, 1000);
    }, [listRef])

    useEffect(() => {
        setRecording(false)
        Voice.stop().then(() => {
            Voice.destroy()
        })
    }, [])

    const StopRecording = async () => {
        try {
            Speech.stop().then(() => {
                setSpeaking(false)
            })
            await Voice.stop()
        } catch (err) {
            setRecording(false)
        }
    }

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    return (
        <View style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ margin: 20 }} activeOpacity={0.6}
                    onPress={() => {
                        props.navigation.goBack()
                    }}>
                    <MaterialIcons name="close" size={30} color="#FFBC01" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <TouchableOpacity onPress={() => {
                        if (speaking) {
                            Speech.stop().then(() => {
                                setSpeaking(false)
                            })
                        }
                    }} style={{ marginEnd: 10 }}>
                        <MaterialCommIcons name={speaking ? 'pause' : 'volume-high'} size={27} color="#FFBC01" />
                    </TouchableOpacity>

                    {data ?
                        <TouchableOpacity style={{ marginStart: 20, marginTop: 20, marginBottom: 20, marginEnd: 10 }} activeOpacity={0.6}
                            onPress={() => {
                                DeleteSearchData()
                                StopSpeech()
                            }}>
                            <MaterialCommIcons name="trash-can-outline" size={27} color="#FFBC01" />
                        </TouchableOpacity>
                        :
                        null}
                    <TouchableOpacity style={{ margin: 20 }} activeOpacity={0.6}
                        onPress={() => {
                            setModalVisible(true)
                        }}>
                        <MaterialCommIcons name="cog-outline" size={27} color="#FFBC01" />
                    </TouchableOpacity>
                </View>
            </View>

            {data ?
                <FlatList data={data} scrollEnabled={true} key={item => item.id} contentContainerStyle={{ marginBottom: 300 }}
                    style={{ marginTop: 30, width: screenWidth }} showsVerticalScrollIndicator={false} ref={listRef}
                    renderItem={(item) => {
                        return (
                            <View>
                                {item.item.sentBy == 'me' ?
                                    <View style={{ width: screenWidth, padding: 15, alignItems: 'flex-end' }}>
                                        <View style={{ borderRadius: 100, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', alignItems: 'center', justifyContent: 'center', padding: 15, maxWidth: screenWidth - 100 }}>
                                            <Text style={{ textAlign: 'left', fontSize: 16 }}>
                                                {item.item.title}
                                            </Text>
                                        </View>
                                    </View>
                                    :
                                    <View style={{ width: screenWidth, alignItems: 'flex-start', padding: 15, alignSelf: 'center', justifyContent: 'center' }}>
                                        <View style={{ borderRadius: 30, backgroundColor: colorScheme === 'dark' ? '#38393F' : '#DAE0FF', alignItems: 'center', justifyContent: 'center', padding: 20, maxWidth: screenWidth - 100 }}>
                                            <Text style={{ textAlign: 'left', fontSize: 19 }}>
                                                {item.item.title}
                                            </Text>
                                        </View>
                                    </View>}
                            </View>
                        )
                    }}
                />
                :
                <Text style={{ fontSize: 30, flex: 1, fontWeight: 'bold', alignSelf: 'flex-start', textAlign: 'left', paddingStart: 30, paddingEnd: 20, marginTop: 100, marginBottom: 200 }}>
                    {recording ? 'Listening...' : 'Try saying something...'}
                </Text>}

            <Fader position={FaderPosition.BOTTOM} size={300} tintColor={colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4'} />
            {chat ?
                <View style={{ alignItems: 'center',  alignItems: 'center' }}>
                    <View style={{ width: screenWidth,maxHeight:150, borderWidth: 0.5, alignItems: 'center', flexDirection: 'row' }}>
                        <TouchableOpacity onPress={()=>{setChat(!chat)}}>
                            <MaterialIcons name="keyboard-voice" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                        <TextInput placeholder="hello" style={{fontSize:20}}/>
                    </View>
                </View>
                :
                <View style={{ alignItems: 'center' }}>
                    <TouchableHighlight style={{
                        width: screenWidth - 60, height: 60, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10,
                        borderWidth: 1, borderColor: colorScheme === 'dark' ? 'gray' : 'lightgray'
                    }} onPress={() => { OpenMoreOptions() }}
                        underlayColor={colorScheme === 'dark' ? '#303030' : '#f4f4f4'}>
                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between', flex: 1, paddingHorizontal: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                                <View style={{ width: 35, height: 35, backgroundColor: '#FFBC01', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <MaterialCommIcons name="help" size={25} color="#fff" />
                                </View>
                                <Text style={{ marginStart: 15, fontWeight: 'bold', fontSize: 16, textAlign: 'center', width: 200 }}>Click here for more options.</Text>
                            </View>
                            <View>
                                <MaterialIcons name="arrow-forward-ios" size={23} color="#FFBC01" />
                            </View>
                        </View>
                    </TouchableHighlight>
                    <View style={{ flexDirection: 'row', width: screenWidth, justifyContent: 'space-around', marginVertical: 20, alignItems: 'center' }}>

                        <TouchableOpacity onPress={() => {
                            setChat(!chat)
                        }}>
                            <MaterialIcons name="keyboard" size={30} color="#FFBC01" />
                        </TouchableOpacity>
                        <TouchableHighlight style={{ width: 70, height: 70, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 100, alignItems: 'center', justifyContent: 'center', elevation: 5, alignSelf: 'center', marginEnd: 25 }}
                            onPress={() => {
                                if (recording) {
                                    StopRecording()
                                } else {
                                    StartRecording()
                                }
                            }} underlayColor={colorScheme === 'dark' ? '#303030' : '#dedede'}>
                            {recording ?

                                <AnimatedLottieView
                                    source={require('../assets/recording_anim.json')}
                                    autoPlay loop autoSize
                                />
                                :

                                <MaterialIcons name="keyboard-voice" size={35} color="#FFBC01" />
                            }
                        </TouchableHighlight>
                        <View></View>
                    </View>
                    <Modal onDismiss={() => { setModalVisible(false) }} dismissable dismissableBackButton visible={modalVisible}
                        style={{ width: screenWidth, alignItems: 'center', justifyContent: 'flex-end' }}>

                        <View style={{ backgroundColor: colorScheme === 'dark' ? '#202020' : '#F4F4F4', width: '100%', paddingVertical: 20, borderTopStartRadius: 20, borderTopEndRadius: 20 }}>

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
                            </View>

                        </View>
                    </Modal>
                </View>}

            <Modal style={{ alignItems: 'center', justifyContent: 'flex-end' }} visible={moreOptions} onDismiss={() => { setMoreOptions(false) }} dismissable dismissableBackButton>
                <View style={{ width: screenWidth, padding: 20, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, alignItems: "center", }}>
                    <Text style={{ alignSelf: 'flex-start', fontWeight: 'bold', fontSize: 20, marginBottom: 20 }}>
                        More Options
                    </Text>
                    <FlatList
                        data={dataMore}
                        key={item => item.id}
                        style={{ height: screenWidth + 100 }} showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                        renderItem={(item) => {
                            return (
                                <TouchableHighlight style={{ marginVertical: 10, width: screenWidth - 50, height: 85, backgroundColor: colorScheme === 'dark' ? '#202020' : '#F2F2F2', borderRadius: 10, borderWidth: 1, alignItems: 'center' }} onPress={() => {
                                    SetOperation(item.item.id)
                                }}
                                    underlayColor={colorScheme === 'dark' ? '#404040' : '#dedede'}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '95%', height: '100%' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 30, backgroundColor: '#FFBC01' }}>
                                                <MaterialCommIcons name={item.item.icon} size={25} color='white' />
                                            </View>
                                            <View style={{ alignItems: 'flex-start', width: '75%', marginStart: 15 }}>
                                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16 }} numberOfLines={1}>{item.item.title}</Text>
                                                <Text style={{}} numberOfLines={2}>{item.item.more}</Text>
                                            </View>
                                        </View>
                                        <MaterialIcons name="arrow-forward-ios" size={20} color="#FFBC01" />
                                    </View>
                                </TouchableHighlight>
                            )
                        }}
                    />
                </View>
            </Modal>
        </View>
    )
}

export default VoiceSearch