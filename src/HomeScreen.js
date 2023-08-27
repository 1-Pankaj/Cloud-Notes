import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated, Appearance, Dimensions, FlatList, ImageBackground,
    RefreshControl, ScrollView, StyleSheet, TextInput, ToastAndroid,
    TouchableHighlight, TouchableOpacity, View, Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Banner, Button, Divider, FAB, Menu, Modal, Portal, Text, Tooltip } from "react-native-paper";
import * as SQLite from 'expo-sqlite'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from "expo-font";
import * as Speech from 'expo-speech'

import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialComIcon from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SwipeListView } from "react-native-swipe-list-view";
import AnimatedLottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


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
            console.log(error);
        })
    }




    const [visible, setVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false)
    const [searchText, setSearchText] = useState("")
    const animatedHiddenSearch = new Animated.Value(0)
    const [openSearch, setOpenSearch] = useState(false)
    const searchRef = useRef(null)
    const [menuVisible, setMenuVisible] = useState(false);
    const [grid, setGrid] = useState(false)
    const [dataGrid1, setDataGrid1] = useState(null)
    const [dataGrid2, setDataGrid2] = useState(null)
    const [longpress, setLongPress] = useState(false)
    const [modalLongPress, setModalLongPress] = useState(false)
    const [lognPressId, setLongPressId] = useState('')
    const [pinnedData, setPinnedData] = useState(false)
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();



    const openMenu = () => setMenuVisible(true);

    const closeMenu = () => setMenuVisible(false);
    const [state, setState] = useState({ open: false });

    const onStateChange = ({ open }) => setState({ open });
    const [fabVisible, setFabVisible] = useState(false)

    const { open } = state;

    const isFocused = useIsFocused()

    const onRowDidOpen = rowKey => {
        console.log('This row opened', rowKey);
    };

    const onLeftActionStatusChange = rowKey => {
        console.log('onLeftActionStatusChange', rowKey);
    };

    const onRightActionStatusChange = rowKey => {
        console.log('onRightActionStatusChange', rowKey);
    };

    const onRightAction = rowKey => {
        console.log('onRightAction', rowKey);
    };

    const onLeftAction = rowKey => {
        console.log('onLeftAction', rowKey);
    };


    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const [data, setData] = useState([])
    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql
                ("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)",
                    [],
                    (sql, rs) => {
                    },
                    error => {
                        console.log("Error");
                    })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS archived (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS starredsplash (firsttime Boolean)", [],
                (sql, rs) => {
                }, error => {
                    console.log("error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS pinnednote(id INTEGER PRIMARY KEY AUTOINCREMENT, noteid VARCHAR(20), title VARCHAR(20), note VARCHAR(20))", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
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
                    console.log("error");
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
                        sql.executeSql("INSERT INTO pinnednote (noteid, title, note) values (?,?,?)", [id, title, note],
                            (sql, rs) => {
                                ToastAndroid.show("Pinned Note", ToastAndroid.SHORT)
                                SelectData()
                            }, error => {
                                console.log("Error");
                            })
                    } else {
                        setPinnedData(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }



    const SelectData = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM notes ORDER BY id DESC", [],
                (sql, rs) => {

                    if (grid) {
                        setDataGrid1([])
                        setDataGrid2([])
                        let results1 = []
                        let results2 = []
                        if (rs.rows.length > 0) {
                            for (let i = 0; i < rs.rows.length; i = i + 2) {
                                let item = rs.rows.item(i)
                                results1.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                            }
                            setDataGrid1(results1)

                            for (let i = 1; i < rs.rows.length; i = i + 2) {
                                let item = rs.rows.item(i)
                                results2.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                            }
                            setDataGrid2(results2)
                            setRefreshing(false)
                        }
                        else {
                            setDataGrid1(null)
                            setDataGrid2(null)
                        }
                    }
                    else {
                        setData([])
                        let results = []
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
                    }
                },
                error => {
                    console.log("Error");
                    setRefreshing(false)
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
                    console.log("Error");
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
                                                                    SelectData()
                                                                    ToastAndroid.show("Moved to Trash", ToastAndroid.SHORT)
                                                                }, error => {
                                                                    console.log("Error");
                                                                })
                                                        }, error => {
                                                            console.log("error");
                                                        })
                                                }, error => {
                                                    console.log("Error");
                                                })
                                        }
                                    }, error => {
                                        console.log("Error");
                                    })
                            }, error => {
                                console.log("error");
                            })
                    }
                }, error => {
                    console.log("Error");
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
                                                    console.log("error");
                                                })
                                        } else {
                                            ToastAndroid.show("This note is already Starred", ToastAndroid.SHORT)
                                        }
                                    }, error => {
                                        console.log("Error");
                                    })
                            }
                        }, error => {
                            console.log("error");
                        })
                }, error => {
                    console.log("error");
                })
        })
    }

    const OpenLongPressModal = (id) => {
        setLongPressId(id)
        setModalLongPress(true)
    }

    const VisibleItem = prop => {

        const { data,
            rowHeightAnimatedValue,
            removeRow,
            leftActionState,
            rightActionState } = prop


        if (rightActionState) {
            Animated.spring(rowHeightAnimatedValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false
            }).start(() => {
                DeleteFromTable(data.item.id)
            })
        }
        return (
            <Animated.View style={{ height: rowHeightAnimatedValue, opacity: rowHeightAnimatedValue }}>

                <TouchableHighlight style={[{
                    borderRadius: 10
                }]}
                    onLongPress={() => { OpenLongPressModal(data.item.id) }}
                    onPress={() => {
                        setFabVisible(false)
                        props.navigation.navigate("CreateNote", {
                            id: data.item.id,
                            page: 'Home'
                        })
                    }} underlayColor={colorScheme === "dark" ? "#505050" : "#AAA7A7"}>

                    <View style={{ width: '100%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                        <ImageBackground style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
                        <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{
                                    fontFamily: 'mulish', fontSize: 18,
                                    fontWeight: 'bold', color: colorScheme === 'dark' ? 'white' : '#202020'
                                }}
                                    numberOfLines={1}>
                                    {data.item.title.slice(0, 20).trim()}
                                </Text>
                                <Text style={{
                                    fontFamily: 'mulish', fontSize: 12
                                    , color: colorScheme === 'dark' ? 'white' : '#202020'
                                }}
                                    numberOfLines={1}>
                                    {data.item.note.slice(0, 30).trim()}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                                <View style={{ alignItems: 'center', marginEnd: 20 }}>
                                    <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{data.item.date.length === 9 ? data.item.date.slice(0, 4) : data.item.date.slice(0, 5)}</Text>
                                    <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{data.item.time.length === 10 ? data.item.time.slice(0, 4) + data.item.time.slice(7, 10) : data.item.time.slice(0, 5) + data.item.time.slice(8, 11)}</Text>
                                </View>
                                <MaterialComIcon name="arrow-forward-ios" size={22} color={data.item.pageColor === 'default' ? '#FFBC01' : 'white'} />
                            </View>
                        </View>

                    </View>

                </TouchableHighlight>
            </Animated.View>
        )
    }

    const AnimateSearchView = () => {
        if (openSearch) {
            searchRef.current.blur()
            SelectData()
            Animated.timing(animatedHiddenSearch, {
                toValue: 0,
                duration: 0,
                useNativeDriver: false,
            }).start(() => {
                setOpenSearch(false)
            })
        }
        else {
            searchRef.current.focus()
            Animated.spring(animatedHiddenSearch, {
                toValue: 50,
                duration: 10,
                useNativeDriver: false,
            }).start(() => {
                setOpenSearch(true)
            })
        }
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
                                                    sql.executeSql("DELETE FROM pinnednote WHERE noteid = (?)", [id],
                                                        (sql, rs) => {
                                                            ToastAndroid.show("Archived!", ToastAndroid.SHORT)
                                                            SelectData()
                                                        }, error => {
                                                            console.log("Error");
                                                        })

                                                },
                                                error => { console.log("Error"); })
                                        }, error => {
                                            console.log("Error");
                                        })
                                }, error => {
                                    console.log("Error");
                                })
                        })
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }


    const HiddenItemWithActions = props => {
        const { swipeAnimatedValue, leftActionActivated,
            rightActionActivated,
            rowActionAnimatedValue,
            rowHeightAnimatedValue } = props



        if (rightActionActivated) {
            Animated.spring(rowActionAnimatedValue, {
                toValue: 500,
                useNativeDriver: false,
                duration: 100
            }).start(() => {
                DeleteFromTable(props.data.item.id)
            });
        }

        return (
            <Animated.View style={[styles.rowBack, { height: rowHeightAnimatedValue }]}>
                <TouchableOpacity style={styles.trash} onPress={() => { StarNote(props.data.item.id) }}>
                    <Ionicons name="star" color="white" size={20} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]}
                    onPress={() => { ArchiveFirstTimeCheck(props.data.item.id) }}>
                    <View style={styles.trash}>


                        <Ionicons name="archive" color="white" size={20} />
                    </View>
                </TouchableOpacity>
                <Animated.View style={[styles.backRightBtn, styles.backRightBtnRight, {
                    flex: 1, width: rowActionAnimatedValue
                }]}>
                    <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]}
                        onPress={() => {
                            DeleteFromTable(props.data.item.id)
                        }}>
                        <Animated.View style={[styles.trash, {
                            transform: [
                                {
                                    scale: swipeAnimatedValue.interpolate({
                                        inputRange: [-90, -45],
                                        outputRange: [1, 0],
                                        extrapolate: 'clamp',
                                    }),
                                },
                            ]
                        }]}>
                            <Ionicons name="trash" color="white" size={20} />
                        </Animated.View>
                    </TouchableOpacity>
                    <Portal>

                    </Portal>
                </Animated.View>

            </Animated.View>
        )
    }

    const SearchInDatabase = (prop) => {
        setSearchText(prop)
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes where title LIKE '%${prop}%' or note LIKE '%${prop}%'`, [],
                (sql, rs) => {
                    if (grid) {
                        setDataGrid1([])
                        setDataGrid2([])
                        let results1 = []
                        let results2 = []
                        if (rs.rows.length > 0) {
                            for (let i = 0; i < rs.rows.length; i = i + 2) {
                                let item = rs.rows.item(i)
                                results1.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                            }
                            setDataGrid1(results1)

                            for (let i = 1; i < rs.rows.length; i = i + 2) {
                                let item = rs.rows.item(i)
                                results2.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                            }
                            setDataGrid2(results2)
                        }
                        else {
                            setDataGrid1(null)
                            setDataGrid2(null)
                        }
                    } else {
                        setData([])
                        let results = []
                        if (rs.rows.length > 0) {
                            for (let i = 0; i < rs.rows.length; i++) {
                                let item = rs.rows.item(i)

                                results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })

                            }
                            setData(results)
                        } else {
                            setData(null)
                        }
                    }
                },
                error => {
                    console.log("Error");
                })
        })

    }

    const renderItem = (data, rowMap) => {
        const rowHeightAnimatedValue = new Animated.Value(73)
        return (
            <>
                <VisibleItem data={data} rowHeightAnimatedValue={rowHeightAnimatedValue} removeRow={() => { DeleteFromTable(data.item.id) }}

                />

            </>

        )
    }



    const renderHiddenItem = (data, rowMap) => {
        const rowActionAnimatedValue = new Animated.Value(75)
        const rowHeightAnimatedValue = new Animated.Value(60)
        return (
            <HiddenItemWithActions
                rowActionAnimatedValue={rowActionAnimatedValue}
                rowHeightAnimatedValue={rowHeightAnimatedValue}
                data={data}
                rowMap={rowMap}

            />
        )
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
                    console.log("Error");
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
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
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
                                        }
                                    }, error => {
                                        console.log("Error");
                                    })
                            }
                        }, error => {
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

    const DismissLongPress = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO longpress (firsttime) values (false)", [],
                (sql, rs) => {
                    setLongPress(false)
                }, error => {
                    console.log("Error");
                })
        })
    }
    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        LongPressCheck()
        SelectData()
        
        CheckFirstTime()
        CreateTable()
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

    useEffect(()=>{
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    },[])

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf"),
    })

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded || initializing) {
        return null
    }

    const UnpinNote = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM pinnednote WHERE id = (?)", [id],
                (sql, rs) => {
                    SelectData()
                    ToastAndroid.show("Unpinned Note", ToastAndroid.SHORT)
                }, error => {
                    console.log("Error");
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
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }


    return (
        <SafeAreaView style={[Styles.container, { width: "100%", height: '100%' }]} onLayout={onLayoutRootView}>

            <View style={[Styles.container, { justifyContent: 'space-around' }]}>
                <View style={{
                    flexDirection: 'row', width: screenWidth, alignItems: 'center', padding: 15,
                    justifyContent: 'space-between'
                }}>
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
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <TouchableOpacity onPress={() => {
                            AnimateSearchView()

                        }} style={{ marginEnd: 25 }}>
                            <MaterialComIcon name={openSearch ? "close" : "search"} size={25} color="#FFBC01" />
                        </TouchableOpacity>

                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}

                            anchor={<TouchableOpacity style={{ marginEnd: 5 }} onPress={() => { openMenu() }}>
                                <MaterialIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                            </TouchableOpacity>}>
                            {data || dataGrid1 || dataGrid2?
                                <Menu.Item onPress={() => {
                                closeMenu()
                                setGrid(!grid)
                                setRefreshing(true)
                            }} title={grid ? 'List View' : 'Grid View'} leadingIcon={grid ? 'format-list-checkbox' : 'view-grid'} theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                            :
                            null}
                            <Menu.Item onPress={() => {
                                closeMenu()
                            }} title="Settings" leadingIcon="cog-outline" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                            <Divider />
                            {user?
                                <Menu.Item onPress={() => {
                                closeMenu()
                            }} title='Profile' leadingIcon="account-circle" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />
                            :
                            <Menu.Item onPress={() => {
                                closeMenu()
                                SignInWithGoogle()
                            }} title='Sign in' leadingIcon="account-circle" theme={{ colors: { onSurfaceVariant: "#FFBC01" } }} />}
                            {user?
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
                <Animated.View style={{
                    alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'center',
                    height: animatedHiddenSearch, opacity: animatedHiddenSearch
                }}>
                    <TextInput placeholder="Search here" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                        ref={searchRef}
                        style={{
                            width: '85%', paddingVertical: 6, backgroundColor: colorScheme === "dark" ? "#303030" : "lightgray", borderRadius: 10,
                            opacity: 0.7, paddingHorizontal: 10, color: colorScheme === "dark" ? "white" : "black", alignSelf: 'center', fontSize: 13,
                            fontFamily: 'mulish',
                        }}
                        selectTextOnFocus
                        cursorColor="#FFBC01"
                        multiline={false}
                        value={searchText}
                        selectionColor="#FFBC01"
                        onChangeText={(text) => { SearchInDatabase(text) }}
                    />

                </Animated.View>
                {pinnedData ?
                    <View style={{ width: screenWidth, alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ alignSelf: 'flex-start', marginStart: 25, marginTop: 10, fontSize: 25, marginBottom: 10, fontWeight: 'bold' }}>Pinned Notes</Text>
                        <FlatList data={pinnedData} style={{ alignSelf: 'flex-start', marginStart: 10 }}
                            horizontal scrollEnabled={true} showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item.id}
                            renderItem={item => {
                                return (
                                    <TouchableOpacity style={{
                                        width: 150, height: 50, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, marginStart: 10,
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
                    </View>
                    :
                    null}
                {
                    data || dataGrid1 || dataGrid2 ?
                        grid ?

                            <ScrollView style={{ width: screenWidth }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                                setRefreshing(true)
                                SelectData()
                            }} />}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 25, marginTop: 15, fontSize: 25, fontWeight: 'bold' }}>All Notes</Text>
                                <View style={{ width: screenWidth, flexDirection: 'row', marginBottom: 60, }}>
                                    <FlatList data={dataGrid1}
                                        scrollEnabled={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                        keyExtractor={item => item.id}
                                        renderItem={(item) => (
                                            <TouchableOpacity style={{ width: 150, alignSelf: 'flex-start', height: 150, marginTop: 20, borderRadius: 15, borderWidth: 2, borderColor: 'gray', marginStart: 20 }}
                                                activeOpacity={0.6} onPress={() => {
                                                    setFabVisible(false)
                                                    props.navigation.navigate("CreateNote", {
                                                        id: item.item.id,
                                                        page: 'Home'
                                                    })
                                                }}>

                                                <ImageBackground style={{ width: '100%', height: '100%', alignSelf: 'center', position: 'absolute', borderRadius: 13, opacity: 0.6 }}
                                                    source={item.item.pageColor == 'default' ? colorScheme == 'dark' ? require('../assets/gradientregulardark.png') : require('../assets/gradientregular.png') :
                                                        item.item.pageColor === '#FFBC01' ? require('../assets/gradient.png') : item.item.pageColor === '#BB42AF' ? require('../assets/gradientpink.png') : item.item.pageColor === '#4FC73B' ? require('../assets/gradientgreen.png') : require('../assets/gradientblue.png')} />
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
                                            </TouchableOpacity>)}
                                        style={{ width: 100 }}
                                    />
                                    <FlatList data={dataGrid2}
                                        scrollEnabled={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                                        keyExtractor={item => item.id}
                                        renderItem={(item) => (
                                            <TouchableOpacity style={{ width: 150, alignSelf: 'flex-end', height: 150, marginTop: 20, borderRadius: 15, borderWidth: 2, borderColor: 'gray', marginEnd: 20 }}
                                                activeOpacity={0.6} onPress={() => {
                                                    setFabVisible(false)
                                                    props.navigation.navigate("CreateNote", {
                                                        id: item.item.id,
                                                        page: 'Home'
                                                    })
                                                }}>

                                                <ImageBackground style={{ width: '100%', height: '100%', alignSelf: 'center', position: 'absolute', borderRadius: 13, opacity: 0.6 }}
                                                    source={item.item.pageColor == 'default' ? colorScheme == 'dark' ? require('../assets/gradientregulardark.png') : require('../assets/gradientregular.png') :
                                                        item.item.pageColor === '#FFBC01' ? require('../assets/gradient.png') : item.item.pageColor === '#BB42AF' ? require('../assets/gradientpink.png') : item.item.pageColor === '#4FC73B' ? require('../assets/gradientgreen.png') : require('../assets/gradientblue.png')} />
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
                                            </TouchableOpacity>)}
                                        style={{ width: 100 }}
                                    />
                                </View>
                            </ScrollView>
                            :
                            <View style={{ marginTop: 10, flex: 1 }}>
                                <Text style={{ alignSelf: 'flex-start', marginStart: 15, fontSize: 25, fontWeight: 'bold' }}>All Notes</Text>
                                <SwipeListView
                                    data={data}
                                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                                        setRefreshing(true)
                                        SelectData()
                                    }} />}
                                    renderItem={renderItem}
                                    renderHiddenItem={renderHiddenItem}
                                    leftOpenValue={75}
                                    rightOpenValue={-150}
                                    style={{ width: screenWidth - 20, marginTop: 20 }}
                                    onRowDidOpen={onRowDidOpen}
                                    leftActivationValue={200}
                                    stopLeftSwipe={150}
                                    rightActivationValue={-300}
                                    leftActionValue={0}
                                    rightActionValue={-500}
                                    onLeftAction={onLeftAction}
                                    onRightAction={onRightAction}
                                    onLeftActionStatusChange={onLeftActionStatusChange}
                                    onRightActionStatusChange={onRightActionStatusChange}
                                />
                            </View>

                        :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <AnimatedLottieView
                                source={require('../assets/emptyanim.json')}
                                style={{ width: '100%' }}
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
                            <Text style={{ color: 'white', fontFamily: 'mulish', marginTop: 50, fontSize: 25, textAlign: 'center', width: screenWidth - 100 }}>Long press the note for more options!</Text>
                        </View>
                    </Modal>
                </Portal>

                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: screenWidth }}>
                    <Tooltip title="Browse Internet">
                        <TouchableOpacity style={{ marginStart: 35, marginBottom: 10 }} onPress={() => {
                            setFabVisible(false)
                            props.navigation.navigate("Browser")
                        }}>
                            <Ionicons name="globe-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                    </Tooltip>

                    <Portal>
                        <Modal visible={modalLongPress} onDismiss={() => { setModalLongPress(false) }} style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{
                                width: 250, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 15,
                                alignItems: 'center', justifyContent: 'space-evenly', opacity: 0.8
                            }}>
                                <TouchableOpacity style={{
                                    width: '100%', height: 40, alignItems: 'center',
                                    flexDirection: 'row', justifyContent: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    PinNote(lognPressId)
                                    setModalLongPress(false)
                                }}>
                                    <MaterialIcons name="pin-outline" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                    <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Pin Note</Text>
                                </TouchableOpacity>
                                <Divider style={{ width: '100%', height: 0.7 }} />
                                <TouchableOpacity style={{
                                    width: '100%', height: 40, alignItems: 'center',
                                    flexDirection: 'row', justifyContent: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    StarNote(lognPressId)
                                    setModalLongPress(false)
                                }}>
                                    <MaterialComIcon name="star-border" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                    <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Star Note</Text>
                                </TouchableOpacity>
                                <Divider style={{ width: '100%', height: 0.7 }} />
                                <TouchableOpacity style={{
                                    width: '100%', height: 40, alignItems: 'center',
                                    flexDirection: 'row', justifyContent: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    setModalLongPress(false)
                                    ReadingModeCheck(lognPressId)
                                }}>
                                    <MaterialComIcon name="menu-book" size={20} color="#FFBC01" style={{ marginStart: -5, marginEnd: 5 }} />
                                    <Text style={{ fontWeight: 'bold', color: '#FFBC01' }}>Open in Reading Mode</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                    </Portal>


                    <Portal>
                        <FAB.Group
                            open={open}
                            visible={fabVisible}
                            icon={open ? 'note-edit' : 'plus'}
                            fabStyle={{ backgroundColor: '#FFBC01' }}
                            color="white"
                            label={open ? 'New note' : null}
                            actions={[
                                {
                                    icon: 'close',
                                    onPress: () => setState({ open: false }),
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                },
                                {
                                    icon: 'clipboard-list',
                                    label: 'TO-DO List',
                                    onPress: () => {
                                        setFabVisible(false)
                                        props.navigation.navigate('ToDo')
                                    },
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
                                },
                                {
                                    icon: 'star',
                                    label: 'Starred Notes',
                                    onPress: () => CheckFirstTimeStarred(),
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                },
                                {
                                    icon: 'bell',
                                    label: 'Set Reminder',
                                    onPress: () => {
                                        CheckFirstTimeReminder()
                                    },
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                },
                                
                                {
                                    icon: 'emoticon-happy-outline',
                                    label: 'Moodify',
                                    onPress: () => console.log('Mood'),
                                    style: { backgroundColor: '#FFBC01' },
                                    color: 'white'
                                },
                            ]}
                            onStateChange={onStateChange}
                            onPress={() => {
                                if (open) {
                                    setFabVisible(false)
                                    props.navigation.navigate('CreateNote')
                                }
                            }}
                        />
                    </Portal>

                </View>


            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f4f4f4',
        flex: 1,
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        backgroundColor: '#BFBFBF',
        borderRadius: 5,
        height: 60,
        margin: 5,
        marginBottom: 15,
        shadowColor: '#999',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    rowFrontVisible: {
        borderRadius: 5,
        height: 60,
        padding: 10,
        marginBottom: 15,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#3BBC1A',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        margin: 5,
        marginBottom: 15,
        borderRadius: 5,
    },
    backRightBtn: {
        alignItems: 'flex-end',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
        paddingRight: 17,
    },
    backRightBtnLeft: {
        backgroundColor: '#3BBC1A',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    trash: {
        height: 25,
        width: 25,
        marginRight: 7,
    },
    title: {
        marginBottom: 5,
    },
    details: {
    },
});

export default HomeScreen