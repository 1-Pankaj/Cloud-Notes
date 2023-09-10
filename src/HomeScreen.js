import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Appearance, Dimensions, FlatList,
    RefreshControl, ScrollView, TextInput, ToastAndroid,
    TouchableOpacity, View, Image, BackHandler, TouchableHighlight
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, Card, Checkbox, Dialog, Divider, FAB, Menu, Modal, Portal, Snackbar, Text, Tooltip } from "react-native-paper";
import * as SQLite from 'expo-sqlite'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from "expo-font";
import * as Speech from 'expo-speech'

import Voice from '@react-native-voice/voice'
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialComIcon from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import AnimatedLottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Drawer, ExpandableSection, Fader, GridList, StackAggregator } from "react-native-ui-lib";


const screenWidth = Dimensions.get("screen").width

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")


const HomeScreen = (props) => {


    GoogleSignin.configure({
        webClientId: '29670230722-7i4utp5aqudiuklhp7rfgri5530sq02h.apps.googleusercontent.com',
    });


    const SignInWithGoogle = async () => {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
        const { idToken } = await GoogleSignin.signIn()
        const googleCredential = auth.GoogleAuthProvider.credential(idToken)

        const userSignIn = auth().signInWithCredential(googleCredential)
        userSignIn.then((user) => {
            ToastAndroid.show('Signed in as ' + user.user.displayName, ToastAndroid.SHORT)
        }).catch((error) => {
        })
    }




    const [refreshing, setRefreshing] = useState(false)
    const [searchText, setSearchText] = useState("")
    const searchRef = useRef(null)
    const [menuVisible, setMenuVisible] = useState(false);
    const [grid, setGrid] = useState(false)
    const [longpress, setLongPress] = useState(false)
    const [modalLongPress, setModalLongPress] = useState(false)
    const [longPressId, setLongPressId] = useState('')
    const [pinnedData, setPinnedData] = useState(false)
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();
    const [banner, setBanner] = useState(false)
    const [expandedSearch, setExpandedSearch] = useState(false)
    const [archiveEnabled, setArchiveEnabled] = useState(false)
    const [gridlistEnabled, setGridlistEnabled] = useState(false)
    const [moodifyEnabled, setMoodifyEnabled] = useState(false)
    const [notebackgroundEnabled, setNotebackgroundEnabled] = useState(false)
    const [readingmodeEnabled, setReadingmodeEnabled] = useState(false)
    const [reminderEnabled, setReminderEnabled] = useState(false)
    const [starredEnabled, setStarredEnabled] = useState(false)
    const [todoEnabled, setTodoEnabled] = useState(false)
    const [todayData, setTodayData] = useState(null)
    const [previousData, setPreviousData] = useState(null)
    const [noteCount, setNoteCount] = useState(0)
    const [menuSort, setMenuSort] = useState(false)
    const [sortFun, setSortFun] = useState('id')
    const [ascDesc, setAscDesc] = useState('DESC')
    const [permanentDeleteId, setPermanentDeleteId] = useState('')
    const [permanentDeleteDialog, setPermanentDeleteDialog] = useState(false)
    const [reminderData, setReminderData] = useState(null)
    const [recording, setRecording] = useState(false)
    const [results, setResults] = useState([])
    const [resultsText, setResultsText] = useState('')
    const [expandExtra, setExpandExtra] = useState(false)
    const [recordingModal, setRecordingModal] = useState(false)
    const [snackbarTrash, setSnackbarTrash] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [snackbarArchive, setSnackbarArchive] = useState(false)
    const [lastTrashedid, setLastTrashedId] = useState('')
    const [lastArchiveId, setLastArchiveId] = useState('')

    const openMenu = () => setMenuVisible(true);

    const closeMenu = () => setMenuVisible(false);
    const [state, setState] = useState({ open: false });

    const onStateChange = ({ open }) => setState({ open });
    const [fabVisible, setFabVisible] = useState(false)

    const { open } = state;

    const isFocused = useIsFocused()

    const [fabButton, setFabButton] = useState(null)


    const StartStopRecording = async () => {
        if (recording === true) {
            await Voice.stop().then(() => {
                Voice.destroy()
            })
            setRecording(false)
        } else {
            await Voice.start();
            setRecording(true)
        }
    }

    const onSpeechResults = async (res) => {
        setRecording(false)

        if (res.value[0]) {
            let result = res.value[0]
            if (result.includes('new note' || 'note' || 'Note' || 'notes')) {
                props.navigation.navigate('CreateNote')
                setFabVisible(false)
                setRecordingModal(false)
                await Voice.stop().then(() => {
                    Voice.destroy()
                })
            }
        }
        await Voice.stop().then(() => {
            Voice.destroy()
        })
    }
    const onSpeechEnd = async (res) => {
        setRecording(false)
        await Voice.stop().then(() => {
            Voice.destroy()
        })
    }

    const onSpeechError = async (error) => {
        setRecording(false)
        await Voice.stop().then(() => {
            Voice.destroy()
        })
    }

    const onPartialResults = async (res) => {
        setRecording(false)
        setResults(res.value)
        if (res.value[0]) {
            let result = res.value[0]
            if (result.includes('new note' || 'note' || 'Note' || 'notes')) {
                props.navigation.navigate('CreateNote')
                setFabVisible(false)
                setRecordingModal(false)
                await Voice.stop().then(() => {
                    Voice.destroy()
                })
            }
        }
        await Voice.stop().then(() => {
            Voice.destroy()
        })
    }






    useEffect(() => {

        Voice.onSpeechError = onSpeechError
        Voice.onSpeechResults = onSpeechResults
        Voice.onSpeechEnd = onSpeechEnd
        Voice.onSpeechPartialResults = onPartialResults

    }, [])

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const [data, setData] = useState(null)
    const [searchData, setSearchData] = useState(null)
    const [selectionData, setSelectionData] = useState(null)
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectAll, setSelectAll] = useState(false)

    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql
                ("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)",
                    [],
                    (sql, rs) => {
                    },
                    error => {
                    })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS archived (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS starredsplash (firsttime Boolean)", [],
                (sql, rs) => {
                }, error => {
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS pinnednote(id INTEGER PRIMARY KEY AUTOINCREMENT, noteid VARCHAR(20), title VARCHAR(20), note VARCHAR(20))", [],
                (sql, rs) => {
                }, error => {
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS selectedNotes(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(5000) NOT NULL, noteid VARCHAR(20) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, checked Boolean)", [],
                (sql, rs) => {
                }, error => {
                })
        })
    }

    const CheckFirstTimeStarred = () => {
        setFabVisible(false)
        db.transaction((tx) => {
            tx.executeSql("SELECT firsttime from starredsplash", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {
                        props.navigation.navigate('StarredNotesSplash')
                    } else {
                        props.navigation.navigate('StarredNotes')
                    }
                }, error => {
                })
        })
    }

    const PinNote = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM notes WHERE id = (?)", [id],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let title = rs.rows._array[0].title
                        let note = rs.rows._array[0].note
                        sql.executeSql("SELECT * FROM pinnednote WHERE title = (?) and note = (?)", [title, note],
                            (sql, rs) => {
                                if (rs.rows.length > 0) {
                                    ToastAndroid.show("Note is already Pinned", ToastAndroid.SHORT)
                                } else {
                                    sql.executeSql("INSERT INTO pinnednote (noteid, title, note) values (?,?,?)", [id, title, note],
                                        (sql, rs) => {
                                            ToastAndroid.show("Pinned Note", ToastAndroid.SHORT)
                                            SelectData()
                                        }, error => {
                                        })
                                }
                            }, error => {
                            })
                    } else {
                        setPinnedData(null)
                    }
                }, error => {
                })
        })
    }



    const SelectData = () => {
        GetRemiders()
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes ORDER BY ${sortFun} ${ascDesc}`, [],
                (sql, rs) => {
                    let results = []
                    let length = rs.rows.length
                    setNoteCount(length)
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                        }
                        setData(results)
                        setRefreshing(false)
                    } else {
                        setData(null)
                    }
                    //selectedNotes (id,title,note,noteid,date,time,checked)
                },
                error => {
                    setRefreshing(false)
                })
        })

        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let selected = []
                        let rowLength = rs.rows.length
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let noteid = rs.rows._array[i].noteid
                            let checked = rs.rows._array[i].checked

                            selected.push({ id: id, title: title, note: note, date: date, time: time, noteid: noteid, checked: checked })
                        }

                        setSelectionData(selected)

                        sql.executeSql("SELECT * FROM selectedNotes WHERE checked = true", [],
                            (sql, rs) => {
                                if (rs.rows.length == rowLength) {
                                    setSelectAll(true)
                                } else {
                                    setSelectAll(false)
                                }
                            }, error => {
                            })
                    } else {
                        setSelectionData(null)
                    }
                }, error => {
                })
        })


        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes WHERE date = (?) order by id ${ascDesc}`, [new Date().toLocaleDateString()],
                (sql, rs) => {
                    let results = []
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                        }
                        setTodayData(results)
                        setRefreshing(false)
                    } else {
                        setTodayData(null)
                    }
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes WHERE date != (?) order by id ${ascDesc}`, [new Date().toLocaleDateString()],
                (sql, rs) => {
                    let results = []
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                        }
                        setPreviousData(results)
                        setRefreshing(false)
                    } else {
                        setPreviousData(null)
                    }
                }, error => {
                })
        })


        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM pinnednote ORDER BY id DESC", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let noteid = rs.rows._array[i].noteid
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note

                            results.push({ id: id, noteid: noteid, title: title, note: note })
                        }
                        setPinnedData(results)
                    } else {
                        setPinnedData(null)
                    }
                }, error => {
                })
        })


    }

    const SelectedNotesDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM notes ORDER BY id DESC", [],
                (sql, rs) => {
                    let selection = []
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time

                            sql.executeSql("DELETE FROM selectedNotes", [],
                                (sql, rs) => {
                                    sql.executeSql("INSERT INTO selectedNotes(title,note,noteid,date,time,checked) values (?,?,?,?,?,?)", [title, note, id, date, time, false],
                                        (sql, rs) => {
                                            SelectData()
                                        }, error => {
                                        })
                                }, error => {
                                })
                        }
                    }
                }, error => {
                })
        })
    }


    const DeleteFromTable = (id) => {
        db.transaction(tx => {
            tx.executeSql("SELECT deletebtn FROM splash", [],
                (sql, rs) => {
                    if (rs.rows._array[0].deletebtn == 'false') {
                        setFabVisible(false)
                        props.navigation.navigate('DeleteSplash')
                        setTodayData(null)
                        setPreviousData(null)
                        SelectData()
                    }
                    else {
                        sql.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                            (sql, rs) => {
                                sql.executeSql("SELECT * FROM notes where id = (?)", [id],
                                    (sql, rs) => {
                                        if (rs.rows.length == 0) {

                                        } else {
                                            let title = rs.rows._array[0].title
                                            let note = rs.rows._array[0].note
                                            let date = rs.rows._array[0].date
                                            let time = rs.rows._array[0].time
                                            let pageColor = rs.rows._array[0].pageColor
                                            let fontColor = rs.rows._array[0].fontColor
                                            let fontStyle = rs.rows._array[0].fontStyle
                                            let fontSize = rs.rows._array[0].fontSize

                                            sql.executeSql("INSERT INTO deletednotes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                (sql, rs) => {
                                                    sql.executeSql("DELETE FROM notes WHERE id = (?)", [id],
                                                        (sql, rs) => {
                                                            sql.executeSql("DELETE FROM pinnednote WHERE noteid = (?)", [id],
                                                                (sql, rs) => {
                                                                    setRefreshing(true)
                                                                    setPreviousData(null)
                                                                    setTodayData(null)
                                                                    SelectData()
                                                                    sql.executeSql("SELECT id FROM deletednotes WHERE title = (?) and note = (?) and date = (?) and time = (?)", [title, note, date, time],
                                                                        (sql, rs) => {
                                                                            if (rs.rows.length > 0) {
                                                                                setLastTrashedId(rs.rows._array[0].id)
                                                                                setSnackbarTrash(true)
                                                                                setSnackbarMessage('Note move to Trash')
                                                                            }
                                                                        }, error => { })
                                                                }, error => {
                                                                })
                                                        }, error => {
                                                        })
                                                }, error => {
                                                })
                                        }
                                    }, error => {
                                    })
                            }, error => {
                            })
                    }
                }, error => {
                })
        })
    }

    const StarNote = (id) => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS starrednotes(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM notes WHERE id = (?)", [id],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {

                            } else {
                                let title = rs.rows._array[0].title
                                let note = rs.rows._array[0].note
                                let date = rs.rows._array[0].date
                                let time = rs.rows._array[0].time
                                let pageColor = rs.rows._array[0].pageColor
                                let fontColor = rs.rows._array[0].fontColor
                                let fontStyle = rs.rows._array[0].fontStyle
                                let fontSize = rs.rows._array[0].fontSize



                                sql.executeSql('SELECT * FROM starrednotes WHERE title = (?) and note = (?)', [title, note],
                                    (sql, rs) => {
                                        if (rs.rows.length == 0) {
                                            sql.executeSql("INSERT INTO starrednotes(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                (sql, rs) => {
                                                    ToastAndroid.show(`Note ${title} Starred!`, ToastAndroid.SHORT)
                                                }, error => {
                                                })
                                        } else {
                                            ToastAndroid.show(title + " note is already Starred", ToastAndroid.SHORT)
                                        }
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const OpenLongPressModal = (id) => {
        setLongPressId(id)
        setModalLongPress(true)
    }


    const FinallyDelete = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM notes WHERE id = (?)", [permanentDeleteId],
                (sql, rs) => {
                    setPermanentDeleteDialog(false)
                    setPermanentDeleteId('')
                    SelectData()
                    ToastAndroid.show('Deleted', ToastAndroid.SHORT)
                }, error => {
                })
        })
    }


    const RestoreLastArchived = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM archived WHERE id = (?)", [lastArchiveId],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let title = rs.rows._array[0].title
                        let note = rs.rows._array[0].note
                        let date = rs.rows._array[0].date
                        let time = rs.rows._array[0].time
                        let pageColor = rs.rows._array[0].pageColor
                        let fontColor = rs.rows._array[0].fontColor
                        let fontStyle = rs.rows._array[0].fontStyle
                        let fontSize = rs.rows._array[0].fontSize

                        sql.executeSql("INSERT INTO notes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                            (sql, rs) => {
                                setRefreshing(true)
                                SelectData()
                                setSnackbarArchive(false)
                                setSnackbarMessage('')
                                setLastArchiveId('')
                            }, error => { })
                    }
                }, error => { })
        })
    }

    const RestoreLastDeleted = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM deletednotes WHERE id = (?)", [lastTrashedid],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let title = rs.rows._array[0].title
                        let note = rs.rows._array[0].note
                        let date = rs.rows._array[0].date
                        let time = rs.rows._array[0].time
                        let pageColor = rs.rows._array[0].pageColor
                        let fontColor = rs.rows._array[0].fontColor
                        let fontStyle = rs.rows._array[0].fontStyle
                        let fontSize = rs.rows._array[0].fontSize

                        sql.executeSql("INSERT INTO notes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                            (sql, rs) => {
                                setRefreshing(true)
                                SelectData()
                                setSnackbarTrash(false)
                                setSnackbarMessage('')
                                setLastTrashedId('')
                            }, error => { })
                    }
                }, error => { })
        })
    }

    const ArchiveFirstTimeCheck = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT archivebtn FROM splash", [],
                (sql, rs) => {
                    if (rs.rows._array[0].archivebtn == 'false') {
                        setFabVisible(false)
                        props.navigation.navigate('ArchiveSplash')
                    }
                    else {
                        db.transaction((tx) => {
                            tx.executeSql("SELECT * FROM notes where id = (?)", [id],
                                (sql, rs) => {
                                    const title = rs.rows._array[0].title
                                    const note = rs.rows._array[0].note
                                    const date = rs.rows._array[0].date
                                    const time = rs.rows._array[0].time
                                    const pageColor = rs.rows._array[0].pageColor
                                    const fontColor = rs.rows._array[0].fontColor
                                    const fontStyle = rs.rows._array[0].fontStyle
                                    const fontSize = rs.rows._array[0].fontSize
                                    sql.executeSql("INSERT INTO archived (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                        (sql, rs) => {
                                            sql.executeSql("DELETE FROM notes where id = (?)", [id],
                                                (sql, rs) => {
                                                    SelectData()
                                                    sql.executeSql("DELETE FROM pinnednote WHERE noteid = (?)", [id],
                                                        (sql, rs) => {
                                                            sql.executeSql("SELECT id FROM archived WHERE title = (?) and note = (?) and date = (?) and time = (?)", [title, note, date, time],
                                                                (sql, rs) => {
                                                                    if (rs.rows.length > 0) {
                                                                        setLastArchiveId(rs.rows._array[0].id)
                                                                        setSnackbarArchive(true)
                                                                        setSnackbarMessage('Archived note successfully')
                                                                    }
                                                                }, error => { })
                                                            SelectData()
                                                        }, error => {
                                                        })

                                                },
                                                error => {
                                                })
                                        }, error => {
                                        })
                                }, error => {
                                })
                        })
                    }
                }, error => {
                })
        })
    }




    const SearchInDatabase = (prop) => {
        setSearchText(prop)
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes where title LIKE '%${prop}%' or note LIKE '%${prop}%'`, [],
                (sql, rs) => {

                    setSearchData([])
                    let results = []
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)

                            results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })

                        }
                        setSearchData(results)
                    } else {
                        setSearchData(null)
                    }

                },
                error => {
                })
        })

    }


    const CheckUncheck = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes WHERE noteid = (?)", [id],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let checked = rs.rows._array[0].checked
                        if (checked == true) {
                            sql.executeSql("UPDATE selectedNotes SET checked = false WHERE noteid = (?)", [id],
                                (sql, rs) => {
                                    SelectData()
                                }, error => {
                                })
                        } else {
                            sql.executeSql("UPDATE selectedNotes SET checked = true WHERE noteid = (?)", [id],
                                (sql, rs) => {
                                    SelectData()
                                }, error => {
                                })
                        }
                    }
                }, error => {
                })
        })
    }


    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })
    const CheckFirstTime = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT homepage FROM splash", [],
                (sql, rs) => {
                    if (rs.rows._array[0].homepage == 'false') {
                        setFabVisible(false)
                        props.navigation.navigate('HomeSplash')
                    }
                }, error => {
                })
        })
    }


    const CheckMoodifyFirstTime = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS moodifysplash(firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT firsttime FROM moodifysplash", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                props.navigation.navigate('Moodify')
                                setFabVisible(false)
                            } else {
                                props.navigation.navigate('MoodifySplash')
                                setFabVisible(false)
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }


    const CheckFirstTimeReminder = () => {

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS remindersplash (firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM remindersplash", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                setFabVisible(false)
                                props.navigation.navigate('ReminderSplash')
                            } else {
                                setFabVisible(false)
                                props.navigation.navigate('Reminders')
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const LongPressCheck = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS longpress (firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT id FROM notes", [],
                        (sql, rs) => {
                            if (rs.rows.length === 0) {

                            } else {
                                sql.executeSql("SELECT firsttime FROM longpress", [],
                                    (sql, rs) => {
                                        if (rs.rows.length == 0) {
                                            setLongPress(true)
                                            setBanner(true)
                                        }
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }
    const Marketplace = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS marketplacesplash(firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT firsttime FROM marketplacesplash", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                setFabVisible(false)
                                props.navigation.navigate('Marketplace')
                            } else {
                                setFabVisible(false)
                                props.navigation.navigate('MarketplaceSplash')
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const DismissLongPress = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO longpress (firsttime) values (false)", [],
                (sql, rs) => {
                    setLongPress(false)
                }, error => {
                })
        })
    }
    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    const UnpinNote = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM pinnednote WHERE id = (?)", [id],
                (sql, rs) => {
                    SelectData()
                    ToastAndroid.show("Unpinned Note", ToastAndroid.SHORT)
                }, error => {
                })
        })
    }


    const ReadingModeCheck = (id) => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS readingsplash(firsttime Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM readingsplash", [],
                        (sql, rs) => {
                            if (rs.rows.length === 0) {
                                setFabVisible(false)
                                props.navigation.navigate('ReadingModeSplash', {
                                    noteid: id
                                })
                            } else {
                                setFabVisible(false)
                                props.navigation.navigate('ReadingMode', {
                                    noteid: id
                                })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const MoveToFolder = (id) => {
        props.navigation.navigate('Folder', {
            id: id,
            folderName: 'Home',
            page: 'Home',
            extraName: ''
        })
        setFabVisible(false)
    }

    const PermanentDelete = (id) => {
        setPermanentDeleteId(id)
        setPermanentDeleteDialog(true)
    }



    const GetFeatures = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS features (todo Boolean, reminder Boolean, starred Boolean, moodify Boolean, notebackground Boolean, gridlist Boolean, archive Boolean, readingmode Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM features", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let results = []
                                let archive = rs.rows._array[0].archive
                                let gridlist = rs.rows._array[0].gridlist
                                let moodify = rs.rows._array[0].moodify
                                let notebackground = rs.rows._array[0].notebackground
                                let readingmode = rs.rows._array[0].readingmode
                                let reminder = rs.rows._array[0].reminder
                                let starred = rs.rows._array[0].starred
                                let todo = rs.rows._array[0].todo

                                setTodoEnabled(todo)
                                setArchiveEnabled(archive)
                                setGridlistEnabled(gridlist)
                                setMoodifyEnabled(moodify)
                                setNotebackgroundEnabled(notebackground)
                                setReadingmodeEnabled(readingmode)
                                setReminderEnabled(reminder)
                                setStarredEnabled(starred)

                                results.push({
                                    icon: 'close',
                                    onPress: () => setState({ open: false }),
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                })


                                results.push({
                                    icon: 'store',
                                    label: 'Marketplace',
                                    onPress: () => { Marketplace() },
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                })

                                results.push({
                                    icon: 'camera',
                                    label: 'Open Camera',
                                    onPress: () => {
                                        setFabVisible(false)
                                        props.navigation.navigate('CreateNote', {
                                            page: 'HomeCamera'
                                        })
                                    },
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                })

                                if (todo == 1) {
                                    results.push({
                                        icon: 'clipboard-list',
                                        label: 'TO-DO List',
                                        onPress: () => {
                                            setFabVisible(false)
                                            props.navigation.navigate('ToDo')
                                        },
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    })
                                }
                                if (starred == 1) {
                                    results.push({
                                        icon: 'star',
                                        label: 'Starred Notes',
                                        onPress: () => CheckFirstTimeStarred(),
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    })
                                }
                                if (reminder == 1) {
                                    results.push({
                                        icon: 'bell',
                                        label: 'Set Reminder',
                                        onPress: () => {
                                            CheckFirstTimeReminder()
                                        },
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    })
                                }
                                if (moodify == 1) {
                                    results.push({
                                        icon: 'emoticon-happy-outline',
                                        label: 'Moodify',
                                        onPress: () => { CheckMoodifyFirstTime() },
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    })
                                }

                                setFabButton(results)
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const SelectAllNotes = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT checked FROM selectedNotes", [],
                (sql, rs) => {
                    if (rs.rows._array[0].checked == true) {
                        sql.executeSql("UPDATE selectedNotes set checked = false", [],
                            (sql, rs) => {
                                SelectData()
                            }, error => {
                            })
                    } else {
                        sql.executeSql("UPDATE selectedNotes set checked = true", [],
                            (sql, rs) => {
                                SelectData()
                            }, error => {
                            })
                    }
                }, error => {
                })
        })
    }


    const HandleDeleteSelection = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes WHERE checked = true", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let noteid = rs.rows._array[i].noteid
                            // DeleteFromTable(noteid)

                            db.transaction((tx) => {
                                tx.executeSql("SELECT * FROM notes WHERE id = (?)", [noteid],
                                    (sql, rs) => {
                                        if (rs.rows.length > 0) {
                                            let title = rs.rows._array[0].title
                                            let note = rs.rows._array[0].note
                                            let date = rs.rows._array[0].date
                                            let time = rs.rows._array[0].time
                                            let pageColor = rs.rows._array[0].pageColor
                                            let fontColor = rs.rows._array[0].fontColor
                                            let fontStyle = rs.rows._array[0].fontStyle
                                            let fontSize = rs.rows._array[0].fontSize

                                            sql.executeSql("SELECT deletebtn FROM splash", [],
                                                (sql, rs) => {
                                                    sql.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                                                        (sql, rs) => {
                                                            sql.executeSql("INSERT INTO deletednotes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                                (sql, rs) => {
                                                                    sql.executeSql("DELETE FROM notes WHERE id = (?)", [noteid],
                                                                        (sql, rs) => {
                                                                            sql.executeSql("DELETE FROM pinnednote WHERE noteid = (?)", [noteid],
                                                                                (sql, rs) => {
                                                                                }, error => {
                                                                                })
                                                                        }, error => {
                                                                        })
                                                                }, error => {
                                                                })
                                                        }, error => {
                                                        })
                                                }, error => {
                                                })
                                        }
                                    }, error => {
                                    })
                            })
                        }
                        setSelectionData([])
                        SelectData()
                        setSelectionMode(false)
                        ToastAndroid.show("Moved to Trash", ToastAndroid.SHORT)
                    }
                }, error => {
                })
        })
    }
    const HandleArchiveSection = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes WHERE checked = true", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let noteid = rs.rows._array[i].noteid


                            sql.executeSql("SELECT * FROM notes where id = (?)", [noteid],
                                (sql, rs) => {
                                    const title = rs.rows._array[0].title
                                    const note = rs.rows._array[0].note
                                    const date = rs.rows._array[0].date
                                    const time = rs.rows._array[0].time
                                    const pageColor = rs.rows._array[0].pageColor
                                    const fontColor = rs.rows._array[0].fontColor
                                    const fontStyle = rs.rows._array[0].fontStyle
                                    const fontSize = rs.rows._array[0].fontSize
                                    sql.executeSql("INSERT INTO archived (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                        (sql, rs) => {
                                            sql.executeSql("DELETE FROM notes where id = (?)", [noteid],
                                                (sql, rs) => {
                                                    sql.executeSql("DELETE FROM pinnednote WHERE noteid = (?)", [noteid],
                                                        (sql, rs) => {

                                                        }, error => {
                                                        })

                                                },
                                                error => { })
                                        }, error => {
                                        })
                                }, error => {
                                })

                        }
                        setSelectionData([])
                        SelectData()
                        setSelectionMode(false)
                        ToastAndroid.show("Archived!", ToastAndroid.SHORT)
                    }
                }, error => {
                })
        })
    }
    const HandlePinSection = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes WHERE checked = true", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let noteid = rs.rows._array[i].noteid

                            sql.executeSql("SELECT * FROM notes WHERE id = (?)", [noteid],
                                (sql, rs) => {
                                    if (rs.rows.length > 0) {
                                        let title = rs.rows._array[0].title
                                        let note = rs.rows._array[0].note
                                        sql.executeSql("SELECT * FROM pinnednote WHERE title = (?) and note = (?)", [title, note],
                                            (sql, rs) => {
                                                if (rs.rows.length > 0) {
                                                    ToastAndroid.show("Already Pinned notes not pinned", ToastAndroid.SHORT)
                                                } else {
                                                    sql.executeSql("INSERT INTO pinnednote (noteid, title, note) values (?,?,?)", [noteid, title, note],
                                                        (sql, rs) => {
                                                        }, error => {
                                                        })
                                                }
                                            }, error => {
                                            })
                                    }
                                }, error => {
                                })
                        }

                        ToastAndroid.show("Pinned Selected Notes", ToastAndroid.SHORT)
                        setSelectionData(null)
                        setSelectionMode(false)
                        SelectData()
                    }
                }, error => {
                })
        })
    }
    const HandleStarSection = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotes WHERE checked = true", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let noteid = rs.rows._array[i].noteid

                            sql.executeSql("CREATE TABLE IF NOT EXISTS starrednotes(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                                (sql, rs) => {
                                    sql.executeSql("SELECT * FROM notes WHERE id = (?)", [noteid],
                                        (sql, rs) => {
                                            if (rs.rows.length == 0) {

                                            } else {
                                                let title = rs.rows._array[0].title
                                                let note = rs.rows._array[0].note
                                                let date = rs.rows._array[0].date
                                                let time = rs.rows._array[0].time
                                                let pageColor = rs.rows._array[0].pageColor
                                                let fontColor = rs.rows._array[0].fontColor
                                                let fontStyle = rs.rows._array[0].fontStyle
                                                let fontSize = rs.rows._array[0].fontSize



                                                sql.executeSql('SELECT * FROM starrednotes WHERE title = (?) and note = (?)', [title, note],
                                                    (sql, rs) => {
                                                        if (rs.rows.length == 0) {
                                                            sql.executeSql("INSERT INTO starrednotes(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                                (sql, rs) => {
                                                                }, error => {
                                                                })
                                                        } else {
                                                            ToastAndroid.show(title + " note is already Starred", ToastAndroid.SHORT)
                                                        }
                                                    }, error => {
                                                    })
                                            }
                                        }, error => {
                                        })
                                }, error => {
                                })
                        }
                        ToastAndroid.show("Selected notes added to starred notes", ToastAndroid.SHORT)
                        setSelectionData(null)
                        SelectData()
                        setSelectionMode(false)
                    }
                }, error => {
                })
        })
    }

    const DeleteReminder = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM reminder WHERE id = (?)", [id],
                (sql, rs) => {
                    GetRemiders()
                }, error => {
                })
        })
    }

    const GetRemiders = () => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM reminder', [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let hours = new Date().getHours().toString()
                        let minutes = new Date().getMinutes().toString().length < 2 ? '0' + new Date().getMinutes().toString() : new Date().getMinutes().toString()
                        let timeString = hours + ':' + minutes
                        let results = []

                        for (let i = 0; i < rs.rows.length; i++) {
                            if (rs.rows._array[i].time < timeString) {
                                results.push({ id: rs.rows._array[i].id, message: rs.rows._array[i].message, time: rs.rows._array[i].time, title: rs.rows._array[i].title })
                            }
                        }
                    } else {
                        setReminderData(null)
                    }
                }, error => {
                })
        })
    }


    useEffect(() => {
        CreateTable()
        LongPressCheck()
        SelectData()
        GetFeatures()
        CheckFirstTime()
        Speech.isSpeakingAsync().then((rs) => {
            if (rs) {
                Speech.stop()
            }
        })
        if (isFocused) {
            setFabVisible(true)
            SelectData()
            Speech.isSpeakingAsync().then((rs) => {
                if (rs) {
                    Speech.stop()
                }
            })
        }
    }, [isFocused, props, grid])



    function handleBackButtonClick() {
        if (selectionMode == true) {
            setSelectionData([])
            setSelectionMode(false)
            return true;
        } else {
            BackHandler.exitApp()
        }
    }


    useEffect(() => {
        SelectedNotesDatabase()
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [selectionMode])


    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        return subscriber;
    }, [])

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf"),
    })

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded || initializing)
        return null


    return (
        <SafeAreaView style={[Styles.container, { width: "100%", height: '100%' }]} onLayout={onLayoutRootView}>

            <View style={[Styles.container, { justifyContent: 'space-around' }]}>
                <View style={{
                    flexDirection: 'row', width: screenWidth, alignItems: 'center', padding: 15,
                    justifyContent: 'space-between'
                }}>
                    {selectionMode ?
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                            setSelectionMode(false)
                        }}>
                            <MaterialComIcon name="close" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                            setFabVisible(false)
                            props.navigation.navigate("Directory")
                        }}>
                            <MaterialComIcon name="arrow-back-ios" size={22} color="#FFBC01" />
                            <Text style={{
                                color: '#FFBC01', fontFamily: 'mulish',
                                fontSize: 18
                            }}>
                                Cloud Notes
                            </Text>
                        </TouchableOpacity>}

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        {
                            selectionMode ?
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => {
                                        HandleDeleteSelection()
                                    }} style={{ marginEnd: 25 }}>
                                        <MaterialComIcon name='delete-outline' size={25} color="#FFBC01" />
                                    </TouchableOpacity>
                                    {archiveEnabled ?
                                        <TouchableOpacity onPress={() => {
                                            HandleArchiveSection()
                                        }} style={{ marginEnd: 25 }}>
                                            <MaterialComIcon name='archive' size={25} color="#FFBC01" />
                                        </TouchableOpacity>
                                        :
                                        null}
                                    <TouchableOpacity onPress={() => {
                                        HandlePinSection()
                                    }} style={{ marginEnd: 25 }}>
                                        <MaterialComIcon name='push-pin' size={23} color="#FFBC01" />
                                    </TouchableOpacity>
                                    {starredEnabled ?
                                        <TouchableOpacity onPress={() => {
                                            HandleStarSection()
                                        }} style={{ marginEnd: 25 }}>
                                            <MaterialComIcon name='star-outline' size={25} color="#FFBC01" />
                                        </TouchableOpacity>
                                        :
                                        null}
                                </View>
                                :
                                <TouchableOpacity onPress={() => {
                                    setExpandedSearch(!expandedSearch)
                                    setSearchText('')
                                }} style={{ marginEnd: 25 }}>
                                    <MaterialComIcon name={expandedSearch ? "close" : "search"} size={25} color="#FFBC01" />
                                </TouchableOpacity>
                        }

                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}

                            anchor={<TouchableOpacity style={{ marginEnd: 5 }} onPress={() => { openMenu() }}>
                                <MaterialIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                            </TouchableOpacity>}>
                            {data && gridlistEnabled ?
                                <Menu.Item onPress={() => {
                                    closeMenu()
                                    setGrid(!grid)
                                    setRefreshing(true)
                                }} title={grid ? 'List View' : 'Grid View'} leadingIcon={grid ? 'format-list-checkbox' : 'view-grid'} theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                                :
                                null}
                            {data ?
                                <Menu.Item onPress={() => {
                                    closeMenu()
                                    setSelectionData([])
                                    SelectData()
                                    setSelectionMode(!selectionMode)
                                }} title={selectionMode ? 'Disable selection' : "Select notes"} leadingIcon="format-list-checks" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                                :
                                null}
                            <Menu.Item onPress={() => {
                                closeMenu()
                            }} title="Settings" leadingIcon="cog-outline" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                            <Divider />
                            {user ?
                                <Menu.Item onPress={() => {
                                    closeMenu()
                                }} title='Profile' leadingIcon="account-circle" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                                :
                                <Menu.Item onPress={() => {
                                    closeMenu()
                                    SignInWithGoogle()
                                }} title='Sign in' leadingIcon="account-circle" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />}
                            {user ?
                                <Menu.Item onPress={() => {
                                    closeMenu()
                                    auth().signOut()
                                    ToastAndroid.show("Logout successful", ToastAndroid.SHORT)
                                }} title='Logout' leadingIcon="logout" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                                :
                                null}
                        </Menu>

                    </View>
                </View>
                {/* <Banner
                    visible={false}
                    style={{width:screenWidth}}
                    actions={[
                        {
                            label: 'Fix it',
                            onPress: () => setVisible(false),
                        },
                        {
                            label: 'Learn more',
                            onPress: () => setVisible(false),
                        },
                    ]}
                    icon={({ size }) => (
                        <Image
                            source={{
                                uri: 'https://avatars3.githubusercontent.com/u/17571969?s=400&v=4',
                            }}
                            style={{
                                width: size,
                                height: size,
                            }}
                        />
                    )}>
                    There was a problem
                </Banner> */}
                <ExpandableSection
                    top={false}
                    expanded={expandedSearch}
                >
                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <TextInput placeholder="Search here" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                            ref={searchRef}
                            style={{
                                width: screenWidth - 60, paddingVertical: 6, backgroundColor: colorScheme === "dark" ? "#303030" : "lightgray", borderRadius: 10,
                                opacity: 0.7, paddingHorizontal: 10, color: colorScheme === "dark" ? "white" : "black", alignSelf: 'center', fontSize: 13,
                                fontFamily: 'mulish', marginTop: 10, marginBottom: 10
                            }}
                            selectTextOnFocus
                            cursorColor="#FFBC01"
                            multiline={false}
                            blurOnSubmit
                            value={searchText}
                            selectionColor="#FFBC01"
                            onChangeText={(text) => { SearchInDatabase(text) }}
                        />
                        {searchText ? <TouchableOpacity onPress={() => {
                            props.navigation.navigate('Browser', {
                                page: 'GlobalSearch',
                                url: searchText
                            })
                            setFabVisible(false)
                        }}>
                            <Ionicons name="globe-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity> : null}
                    </View>
                </ExpandableSection>
                {reminderData && !selectionMode && !searchText ?
                    <View style={{ width: screenWidth, alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ alignSelf: 'flex-start', marginStart: 15, marginTop: 20, fontSize: 25, marginBottom: 5, fontWeight: 'bold', marginEnd: 15 }}>Completed Reminders</Text>
                        <FlatList
                            data={reminderData}
                            key={item => item.id}
                            style={{ marginTop: 20, width: screenWidth, marginEnd: 20 }}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', }}
                            horizontal
                            renderItem={(item) => {
                                return (
                                    <View style={{ width: 290, height: 140, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, marginStart: 20 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 10 }}>
                                            <View style={{ alignItems: 'flex-start', marginStart: 10, maxWidth: 200 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Reminder set for</Text>
                                                <Text numberOfLines={2} style={{ fontSize: 17, marginTop: 10 }}>{item.item.title.length > 20 ? item.item.title.trim().slice(0, 20) + '...' : item.item.title.trim().slice(0, 20)}</Text>
                                                <Text numberOfLines={2} style={{ fontSize: 12 }}>{item.item.message.length > 40 ? item.item.message.trim().slice(0, 40) + '...' : item.item.message.trim().slice(0, 40)}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end', marginEnd: 10 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Set For</Text>
                                                <Text style={{ fontFamily: 'mulish', alignSelf: 'center' }}>{item.item.time}</Text>
                                            </View>
                                        </View>
                                        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', flex: 1, alignItems: 'flex-end', marginBottom: 10, marginEnd: 10 }}>
                                            <TouchableOpacity style={{
                                                width: 65, height: 30, borderRadius: 30, borderWidth: 1, borderColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                                                alignSelf: 'flex-end',
                                            }} onPress={() => { DeleteReminder(item.item.id) }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#FFBC01' }}>Dismiss</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )
                            }}

                        />
                    </View>
                    :
                    null}
                {pinnedData && !selectionMode ?
                    <View style={{ width: screenWidth, alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ alignSelf: 'flex-start', marginStart: 15, marginTop: 20, fontSize: 25, marginBottom: 5, fontWeight: 'bold' }}>Pinned Notes</Text>
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center' }}>
                            <FlatList data={pinnedData} style={{ alignSelf: 'flex-start', marginStart: 10, marginTop: 10 }}
                                horizontal scrollEnabled={true} showsHorizontalScrollIndicator={false}
                                keyExtractor={item => item.id}
                                renderItem={item => {
                                    return (
                                        <TouchableOpacity style={{
                                            width: 170, height: 60, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, marginStart: 0,
                                            marginEnd: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                                        }}
                                            activeOpacity={0.6} onPress={() => {
                                                setFabVisible(false)
                                                props.navigation.navigate("CreateNote", {
                                                    id: item.item.noteid,
                                                    page: 'Home'
                                                })
                                            }}>
                                            <View style={{ marginStart: 10 }}>
                                                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{item.item.title.trim().slice(0, 10)}</Text>
                                                <Text style={{ fontSize: 11 }}>{item.item.note.trim().slice(0, 16)}</Text>
                                            </View>
                                            <TouchableOpacity style={{ marginEnd: 10, }} hitSlop={10} onPress={() => { UnpinNote(item.item.id) }}>
                                                <MaterialIcons name="pin-off" size={16} color="#FFBC01" />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            <Fader visible position={Fader.position.END} tintColor={colorScheme === 'dark' ? "#1c1c1c" : '#f4f4f4'} size={50} />
                        </View>
                    </View>
                    :
                    null}
                {
                    data ?
                        grid ?

                            <View style={{ width: screenWidth, marginTop: 10, flex: 1 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 25, marginTop: 15, fontSize: 25, fontWeight: 'bold' }}>All Notes</Text>
                                <GridList data={data}
                                    key={item => item.id}
                                    numColumns={2} scrollEnabled={true} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                                        setRefreshing(true)
                                        SelectData()
                                        GetRemiders()
                                    }} />}
                                    bounces centerContent style={{ width: screenWidth, marginStart: 5, }}
                                    alwaysBounceHorizontal alwaysBounceVertical showsVerticalScrollIndicator={false}
                                    contentContainerStyle={{ alignItems: 'center', width: screenWidth, justifyContent: 'center' }}
                                    renderItem={(item) => {
                                        return (
                                            <View style={{ width: '50%', alignItems: 'center', alignSelf: 'center', justifyContent: 'center' }}>

                                                <TouchableOpacity style={{ height: 150, borderRadius: 15, borderWidth: 2, borderColor: 'gray' }}
                                                    activeOpacity={0.6} onPress={() => {
                                                        setFabVisible(false)
                                                        props.navigation.navigate("CreateNote", {
                                                            id: item.item.id,
                                                            page: 'Home'
                                                        })
                                                    }}>

                                                    <View style={{ flexDirection: 'row', width: '100%', height: '100%' }}>
                                                        <View style={{ maxWidth: 100, width: 100 }}>
                                                            <Text style={{
                                                                margin: 10, fontSize: item.item.fontStyle == 'default' ? 23 : 30, fontFamily: item.item.fontStyle == 'default' ? null : item.item.fontStyle,
                                                                fontWeight: item.item.fontStyle == 'default' ? 'bold' : 'normal', color: item.item.pageColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : '#101010',
                                                                marginTop: item.item.fontStyle === 'default' ? 10 : -1
                                                            }} numberOfLines={2}>{item.item.title.slice(0, 7).trim()}</Text>
                                                            <Text numberOfLines={2} style={{
                                                                marginStart: 10, fontSize: item.item.fontStyle == 'default' ? 14 : 17, fontFamily: item.item.fontStyle == 'default' ? null : item.item.fontStyle,
                                                                color: item.item.pageColor === 'default' ? colorScheme === 'dark' ? 'white' : '#101010' : '#101010', marginTop: item.item.fontStyle === 'default' ? 0 : -6
                                                            }}>
                                                                {item.item.note.slice(0, 15).trim() + "\n" + item.item.note.slice(15, 20).trim()}</Text>
                                                        </View>
                                                        <View style={{ marginEnd: 10, marginStart: -10, marginTop: 20, marginBottom: 10, alignSelf: 'flex-end', flexDirection: 'row' }}>
                                                            <View style={{ alignItems: 'center', marginStart: -10 }}>
                                                                <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{item.item.date.length === 9 ? item.item.date.slice(0, 4) : item.item.date.slice(0, 5)}</Text>
                                                                <Text style={{ fontFamily: 'mulish', fontSize: 10, marginStart: -15 }}>{item.item.time.length === 10 ? item.item.time.slice(0, 4) + item.item.time.slice(7, 10) : item.item.time.slice(0, 5) + item.item.time.slice(8, 11)}</Text>
                                                            </View>
                                                            <MaterialComIcon name="arrow-forward-ios" size={20} color="#FFBC01" style={{ alignSelf: 'center', marginStart: 10 }} />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>

                                            </View>
                                        )
                                    }}>

                                </GridList>
                            </View>
                            :
                            <View style={{ marginTop: 10, flex: 1 }}>


                                {data ?
                                    <View>

                                        <ScrollView style={{ width: screenWidth, marginBottom: 20, marginTop: 10 }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 10 }} bounces refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                                            setRefreshing(true)
                                            SelectData()
                                            GetRemiders()
                                        }} />} showsVerticalScrollIndicator={false}>
                                            {!searchText && todayData && sortFun == 'id' && !selectionMode ?
                                                <View style={{ width: screenWidth, marginTop: 10 }}>
                                                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ marginStart: 15, fontSize: 25, fontWeight: 'bold' }}>Today</Text>
                                                        <Menu visible={menuSort} onDismiss={() => { setMenuSort(false) }} anchor={
                                                            <TouchableOpacity style={{ marginEnd: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => { setMenuSort(true) }}>
                                                                <Text style={{ fontFamily: 'mulish', color: '#FFBC01', fontSize: 13 }}>Sort By </Text>
                                                                <MaterialIcons name="sort" size={20} color="#FFBC01" />
                                                            </TouchableOpacity>}>
                                                            <Menu.Item title="Title" trailingIcon={sortFun == 'title' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'title' ? ascDesc == 'DESC' ? 'sort-alphabetical-descending-variant' : 'sort-alphabetical-ascending-variant' : 'sort-alphabetical-variant'} onPress={() => {
                                                                setSortFun('title')
                                                                ascDesc == 'DESC' ?
                                                                    setAscDesc('ASC')
                                                                    :
                                                                    setAscDesc('DESC')
                                                                SelectData()
                                                                setRefreshing(true)
                                                                setMenuSort(false)
                                                            }} />
                                                            <Menu.Item title="Date" trailingIcon={sortFun == 'date' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'date' ? ascDesc == 'DESC' ? 'sort-calendar-descending' : 'sort-calendar-ascending' : 'sort-calendar-ascending'} onPress={() => {
                                                                setSortFun('date')
                                                                ascDesc == 'DESC' ?
                                                                    setAscDesc('ASC')
                                                                    :
                                                                    setAscDesc('DESC')
                                                                SelectData()
                                                                setRefreshing(true)
                                                                setMenuSort(false)
                                                            }} />
                                                            <Menu.Item trailingIcon={sortFun == 'id' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} title="Last Added" leadingIcon={sortFun == 'id' ? ascDesc == 'DESC' ? 'sort-descending' : 'sort-ascending' : 'sort-reverse-variant'}
                                                                onPress={() => {
                                                                    setSortFun('id')
                                                                    ascDesc == 'DESC' ?
                                                                        setAscDesc('ASC')
                                                                        :
                                                                        setAscDesc('DESC')
                                                                    SelectData()
                                                                    setRefreshing(true)
                                                                    setMenuSort(false)
                                                                }} />
                                                        </Menu>
                                                    </View>
                                                    <StackAggregator backgroundColor="transparent" contentContainerStyle={{ alignItems: 'center', overflow: 'visible', height: 200, marginTop: -10 }} itemBorderRadius={10}
                                                        buttonProps={{ color: '#FFBC01' }} containerStyle={{ overflow: 'visible', marginTop: 20 }} marginV={false}
                                                        collapsed={todayData.length > 5 ? true : false} spread={true} animated width={screenWidth} style={{ width: screenWidth, marginTop: 20 }}>
                                                        {todayData.map((item, index) => {
                                                            return (
                                                                <Drawer key={index}
                                                                    rightItems={[{ icon: require('../assets/delete.png'), text: 'Trash', width: 80, background: 'red', onPress: () => { DeleteFromTable(item.id) } }, archiveEnabled ? { icon: require('../assets/archive.png'), text: 'Archive', width: 80, background: '#3BBC1A', onPress: () => ArchiveFirstTimeCheck(item.id) } : { onPress: () => { }, width: 1, background: 'red' }]}
                                                                    leftItem={starredEnabled ? { icon: require('../assets/star.png'), text: 'Star', width: 80, background: '#FFBC01', onPress: () => StarNote(item.id) } : { background: 'red', onPress: () => { } }}
                                                                    useNativeAnimations itemsIconSize={20} style={{ borderRadius: 10, width: screenWidth - 10, alignItems: 'center' }}
                                                                    fullRightThreshold={0.7} onFullSwipeRight={() => { DeleteFromTable(item.id) }} bounciness={100}
                                                                    fullSwipeRight disableHaptic>

                                                                    <TouchableHighlight style={[{
                                                                        borderRadius: 10
                                                                    }]} borderRadius={10}
                                                                        underlayColor={colorScheme === 'dark' ? '#404040' : '#e3e3e3'}
                                                                        onLongPress={() => { OpenLongPressModal(item.id) }}
                                                                        onPress={() => {
                                                                            setFabVisible(false)
                                                                            props.navigation.navigate("CreateNote", {
                                                                                id: item.id,
                                                                                page: 'Home'
                                                                            })
                                                                        }} >


                                                                        <View style={{ width: screenWidth - 10, height: 75, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
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
                                                                                    <MaterialComIcon name="arrow-forward-ios" size={22} color={notebackgroundEnabled ? item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlight>
                                                                </Drawer>
                                                            )
                                                        })}
                                                    </StackAggregator>
                                                </View>
                                                :
                                                null}
                                            {!searchText && previousData && sortFun == 'id' && !selectionMode ?
                                                <View style={{ width: screenWidth, marginTop: 30 }}>
                                                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ marginStart: 15, fontSize: 25, fontWeight: 'bold' }}>Previously</Text>
                                                        {todayData ?
                                                            null
                                                            :
                                                            <Menu visible={menuSort} onDismiss={() => { setMenuSort(false) }} anchor={
                                                                <TouchableOpacity style={{ marginEnd: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => { setMenuSort(true) }}>
                                                                    <Text style={{ fontFamily: 'mulish', color: '#FFBC01', fontSize: 13 }}>Sort By </Text>
                                                                    <MaterialIcons name="sort" size={20} color="#FFBC01" />
                                                                </TouchableOpacity>}>
                                                                <Menu.Item title="Title" trailingIcon={sortFun == 'title' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'title' ? ascDesc == 'DESC' ? 'sort-alphabetical-descending-variant' : 'sort-alphabetical-ascending-variant' : 'sort-alphabetical-variant'} onPress={() => {
                                                                    setSortFun('title')
                                                                    ascDesc == 'DESC' ?
                                                                        setAscDesc('ASC')
                                                                        :
                                                                        setAscDesc('DESC')
                                                                    SelectData()
                                                                    setRefreshing(true)
                                                                    setMenuSort(false)
                                                                }} />
                                                                <Menu.Item title="Date" trailingIcon={sortFun == 'date' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'date' ? ascDesc == 'DESC' ? 'sort-calendar-descending' : 'sort-calendar-ascending' : 'sort-calendar-ascending'} onPress={() => {
                                                                    setSortFun('date')
                                                                    ascDesc == 'DESC' ?
                                                                        setAscDesc('ASC')
                                                                        :
                                                                        setAscDesc('DESC')
                                                                    SelectData()
                                                                    setRefreshing(true)
                                                                    setMenuSort(false)
                                                                }} />
                                                                <Menu.Item trailingIcon={sortFun == 'id' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} title="Last Added" leadingIcon={sortFun == 'id' ? ascDesc == 'DESC' ? 'sort-descending' : 'sort-ascending' : 'sort-reverse-variant'}
                                                                    onPress={() => {
                                                                        setSortFun('id')
                                                                        ascDesc == 'DESC' ?
                                                                            setAscDesc('ASC')
                                                                            :
                                                                            setAscDesc('DESC')
                                                                        SelectData()
                                                                        setRefreshing(true)
                                                                        setMenuSort(false)
                                                                    }} />
                                                            </Menu>
                                                        }
                                                    </View>
                                                    <StackAggregator backgroundColor="transparent" contentContainerStyle={{ alignItems: 'center', overflow: 'visible', height: 200, marginTop: -10, }} itemBorderRadius={10}
                                                        buttonProps={{ color: '#FFBC01' }} containerStyle={{ overflow: 'visible', marginTop: 20, marginBottom: 100, }} marginV={false}
                                                        collapsed={previousData.length > 10 ? true : false} spread={true} animated width={screenWidth} style={{ width: screenWidth, }}>
                                                        {previousData.map((item, index) => {
                                                            return (
                                                                <Drawer key={index}
                                                                    rightItems={[{ icon: require('../assets/delete.png'), text: 'Trash', width: 80, background: 'red', onPress: () => { DeleteFromTable(item.id) } }, archiveEnabled ? { icon: require('../assets/archive.png'), text: 'Archive', width: 80, background: '#3BBC1A', onPress: () => ArchiveFirstTimeCheck(item.id) } : { onPress: () => { }, width: 1, background: 'red' }]}
                                                                    leftItem={starredEnabled ? { icon: require('../assets/star.png'), text: 'Star', width: 80, background: '#FFBC01', onPress: () => StarNote(item.id) } : { background: 'red', onPress: () => { } }}
                                                                    useNativeAnimations itemsIconSize={20} style={{ borderRadius: 10, width: screenWidth - 10, alignItems: 'center', }}
                                                                    fullRightThreshold={0.7} onFullSwipeRight={() => { DeleteFromTable(item.id) }} bounciness={100}
                                                                    fullSwipeRight disableHaptic>

                                                                    <TouchableHighlight style={[{
                                                                        borderRadius: 10
                                                                    }]} borderRadius={10}
                                                                        underlayColor={colorScheme === 'dark' ? '#404040' : '#e3e3e3'}
                                                                        onLongPress={() => { OpenLongPressModal(item.id) }}
                                                                        onPress={() => {
                                                                            setFabVisible(false)
                                                                            props.navigation.navigate("CreateNote", {
                                                                                id: item.id,
                                                                                page: 'Home'
                                                                            })
                                                                        }} >

                                                                        <View style={{ width: screenWidth - 10, height: 75, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
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
                                                                                    <MaterialComIcon name="arrow-forward-ios" size={22} color={notebackgroundEnabled ? item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                                                </View>
                                                                            </View>

                                                                        </View>

                                                                    </TouchableHighlight>

                                                                </Drawer>
                                                            )
                                                        })}
                                                    </StackAggregator>
                                                </View>
                                                :
                                                null}
                                            {sortFun != 'id' && !selectionMode ?
                                                <View style={{ width: screenWidth, marginTop: 10 }}>
                                                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ marginStart: 15, fontSize: 25, fontWeight: 'bold' }}>Sorted by {sortFun}</Text>

                                                        <Menu visible={menuSort} onDismiss={() => { setMenuSort(false) }} anchor={
                                                            <TouchableOpacity style={{ marginEnd: 15, flexDirection: 'row', alignItems: 'center' }} onPress={() => { setMenuSort(true) }}>
                                                                <Text style={{ fontFamily: 'mulish', color: '#FFBC01', fontSize: 13 }}>Sort By </Text>
                                                                <MaterialIcons name="sort" size={20} color="#FFBC01" />
                                                            </TouchableOpacity>}>
                                                            <Menu.Item title="Title" trailingIcon={sortFun == 'title' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'title' ? ascDesc == 'DESC' ? 'sort-alphabetical-descending-variant' : 'sort-alphabetical-ascending-variant' : 'sort-alphabetical-variant'} onPress={() => {
                                                                setSortFun('title')
                                                                ascDesc == 'DESC' ?
                                                                    setAscDesc('ASC')
                                                                    :
                                                                    setAscDesc('DESC')
                                                                SelectData()
                                                                setRefreshing(true)
                                                                setMenuSort(false)
                                                            }} />
                                                            <Menu.Item title="Date" trailingIcon={sortFun == 'date' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} leadingIcon={sortFun == 'date' ? ascDesc == 'DESC' ? 'sort-calendar-descending' : 'sort-calendar-ascending' : 'sort-calendar-ascending'} onPress={() => {
                                                                setSortFun('date')
                                                                ascDesc == 'DESC' ?
                                                                    setAscDesc('ASC')
                                                                    :
                                                                    setAscDesc('DESC')
                                                                SelectData()
                                                                setRefreshing(true)
                                                                setMenuSort(false)
                                                            }} />
                                                            <Menu.Item trailingIcon={sortFun == 'id' ? 'menu-left' : null} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} title="Last Added" leadingIcon={sortFun == 'id' ? ascDesc == 'DESC' ? 'sort-descending' : 'sort-ascending' : 'sort-reverse-variant'}
                                                                onPress={() => {
                                                                    setSortFun('id')
                                                                    ascDesc == 'DESC' ?
                                                                        setAscDesc('ASC')
                                                                        :
                                                                        setAscDesc('DESC')
                                                                    SelectData()
                                                                    setRefreshing(true)
                                                                    setMenuSort(false)
                                                                }} />
                                                        </Menu>

                                                    </View>
                                                    <StackAggregator backgroundColor="transparent" contentContainerStyle={{ alignItems: 'center', overflow: 'visible', height: 200, marginTop: -10 }} itemBorderRadius={10}
                                                        buttonProps={{ color: '#FFBC01' }} containerStyle={{ overflow: 'visible', marginTop: 20, marginBottom: 100 }} marginV={false}
                                                        collapsed={false} spread={true} animated width={screenWidth} style={{ width: screenWidth, }}>
                                                        {data.map((item, index) => {
                                                            return (
                                                                <Drawer key={index}
                                                                    rightItems={[{ icon: require('../assets/delete.png'), text: 'Trash', width: 80, background: 'red', onPress: () => { DeleteFromTable(item.id) } }, archiveEnabled ? { icon: require('../assets/archive.png'), text: 'Archive', width: 80, background: '#3BBC1A', onPress: () => ArchiveFirstTimeCheck(item.id) } : { onPress: () => { }, width: 1, background: 'red' }]}
                                                                    leftItem={starredEnabled ? { icon: require('../assets/star.png'), text: 'Star', width: 80, background: '#FFBC01', onPress: () => StarNote(item.id) } : { background: 'red', onPress: () => { } }}
                                                                    useNativeAnimations itemsIconSize={20} style={{ borderRadius: 10, width: screenWidth - 10, alignItems: 'center' }}
                                                                    fullRightThreshold={0.7} onFullSwipeRight={() => { DeleteFromTable(item.id) }} bounciness={100}
                                                                    fullSwipeRight disableHaptic>

                                                                    <TouchableHighlight style={[{
                                                                        borderRadius: 10
                                                                    }]} borderRadius={10}
                                                                        underlayColor={colorScheme === 'dark' ? '#404040' : '#e3e3e3'}
                                                                        onLongPress={() => { OpenLongPressModal(item.id) }}
                                                                        onPress={() => {
                                                                            setFabVisible(false)
                                                                            props.navigation.navigate("CreateNote", {
                                                                                id: item.id,
                                                                                page: 'Home'
                                                                            })
                                                                        }} >


                                                                        <View style={{ width: screenWidth - 10, height: 75, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
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
                                                                                    <MaterialComIcon name="arrow-forward-ios" size={22} color={notebackgroundEnabled ? item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                                                </View>
                                                                            </View>

                                                                        </View>

                                                                    </TouchableHighlight>

                                                                </Drawer>
                                                            )
                                                        })}
                                                    </StackAggregator>
                                                </View>
                                                :
                                                null}
                                            {selectionMode && selectionData ?
                                                <View style={{ width: screenWidth, alignItems: 'center' }}>
                                                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Text style={{ marginBottom: 2, marginStart: 10, fontSize: 25, fontWeight: 'bold' }}>Selection Mode</Text>
                                                        <TouchableOpacity style={{ marginEnd: 15, flexDirection: 'row', alignItems: 'center' }}
                                                            onPress={() => {
                                                                SelectAllNotes()
                                                            }}>
                                                            <Text style={{ color: '#FFBC01', fontSize: 12 }}>Select all</Text>
                                                            <Checkbox status={selectAll ? 'checked' : 'unchecked'} color="#FFBC01" uncheckedColor="#FFBC01" />
                                                        </TouchableOpacity>
                                                    </View>

                                                    <FlatList
                                                        data={selectionData}
                                                        key={item => item.id}
                                                        contentContainerStyle={{ marginBottom: 100 }}
                                                        scrollEnabled={false}
                                                        renderItem={(item) => {
                                                            return (
                                                                <View style={{ width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center', alignSelf: 'center', marginTop: 20 }}>
                                                                    <Checkbox status={item.item.checked ? 'checked' : 'unchecked'} color="#FFBC01" uncheckedColor="#FFBC01" onPress={() => {
                                                                        CheckUncheck(item.item.noteid)
                                                                    }} />
                                                                    <TouchableOpacity style={{ width: '80%', height: 75, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, alignItems: 'center', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }}
                                                                        activeOpacity={0.6} onPress={() => {
                                                                            CheckUncheck(item.item.noteid)
                                                                        }}>
                                                                        <View>
                                                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>{item.item.title.trim().slice(0, 16)}</Text>
                                                                            <Text numberOfLines={2} style={{ fontSize: 11 }}>{item.item.note.trim().slice(0, 25)}</Text>
                                                                        </View>
                                                                        <View style={{}}>
                                                                            <Text style={{ fontFamily: 'mulish', fontSize: 10, alignSelf: 'flex-end' }}>{item.item.date.length === 9 ? item.item.date.slice(0, 4) : item.item.date.slice(0, 5)}</Text>
                                                                            <Text style={{ fontFamily: 'mulish', fontSize: 10, marginStart: -15 }}>{item.item.time.length === 10 ? item.item.time.slice(0, 4) + item.item.time.slice(7, 10) : item.item.time.slice(0, 5) + item.item.time.slice(8, 11)}</Text>
                                                                        </View>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )
                                                        }}
                                                    />
                                                </View>
                                                :
                                                null}
                                            {searchData && searchText && sortFun == 'id' && !selectionMode ?
                                                <View style={{ width: screenWidth, marginTop: 30 }}>
                                                    <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center' }}>
                                                        <Text style={{ marginStart: 15, fontSize: 25, fontWeight: 'bold' }}>Search Results</Text>
                                                    </View>
                                                    <StackAggregator backgroundColor="transparent" contentContainerStyle={{ alignItems: 'center', overflow: 'visible', height: 200, marginTop: -10, }} itemBorderRadius={10}
                                                        buttonProps={{ color: '#FFBC01' }} containerStyle={{ overflow: 'visible', marginTop: 20, marginBottom: 100, }} marginV={false}
                                                        collapsed={searchData.length > 5 ? true : false} spread={true} animated width={screenWidth} style={{ width: screenWidth, }}>
                                                        {searchData.map((item, index) => {
                                                            return (
                                                                <Drawer key={index}
                                                                    rightItems={[{ icon: require('../assets/delete.png'), text: 'Trash', width: 80, background: 'red', onPress: () => { DeleteFromTable(item.id) } }, archiveEnabled ? { icon: require('../assets/archive.png'), text: 'Archive', width: 80, background: '#3BBC1A', onPress: () => ArchiveFirstTimeCheck(item.id) } : { onPress: () => { }, width: 1, background: 'red' }]}
                                                                    leftItem={starredEnabled ? { icon: require('../assets/star.png'), text: 'Star', width: 80, background: '#FFBC01', onPress: () => StarNote(item.id) } : { background: 'red', onPress: () => { } }}
                                                                    useNativeAnimations itemsIconSize={20} style={{ borderRadius: 10, width: screenWidth - 10, alignItems: 'center', }}
                                                                    fullRightThreshold={0.7} onFullSwipeRight={() => { DeleteFromTable(item.id) }} bounciness={100}
                                                                    fullSwipeRight disableHaptic>

                                                                    <TouchableHighlight style={[{
                                                                        borderRadius: 10
                                                                    }]} borderRadius={10}
                                                                        underlayColor={colorScheme === 'dark' ? '#404040' : '#e3e3e3'}
                                                                        onLongPress={() => { OpenLongPressModal(item.id) }}
                                                                        onPress={() => {
                                                                            setFabVisible(false)
                                                                            props.navigation.navigate("CreateNote", {
                                                                                id: item.id,
                                                                                page: 'Home'
                                                                            })
                                                                        }} >

                                                                        <View style={{ width: screenWidth - 10, height: 75, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
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
                                                                                    <MaterialComIcon name="arrow-forward-ios" size={22} color={notebackgroundEnabled ? item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                                                </View>
                                                                            </View>

                                                                        </View>

                                                                    </TouchableHighlight>

                                                                </Drawer>
                                                            )
                                                        })}
                                                    </StackAggregator>
                                                </View>
                                                :
                                                null}

                                        </ScrollView>
                                        <Fader position={Fader.position.BOTTOM} size={120} tintColor={colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4'} />
                                    </View>
                                    :
                                    null}

                            </View>

                        :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <AnimatedLottieView
                                source={require('../assets/emptyanim.json')}
                                style={{ width: '100%', height: reminderData ? 250 : 350 }}
                                autoPlay loop renderMode="HARDWARE" hardwareAccelerationAndroid />
                            <Text style={{ fontFamily: 'mulish', fontSize: 17 }}>Oops, CloudNotes is empty!</Text>
                        </View>

                }


                <Portal>
                    <Modal visible={longpress} style={{ alignItems: 'center', justifyContent: 'center' }} onDismiss={() => {
                        setLongPress(false)
                        DismissLongPress()
                    }}>
                        <View style={{ alignSelf: 'center', alignItems: 'center' }}>
                            <Image source={require('../assets/longpress.png')} style={{ width: 100, height: 108, marginTop: -50 }} />
                            <Text style={{ color: 'white', fontFamily: 'mulish', marginTop: 50, fontSize: 25, textAlign: 'center', width: screenWidth - 100 }}>Long press the note or slide to left or right for more options!</Text>
                        </View>
                    </Modal>
                </Portal>

                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: screenWidth }}>
                    {selectionMode ?
                        null
                        :
                        <View>
                            <ExpandableSection top expanded={expandExtra}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <Tooltip title="Browse Internet">
                                        <TouchableOpacity style={{ marginStart: 35, marginBottom: 10 }} onPress={() => {
                                            setFabVisible(false)
                                            setExpandExtra(false)
                                            props.navigation.navigate("Browser")
                                        }}>
                                            <Ionicons name="globe-outline" size={25} color="#FFBC01" />
                                        </TouchableOpacity>
                                    </Tooltip>
                                </View>
                            </ExpandableSection>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                <TouchableOpacity style={{ marginStart: 35, marginBottom: 10 }} onPress={() => { setExpandExtra(!expandExtra) }}>
                                    <MaterialIcons name={expandExtra ? 'close' : "circle-multiple-outline"} size={25} color="#FFBC01" />
                                </TouchableOpacity>

                                <ExpandableSection expanded={expandExtra}>
                                    <TouchableOpacity style={{ marginStart: 35, marginBottom: 10 }} onPress={() => {
                                        setRecordingModal(true)
                                    }}>
                                        <MaterialComIcon name="keyboard-voice" size={25} color="#FFBC01" />
                                    </TouchableOpacity>
                                </ExpandableSection>

                            </View>

                        </View>
                    }



                    <View style={{ marginEnd: 35 }}><Text style={{ color: 'transparent' }}>0</Text></View>
                    <Portal>
                        <Modal visible={modalLongPress} onDismiss={() => { setModalLongPress(false) }} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{
                                width: 250, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 15,
                                alignItems: 'center', justifyContent: 'space-evenly', opacity: 0.8
                            }}>
                                <TouchableOpacity style={{
                                    width: '100%', height: 50, alignItems: 'center',
                                    flexDirection: 'row', justifyContent: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    PinNote(longPressId)
                                    setModalLongPress(false)
                                }}>
                                    <MaterialIcons name="pin-outline" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                    <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Pin Note</Text>
                                </TouchableOpacity>
                                <Divider style={{ width: '100%', height: 1 }} />
                                <TouchableOpacity style={{
                                    width: '100%', height: 50, alignItems: 'center',
                                    flexDirection: 'row', justifyContent: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    setSelectionMode(true)
                                    setModalLongPress(false)
                                }}>
                                    <MaterialIcons name="format-list-checks" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                    <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Selection Mode</Text>
                                </TouchableOpacity>
                                {starredEnabled ?
                                    <View style={{ width: '100%' }}>
                                        <Divider style={{ width: '100%', height: 1 }} />
                                        <TouchableOpacity style={{
                                            width: '100%', height: 50, alignItems: 'center',
                                            flexDirection: 'row', justifyContent: 'center'
                                        }} activeOpacity={0.7} onPress={() => {
                                            StarNote(longPressId)
                                            setModalLongPress(false)
                                        }}>
                                            <MaterialComIcon name="star-border" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                            <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Star Note</Text>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    null}
                                {archiveEnabled ?
                                    <View style={{ width: '100%' }}>
                                        <Divider style={{ width: '100%', height: 1 }} />
                                        <TouchableOpacity style={{
                                            width: '100%', height: 50, alignItems: 'center',
                                            flexDirection: 'row', justifyContent: 'center'
                                        }} activeOpacity={0.7} onPress={() => {
                                            ArchiveFirstTimeCheck(longPressId)
                                            setModalLongPress(false)
                                        }}>
                                            <MaterialComIcon name="archive" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                            <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Archive Note</Text>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    null}
                                {readingmodeEnabled ?
                                    <View style={{ width: '100%' }}>
                                        <Divider style={{ width: '100%', height: 1 }} />
                                        <TouchableOpacity style={{
                                            width: '100%', height: 50, alignItems: 'center',
                                            flexDirection: 'row', justifyContent: 'center'
                                        }} activeOpacity={0.7} onPress={() => {
                                            setModalLongPress(false)
                                            ReadingModeCheck(longPressId)
                                        }}>
                                            <MaterialComIcon name="menu-book" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                            <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Open in Reading Mode</Text>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    null}
                                <View style={{ width: '100%' }}>
                                    <Divider style={{ width: '100%', height: 1 }} />
                                    <TouchableOpacity style={{
                                        width: '100%', height: 50, alignItems: 'center',
                                        flexDirection: 'row', justifyContent: 'center', backgroundColor: '#5a48f5'
                                    }} activeOpacity={0.7} onPress={() => {
                                        setModalLongPress(false)
                                        MoveToFolder(longPressId)
                                    }}>
                                        <MaterialComIcon name="folder-open" size={20} color="white" style={{ marginStart: -5, marginEnd: 5 }} />
                                        <Text style={{ fontWeight: 'bold', color: 'white' }}>Move to Folder</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '100%' }}>
                                    <Divider style={{ width: '100%', height: 1 }} />
                                    <TouchableOpacity style={{
                                        width: '100%', height: 50, alignItems: 'center',
                                        flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFBC01',
                                    }} activeOpacity={0.7} onPress={() => {
                                        setModalLongPress(false)
                                        DeleteFromTable(longPressId)
                                    }}>
                                        <MaterialComIcon name="delete-outline" size={20} color="white" style={{ marginStart: -5, marginEnd: 5 }} />
                                        <Text style={{ fontWeight: 'bold', color: 'white' }}>Move to Trash</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ width: '100%' }}>
                                    <Divider style={{ width: '100%', height: 1 }} />
                                    <TouchableOpacity style={{
                                        width: '100%', height: 50, alignItems: 'center',
                                        flexDirection: 'row', justifyContent: 'center', backgroundColor: 'red', borderBottomEndRadius: 16,
                                        borderBottomStartRadius: 16
                                    }} activeOpacity={0.7} onPress={() => {
                                        setModalLongPress(false)
                                        PermanentDelete(longPressId)
                                    }}>
                                        <MaterialComIcon name="delete-forever" size={20} color="white" style={{ marginStart: -5, marginEnd: 5 }} />
                                        <Text style={{ fontWeight: 'bold', color: 'white' }}>Permanently Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    </Portal>


                    <Portal>
                        <Dialog visible={permanentDeleteDialog} onDismiss={() => { setPermanentDeleteDialog(false) }} dismissable dismissableBackButton>
                            <Dialog.Title>Read before deleting!</Dialog.Title>
                            <Dialog.Content>
                                <Text variant="bodyMedium">Doing this will permanently delete this note, this action is irreversible. Are you sure?</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={() => {
                                    setPermanentDeleteDialog(false)
                                    setPermanentDeleteId('')
                                }}>Cancel</Button>
                                <Button onPress={FinallyDelete} labelStyle={{ color: 'red' }} mode="text">Delete</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <Portal>
                        <Modal dismissable dismissableBackButton visible={recordingModal} onDismiss={() => { setRecordingModal(false) }}
                            style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableHighlight style={{ width: 150, height: 150, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white', borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => { StartStopRecording() }} underlayColor={colorScheme === 'dark' ? '#303030' : '#dedede'}>

                                {recording ?
                                    <Card style={{ width: 150, height: 150, borderRadius: 100, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'red' }}>
                                        <MaterialComIcon name="keyboard-voice" size={50} color="red" />
                                    </Card>
                                    :
                                    <MaterialComIcon name="keyboard-voice" size={50} color="#FFBC01" />}
                            </TouchableHighlight>
                        </Modal>
                    </Portal>

                    {selectionMode ?
                        null
                        :
                        <Portal>
                            <FAB.Group
                                open={open}
                                visible={fabVisible}
                                icon={open ? 'note-edit' : 'plus'}
                                fabStyle={{ backgroundColor: '#FFBC01' }}
                                color="white"
                                label={open ? 'New note' : ''}

                                actions={fabButton == null ?
                                    [{
                                        icon: 'close',
                                        onPress: () => setState({ open: false }),
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    },
                                    {
                                        icon: 'store',
                                        label: 'Marketplace',
                                        onPress: () => Marketplace(),
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    },
                                    {
                                        icon: 'camera',
                                        label: 'Open Camera',
                                        onPress: () => {
                                            setFabVisible(false)
                                            props.navigation.navigate('CreateNote', {
                                                page: 'HomeCamera'
                                            })
                                        },
                                        style: { backgroundColor: '#FFBC01' },
                                        color: 'white'
                                    }]
                                    :
                                    fabButton}

                                onStateChange={onStateChange}
                                onPress={() => {
                                    if (open) {
                                        setFabVisible(false)
                                        props.navigation.navigate('CreateNote')
                                    }
                                }}
                            />
                        </Portal>}

                </View>
                <Portal>
                    <Snackbar visible={snackbarTrash}
                        action={{
                            label: 'Undo',
                            onPress: () => {
                                RestoreLastDeleted()
                            }, textColor: "#FFBC01"
                        }}
                        duration={2500} onDismiss={() => { setSnackbarTrash(false) }}>
                        {snackbarMessage}
                    </Snackbar>
                </Portal>
                <Portal>
                    <Snackbar visible={snackbarArchive}
                        action={{
                            label: 'Undo',
                            onPress: () => {
                                RestoreLastArchived()
                            }, textColor: "#FFBC01"
                        }}
                        duration={2500} onDismiss={() => { setSnackbarArchive(false) }}>
                        {snackbarMessage}
                    </Snackbar>
                </Portal>

            </View>
        </SafeAreaView>
    )
}


export default HomeScreen