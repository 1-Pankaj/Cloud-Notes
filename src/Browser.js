import React, { useEffect, useRef, useState } from "react";
import { Animated, Appearance, BackHandler, Dimensions, Easing, FlatList, TextInput, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { ProgressBar, Text } from "react-native-paper";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";
import { ExpandableSection } from "react-native-ui-lib";

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const db = SQLite.openDatabase("CloudNotes.db")

const Browser = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [url, setUrl] = useState("")
    const [uriWeb, setUriWeb] = useState("")
    const [titleText, setTitleText] = useState("")
    const [canGoBack, setCanGoBack] = useState(false)
    const [canGoForward, setCanGoForward] = useState(false)
    const [loading, setLoading] = useState(false)
    const webviewRef = useRef(null)
    const [progress, setProgress] = useState(0)
    const [history, setHistory] = useState([])
    const [bottom, setBottom] = useState(true)

    const [open, setOpen] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)
    const animatedTranslate = new Animated.Value(0)
    const animatedHeight = new Animated.Value(600)
    const [lastValue, setLastValue] = useState(null)
    const [textInputFocused, setTextInputFocused] = useState(false)

    const HandleScroll = (y) => {
        if (y > 5) {
            Animated.timing(animatedHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(animatedTranslate, {
                    toValue: bottom ? 350 : -350,
                    duration: 250,
                    useNativeDriver: false
                }).start()
            })

        }
        if (y < -5) {
            Animated.timing(animatedHeight, {
                toValue: 600,
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(animatedTranslate, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false
                }).start()
            })
        }


    }

    const GetUrlFromDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT title from bookmark where title = (?)", [uriWeb],
                (sql, rs) => {
                    if (rs.rows.length == 0) {

                    }
                    else if (rs.rows._array[0].title == uriWeb) {
                        setBookmarked(true)
                    }
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM history ORDER BY id DESC", [],
                (sql, rs) => {
                    if (rs.rows._array) {
                        setHistory(null)
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            results.push({ id: item.id, url: item.url })
                        }
                        setHistory(results)
                        results = []
                    }
                },
                error => {
                })
        })
    }

    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS bookmark(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                },
                error => {
                })
        })
    }

    const AddUrlToDatabase = (url) => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO history (url) VALUES (?)", [url],
                (sql, rs) => {
                    GetUrlFromDatabase()
                },
                error => {
                })
        })
    }
    const DropTable = () => {
        db.transaction(tx => {
            tx.executeSql("DROP TABLE history", [],
                (sql, rs) => {
                    CreateTable()
                    GetUrlFromDatabase()
                },
                error => {
                })
        })
    }

    const BrowserFun = (prop) => {
        setTitleText(prop.title)
        setUriWeb(prop.url)
        setUrl(prop.url)

        setCanGoBack(prop.canGoBack)
        setCanGoForward(prop.canGoForward)

    }

    const RemoveUrl = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM history WHERE ID = (?)", [id],
                (sql, rs) => {
                    GetUrlFromDatabase()
                },
                error => {
                })
        })
    }
    function handleBackButtonClick() {
        if (canGoBack) {
            webviewRef.current.goBack()
            return true
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
    }, [webviewRef.current])
    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })


    useEffect(() => {
        if (props.route.params === undefined) {

        } else {
            if (props.route.params.page == 'Bookmark') {
                setTimeout(() => {
                    setUriWeb(props.route.params.url.trim())
                }, 1500);
            }
            else if (props.route.params.page == 'History') {
                setTimeout(() => {
                    setUriWeb(props.route.params.url.trim())
                }, 1500);
            }
            else if (props.route.params.page == 'GlobalSearch') {
                setTimeout(() => {
                    if (props.route.params.url.trim().includes('http' || 'https')) {
                        setUriWeb(props.route.params.url.trim())
                    } else {
                        setUriWeb("https://www.google.com/search?q=" + props.route.params.url.trim())
                    }
                }, 1500);
            }
        }
    }, [])



    const isFocused = useIsFocused()
    useEffect(() => {
        CreateTable()
        GetUrlFromDatabase()
    }, [isFocused])


    const SetBookmark = () => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO bookmark (title) values(?)`, [uriWeb],
                (sql, rs) => {
                    setBookmarked(true)
                }, error => {
                })
        })
    }

    const RemoveBookmark = () => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM bookmark where title = (?)', [uriWeb],
                (sql, rs) => {
                    setBookmarked(false)
                }, error => {
                })
        })
    }



    return (
        <SafeAreaView style={Styles.container}>
            <View style={Styles.container}>
                {bottom ?
                    null
                    :
                    <Animated.View style={{
                        maxHeight: animatedHeight, transform: [{
                            translateY: animatedTranslate
                        }]
                    }}>
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', }}>
                            <TouchableOpacity onPress={() => {
                                canGoBack ? webviewRef.current.goBack() : null
                            }} style={{}}>
                                <MaterialIcons name="arrow-back-ios" size={25} color={canGoBack ? "#FFBC01" : "gray"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                canGoForward ? webviewRef.current.goForward() : null
                            }} style={{}}>
                                <MaterialIcons name="arrow-forward-ios" size={25} color={canGoForward ? "#FFBC01" : "gray"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setUrl('')
                                setUriWeb('')
                            }}>
                                <MaterialCommIcons name="home-outline" size={30} color="#FFBC01" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setOpen(!open) }} style={{}}>
                                <MaterialCommIcons name={open ? "close" : "history"} size={27} color="#FFBC01" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                bookmarked ?
                                    RemoveBookmark()
                                    :
                                    SetBookmark()
                            }} style={{}}>
                                <MaterialIcons name={bookmarked ? "bookmark" : "bookmark-outline"} size={27} color={bookmarked ? '#FFBC01' : "gray"} />
                            </TouchableOpacity>
                        </View>
                        <ExpandableSection
                            expanded={open}>
                            <View style={{ height: 400, marginTop: 10, marginBottom: 20 }}>

                                <View style={{ alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                    <Text style={{
                                        marginStart: 15, fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25,
                                    }}>
                                        History
                                    </Text>
                                    <TouchableOpacity style={{ marginEnd: 15 }} onPress={() => { DropTable() }}>
                                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: "#FFBC01" }}>
                                            Clear all
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={history}
                                    keyExtractor={item => item.id}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => {
                                            setUriWeb(item.item.url)
                                            setOpen(!open)
                                        }}>
                                            <View style={{
                                                width: screenWidth - 20, height: 30, backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexDirection: 'row'
                                            }}>
                                                <Text style={{ paddingHorizontal: 10, fontFamily: 'mulish', color: 'gray', fontSize: 13, marginEnd: 20 }} numberOfLines={1}>{item.item.url.slice(0, 40)}</Text>
                                                <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => { RemoveUrl(item.item.id) }}>
                                                    <Ionicons name="close" size={20} color={colorScheme === "dark" ? "lightgray" : "#202020"} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />

                            </View>
                        </ExpandableSection>
                        <View style={{
                            width: screenWidth - 35, height: 45, flexDirection: 'row', backgroundColor: colorScheme === "dark" ? "#303030" : "#e3e3e3", borderRadius: 10,
                            alignItems: 'center', alignSelf: 'center', marginTop: 15, marginBottom: 10, justifyContent: 'space-between',
                        }}>
                            <TouchableOpacity style={{ marginStart: 15 }} onPress={() => { setBottom(true) }}>
                                <MaterialIcons name="arrow-drop-down" size={25} color='#FFBC01' />
                            </TouchableOpacity>
                            <TextInput placeholder="https://example.com/" selectionColor="#FFBC01" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                                style={{
                                    borderRadius: 10, flex: 1,
                                    opacity: 0.7, color: colorScheme === "dark" ? "white" : "black", fontSize: 13,
                                    fontFamily: 'mulish', textAlign: textInputFocused ? 'left' : 'center', paddingHorizontal: 20
                                }}
                                selectTextOnFocus
                                cursorColor="#FFBC01"
                                multiline={false} onFocus={() => { setTextInputFocused(true) }}
                                onChangeText={setUrl}
                                value={textInputFocused ? url : titleText} onBlur={() => {
                                    if (url.includes('http' || 'https')) {
                                        setUriWeb(url)
                                        AddUrlToDatabase(url)
                                    }
                                    else if (url.includes('.')) {
                                        setUriWeb('https://' + url)
                                        AddUrlToDatabase(url)
                                    }
                                    else {
                                        setUriWeb("https://www.google.com/search?q=" + url)
                                        AddUrlToDatabase("https://www.google.com/search?q=" + url)
                                    }
                                    setTextInputFocused(false)
                                }}
                            />

                            <TouchableOpacity onPress={() => {
                                loading ? webviewRef.current.stopLoading() : webviewRef.current.reload()
                            }} style={{ marginEnd: 15 }}>
                                <MaterialCommIcons name={loading ? "close" : "reload"} size={25} color="#FFBC01" />
                            </TouchableOpacity>
                        </View>
                        <ProgressBar progress={progress} style={{ width: screenWidth, height: 2 }} />
                    </Animated.View>}

                <WebView
                    style={{ flex: 1, width: screenWidth, alignItems: 'center', justifyContent: 'center' }}
                    source={{ uri: uriWeb }}
                    javaScriptEnabled
                    pullToRefreshEnabled
                    showsVerticalScrollIndicator={false}
                    ref={webviewRef}
                    forceDarkOn={colorScheme === 'dark' ? true : false}
                    allowFileAccess
                    onScroll={(e) => {
                        HandleScroll(e.nativeEvent.velocity.y.toFixed())
                    }}
                    sharedCookiesEnabled
                    thirdPartyCookiesEnabled
                    onLoadStart={() => { setLoading(true) }}
                    onLoadEnd={() => {
                        setLoading(false)
                        setProgress(0)
                    }}
                    allowsBackForwardNavigationGestures
                    allowsLinkPreview
                    scrollEnabled
                    onLoadProgress={(tx) => { setProgress(tx.nativeEvent.progress) }}
                    onNavigationStateChange={(tx) => { BrowserFun(tx) }}
                    onLoad={(tx) => { }}
                    setSupportMultipleWindows={false}

                />
                {bottom ?
                    <Animated.View style={{
                        width: screenWidth, alignItems: 'center', maxHeight: animatedHeight, transform: [{
                            translateY: animatedTranslate
                        }]
                    }}>
                        <ProgressBar progress={progress} style={{ width: screenWidth, height: 2 }} />
                        <View style={{
                            width: screenWidth - 35, height: 45, flexDirection: 'row', backgroundColor: colorScheme === "dark" ? "#303030" : "#e3e3e3", borderRadius: 10,
                            alignItems: 'center', alignSelf: 'center', marginVertical: 10, justifyContent: 'space-between'
                        }}>
                            <TouchableOpacity style={{ marginStart: 15 }} onPress={() => { setBottom(false) }}>
                                <MaterialIcons name="arrow-drop-up" size={25} color='#FFBC01' />
                            </TouchableOpacity>
                            <TextInput placeholder="https://example.com/" selectionColor="#FFBC01" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                                style={{
                                    borderRadius: 10, flex: 1,
                                    opacity: 0.7, color: colorScheme === "dark" ? "white" : "black", fontSize: 13,
                                    fontFamily: 'mulish', textAlign: textInputFocused ? 'left' : 'center', paddingHorizontal: 20
                                }}
                                selectTextOnFocus
                                cursorColor="#FFBC01"
                                multiline={false} onFocus={() => { setTextInputFocused(true) }}
                                onChangeText={setUrl}
                                value={textInputFocused ? url : titleText} onBlur={() => {
                                    if (url.includes('http' || 'https')) {
                                        setUriWeb(url)
                                        AddUrlToDatabase(url)
                                    }
                                    else if (url.includes('.')) {
                                        setUriWeb('https://' + url)
                                        AddUrlToDatabase(url)
                                    }
                                    else {
                                        setUriWeb("https://www.google.com/search?q=" + url)
                                        AddUrlToDatabase("https://www.google.com/search?q=" + url)
                                    }
                                    setTextInputFocused(false)
                                }}
                            />

                            <TouchableOpacity onPress={() => {
                                loading ? webviewRef.current.stopLoading() : webviewRef.current.reload()
                            }} style={{ marginEnd: 15 }}>
                                <MaterialCommIcons name={loading ? "close" : "reload"} size={25} color="#FFBC01" />
                            </TouchableOpacity>
                        </View>
                        <ExpandableSection top
                            expanded={open}>
                            <View style={{ height: 400 }}>

                                <View style={{ alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                    <Text style={{
                                        marginStart: 15, fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25,
                                    }}>
                                        History
                                    </Text>
                                    <TouchableOpacity style={{ marginEnd: 15 }} onPress={() => { DropTable() }}>
                                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: "#FFBC01" }}>
                                            Clear all
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={history}
                                    keyExtractor={item => item.id}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => {
                                            setUriWeb(item.item.url)
                                            setOpen(!open)
                                        }}>
                                            <View style={{
                                                width: screenWidth - 20, height: 30, backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexDirection: 'row'
                                            }}>
                                                <Text style={{ paddingHorizontal: 10, fontFamily: 'mulish', color: 'gray', fontSize: 13, marginEnd: 20 }} numberOfLines={1}>{item.item.url}</Text>
                                                <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => { RemoveUrl(item.item.id) }}>
                                                    <Ionicons name="close" size={20} color={colorScheme === "dark" ? "lightgray" : "#202020"} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />

                            </View>
                        </ExpandableSection>
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', marginTop: 5, justifyContent: 'space-around' }}>

                            <TouchableOpacity onPress={() => {
                                canGoBack ? webviewRef.current.goBack() : null
                            }} style={{}}>
                                <MaterialIcons name="arrow-back-ios" size={25} color={canGoBack ? "#FFBC01" : "gray"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                canGoForward ? webviewRef.current.goForward() : null
                            }} style={{}}>
                                <MaterialIcons name="arrow-forward-ios" size={25} color={canGoForward ? "#FFBC01" : "gray"} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setUrl('')
                                setUriWeb('')
                            }}>
                                <MaterialCommIcons name="home-outline" size={30} color="#FFBC01" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setOpen(!open) }} style={{}}>
                                <MaterialCommIcons name={open ? "close" : "history"} size={27} color="#FFBC01" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                bookmarked ?
                                    RemoveBookmark()
                                    :
                                    SetBookmark()
                            }} style={{}}>
                                <MaterialIcons name={bookmarked ? "bookmark" : "bookmark-outline"} size={27} color={bookmarked ? '#FFBC01' : "gray"} />
                            </TouchableOpacity>
                        </View>


                    </Animated.View>
                    :
                    null}
            </View>
        </SafeAreaView>
    )

}

export default Browser