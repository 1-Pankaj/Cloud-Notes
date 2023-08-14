import React, { useCallback, useEffect, useState } from "react";
import { Animated, Appearance, Dimensions, FlatList, ImageBackground, StyleSheet, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Appbar, Button, Dialog, IconButton, Portal, Text, TextInput, Tooltip } from "react-native-paper";
import * as SQLite from 'expo-sqlite'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from "expo-font";

import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialComIcon from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SwipeListView } from "react-native-swipe-list-view";
import AnimatedLottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";

const screenWidth = Dimensions.get("screen").width

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")


const HomeScreen = (props) => {
    const [visible, setVisible] = useState(false);
    const [dialogText, setDialogText] = useState("")

    const isFocused = useIsFocused()
    const showDialog = (prop) => {
        setVisible(true)
        setDialogText(prop)
    }

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

    const hideDialog = () => setVisible(false);
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const [textData, setText] = useState("")
    const [data, setData] = useState([])
    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL )", [],
                (sql, rs) => {

                },
                error => {
                    console.log("Error");
                })
        })
    }
    const SelectData = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM notes ORDER BY id DESC", [],
                (sql, rs) => {
                    setData([])
                    let results = []
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            if (item.note.length >= 25) {

                                results.push({ id: item.id, title: item.title, note: item.note.slice(0, 25) + "...", date: item.date, time: item.time })
                            }
                            else if (item.title.length >= 15) {

                                results.push({ id: item.id, title: item.title.slice(0, 15) + "...", note: item.note, date: item.date, time: item.time })
                            } else {
                                results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time })
                            }
                        }

                        setData(results)
                    } else {
                        setData(null)
                    }
                },
                error => {
                    console.log("Error");
                })
        })
    }




    const DropTable = () => {
        db.transaction((tx) => {
            tx.executeSql("DROP TABLE notes", [],
                (sql, rs) => {
                    console.log("Dropped");

                })
        })
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
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                removeRow()
            })
        }
        return (
            <Animated.View style={{ height: rowHeightAnimatedValue }}>
                <TouchableHighlight style={[styles.rowFrontVisible, {
                    backgroundColor: colorScheme === "dark" ? "#202020" : "#fff"
                }]} onPress={() => {props.navigation.navigate("CreateNote", {
                    id:data.item.id
                })}} underlayColor={colorScheme === "dark" ? "#303030" : "#E3E3E3"}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View>
                        <Text style={[styles.title, { fontFamily: 'mulish', fontSize: 17 }]} numberOfLines={1}>
                            {data.item.title}
                        </Text>
                        <Text style={[styles.details, { fontFamily: 'mulish' }]} numberOfLines={1}>
                            {data.item.note}
                        </Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:"center"}}>
                        <View style={{flexDirection:'column', alignItems:'center'}}>
                        <Text style={[styles.details,{fontFamily:'mulish'}]}>{data.item.date.slice(0,4)}</Text>
                        <Text style={[styles.details, {fontFamily:'mulish'}]}>{data.item.time.slice(0,4)}</Text>
                        </View>
                        <MaterialComIcon name="arrow-forward-ios" size={20} color="#FFBC01"
                        style={{marginLeft:20, marginEnd:10}}/>                        
                    </View>
                    </View>
                </TouchableHighlight>
            </Animated.View>
        )
    }



    const DeleteFromTable = (id) => {
        db.transaction(tx => {
            tx.executeSql(`DELETE FROM notes WHERE id = ${id}`, [],
                (sq, rs) => {
                    console.log("deleted");
                    SelectData()
                },
                error => {
                    console.log(error);
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
                useNativeDriver: false
            }).start(()=>{
                DeleteFromTable(props.data.item.id)
            });
        }

        return (
            <Animated.View style={[styles.rowBack, { height: rowHeightAnimatedValue }]}>
                <Text style={{ color: 'black' }}>Left</Text>

                <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]}
                    onPress={() => { showDialog("Archived") }}>
                    <View style={styles.trash}>


                        <Ionicons name="archive" color="white" size={20} />
                    </View>
                </TouchableOpacity>
                <Animated.View style={[styles.backRightBtn, styles.backRightBtnRight, {
                    flex: 1, width: rowActionAnimatedValue
                }]}>
                    <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]}
                        onPress={() => {
                            showDialog("Are you sure you want to delete?")

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
                </Animated.View>
                
            </Animated.View>
        )
    }

    const renderItem = (data, rowMap) => {
        const rowHeightAnimatedValue = new Animated.Value(73)
        return (
            <>
            <VisibleItem data={data} rowHeightAnimatedValue={rowHeightAnimatedValue} removeRow={() => { DeleteFromTable(data.item.id) }} 
                
            />
            <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Content>
                            <Text variant="bodyMedium">{dialogText}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>{hideDialog()}}>Cancel</Button>
                            <Button onPress={()=>{DeleteFromTable(data.item.id)
                            hideDialog()}}>Delete</Button>

                        </Dialog.Actions>
                    </Dialog>
                </Portal>
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

    Appearance.addChangeListener(()=>{
        setColorScheme(Appearance.getColorScheme())
    })



    useEffect(() => {
        console.log("Called");
        if(isFocused){
            CreateTable()
            SelectData()      
        }
        
    }, [props, isFocused])



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





    return (
        <SafeAreaView style={[Styles.container, { width: "100%", height: '100%' }]} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { justifyContent: 'space-around' }]}>
                <View style={{
                    flexDirection: 'row', width: screenWidth, alignItems: 'center', padding: 15,
                    justifyContent: 'space-between'
                }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { props.navigation.navigate("Directory") }}>
                        <MaterialComIcon name="arrow-back-ios" size={22} color="#FFBC01" />
                        <Text style={{
                            color: '#FFBC01', fontFamily: 'mulish',
                            fontSize: 18
                        }}>
                            Cloud Notes
                        </Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' }}>
                        <TouchableOpacity>
                            <MaterialIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01"
                                style={{ marginEnd: 5 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                {
                    data ?
                        <SwipeListView
                            data={data}
                            renderItem={renderItem}
                            renderHiddenItem={renderHiddenItem}
                            leftOpenValue={75}
                            rightOpenValue={-150}
                            disableRightSwipe
                            style={{ width: screenWidth - 20, marginTop: 20 }}
                            onRowDidOpen={onRowDidOpen}
                            leftActivationValue={100}
                            rightActivationValue={-200}
                            leftActionValue={0}
                            rightActionValue={-500}
                            onLeftAction={onLeftAction}
                            onRightAction={onRightAction}
                            onLeftActionStatusChange={onLeftActionStatusChange}
                            onRightActionStatusChange={onRightActionStatusChange}
                        />
                        :
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <AnimatedLottieView
                                source={require('../assets/emptyanim.json')}
                                style={{ width: '100%' }}
                                autoPlay
                            />
                            <Text style={{ fontFamily: 'mulish', fontSize: 17 }}>Oops, CloudNotes is empty!</Text>
                        </View>

                }




                <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', width: screenWidth }}>
                    <Tooltip title="Browse Internet">
                        <TouchableOpacity style={{ marginStart: 35, marginBottom: 10 }} onPress={()=>{
                            props.navigation.navigate("Browser")
                        }}>
                            <Ionicons name="globe-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                    </Tooltip>
                    <Tooltip title="Create Note">
                        <TouchableOpacity style={{ marginEnd: 35, marginBottom: 10 }} onPress={() => { props.navigation.navigate("CreateNote") }}>
                            <Ionicons name="create-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                    </Tooltip>
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
        backgroundColor: 'green',
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
        backgroundColor: 'green',
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
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#666',
    },
    details: {
        fontSize: 12,
        color: '#999',
    },
});

export default HomeScreen