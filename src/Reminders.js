import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { Appearance, BackHandler, Dimensions, FlatList, ToastAndroid, TouchableOpacity, View } from "react-native";
import * as Device from 'expo-device'
import { Button, DataTable, Modal, Portal, Text, TextInput } from "react-native-paper";
import { TimePickerModal } from "react-native-paper-dates";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { useIsFocused } from "@react-navigation/native";
import AnimatedLottieView from "lottie-react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import { Drawer } from "react-native-ui-lib";

const screenWidth = Dimensions.get('window').width

const db = SQLite.openDatabase('CloudNotes.db')

const Reminders = (props) => {

    const [visible, setVisible] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [titleText, setTitleText] = useState('')
    const [messageText, setMessageText] = useState('')
    const [id, setId] = useState('')
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [recordModal, setRecordModal] = useState(false)
    const [taskData, setTaskData] = useState(null)
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([2, 3, 4, 8]);
    const [itemsPerPage, onItemsPerPageChange] = useState(
        numberOfItemsPerPageList[0]
    );
    const [title, setTitle] = useState('')
    const [extra, setExtra] = useState('')
    const [time, setTime] = useState('')

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState(false);
    const [data, setData] = useState(null)
    const notificationListener = useRef();
    const responseListener = useRef();

    async function cancelNotification(notifId) {
        await Notifications.cancelScheduledNotificationAsync(notifId);
    }

    async function schedulePushNotification(hours, minutes, title, message, settime) {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: message,
            },
            trigger: {
                hour: hours,
                minute: minutes,
                repeats: true
            },
        });
        const time = hours + ":" + minutes
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO reminder (title,message,notificationid,time,settime) values (?,?,?,?,?)", [title.trim(), message.trim(), id, time, settime],
                (sql, rs) => {
                    sql.executeSql("INSERT INTO reminderRecord(title, message, time) values(?,?,?)", [title.trim(), message.trim(), time],
                        (sql, rs) => {
                            ToastAndroid.show("Reminder Set", ToastAndroid.SHORT)
                            GetData()
                            setTitleText('')
                            setMessageText('')
                            setId('')
                        }, error => {
                        })
                }, error => {
                })
        })
        return id
    }


    const registerForPushNotificationsAsync = async () => {
        let token;
        if (Device.isDevice) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                alert("Failed to get push token for push notification!");
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
        } else {
            ToastAndroid.show("Notifications not supported", ToastAndroid.SHORT)
        }

        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                sound: true,
                lightColor: "#FF231F7C",
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                bypassDnd: true,
            });
        }

        return token;
    }

    const isFocused = useIsFocused()

    const DeleteReminder = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM reminder WHERE id = (?)", [id],
                (sql, rs) => {
                    cancelNotification(rs.rows._array[0].notificationid)
                    sql.executeSql("DELETE FROM reminder WHERE id = (?)", [id],
                        (sql, rs) => {
                            setData(null)
                            ToastAndroid.show("Deleted", ToastAndroid.SHORT)
                            GetData()
                        }, error => {
                        })
                }, error => {
                })
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

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS reminder(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(100) NOT NULL, message VARCHAR(100) NOT NULL, notificationid VARCHAR(50) NOT NULL, time VARCHAR(20), settime VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM reminder", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                setData(null)
                            } else {
                                let results = []
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let title = rs.rows._array[i].title
                                    let message = rs.rows._array[i].message
                                    let notificationid = rs.rows._array[i].notificationid
                                    let time = rs.rows._array[i].time
                                    let settime = rs.rows._array[i].settime

                                    results.push({ id: id, title: title, message: message, notificationid: notificationid, time: time, settime: settime })
                                }
                                setData(results)
                            }
                        }, error => {
                        })
                }, error => {
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS reminderRecord (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, message VARCHAR(500) NOT NULL, time VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM reminderRecord", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let results = []
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let title = rs.rows._array[i].title
                                    let message = rs.rows._array[i].message
                                    let time = rs.rows._array[i].time

                                    results.push({ id: id, title: title, message: message, time: time })
                                }
                                setTaskData(results)
                            } else {
                                setTaskData(null)
                            }
                        })
                }, error => {
                })
        })
    }

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, taskData ? taskData.length : 0);

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage])


    const ClearTaskRecord = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM reminderRecord", [],
                (sql, rs) => {
                    GetData()
                    ToastAndroid.show("Reminder Records cleared", ToastAndroid.SHORT)
                }, error => {
                })
        })
    }

    useEffect(() => {
        GetData()
    }, [isFocused, id])


    useEffect(() => {
        registerForPushNotificationsAsync().then((token) =>
            setExpoPushToken(token)
        );

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                setTimeout(() => {
                    if (response.notification.request.identifier == undefined) {
                    } else {
                        DeleteReminder(response.notification.request.identifier)
                    }
                }, 200);
            });

        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current
            );
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const onDismiss = React.useCallback(() => {
        setVisible(false)
    }, [setVisible])

    const onConfirm = (data) => {
        setVisible(false)
        schedulePushNotification(data.hours, data.minutes, titleText, messageText, new Date().toLocaleTimeString())
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
        <View style={Styles.container} onLayout={onLayoutRootView}>
            <TimePickerModal
                visible={visible}
                onDismiss={onDismiss}
                onConfirm={onConfirm}
                hours={24}
                use24HourClock={true}
                minutes={0}
                animationType="slide"
            />
            <View style={{
                width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                padding: 8
            }}>
                <TouchableOpacity style={{ marginStart: 10, marginTop: 20, marginBottom: 20 }} onPress={() => { props.navigation.goBack() }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                        <Text style={{ fontSize: 23, marginBottom: 2, fontWeight: 'bold', color: '#FFBC01' }}>Reminders</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    if (taskData) {
                        setRecordModal(true)
                    } else {
                        ToastAndroid.show("No records!", ToastAndroid.SHORT)
                    }
                }}>
                    <MaterialIcons name="history" size={25} color="#FFBC01" style={{ marginEnd: 20, marginTop: 20, marginBottom: 20 }} />
                </TouchableOpacity>
            </View>
            {data ?
                <View style={{ width: screenWidth, alignItems: 'center', padding: 8, flex: 1 }}>
                    <Text style={{
                        fontSize: 17, alignSelf: 'flex-start', marginStart: 25, marginTop: 10, color: colorScheme === 'dark' ? 'white' : '#101010',
                        fontFamily: 'mulish'
                    }}>All Reminders</Text>
                    <FlatList data={data}
                        style={{ marginTop: 30, flex: 1 }}
                        keyExtractor={item => item.id}
                        renderItem={(item) => {
                            return (
                                <Drawer style={{marginTop:10, borderRadius:10}}
                                fullRightThreshold={0.7} fullSwipeRight onFullSwipeRight={()=>{DeleteReminder(item.item.id)}}
                                rightItems={[{text:'Delete', background:'red', onPress:()=>{DeleteReminder(item.item.id)}}]} disableHaptic>
                                    <View style={{
                                        width: screenWidth - 50, paddingVertical: 10, backgroundColor: colorScheme === 'dark' ? '#212121' : 'white', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#303030' : '#e3e3e3',
                                    }}>
                                        <View style={{ marginStart: 15, marginTop: 5, marginBottom: 5, marginEnd: 15 }}>
                                            <Text style={{ fontSize: 17, fontWeight: 'bold', maxWidth: 200 }} numberOfLines={2}>{item.item.title.trim()}</Text>
                                            <Text style={{ fontSize: 12, marginTop: 2, maxWidth: 230 }}>{item.item.message.trim()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                                            <View style={{ marginEnd: 10 }}>
                                                <Text style={{ fontSize: 10, marginEnd: 10 }}>Upcoming</Text>
                                                <Text style={{ alignSelf: 'center' }}>{item.item.time}</Text>
                                            </View>
                                            <TouchableOpacity style={{ alignSelf: 'flex-start', marginEnd: 15 }} onPress={() => { DeleteReminder(item.item.id) }}>
                                                <MaterialIcons name="close" size={15} color={colorScheme === 'dark' ? 'white' : '#101010'} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Drawer>
                            )
                        }}
                    />

                    <Button mode="contained" icon='plus' textColor="white" onPress={() => { setModalVisible(true) }}>Create New</Button>
                </View>
                :
                <View style={{ flex: 1, justifyContent: 'space-evenly', width: screenWidth, alignItems: 'center' }}>
                    <AnimatedLottieView
                        source={require('../assets/reminderanim.json')}
                        autoPlay loop style={{ width: screenWidth }} renderMode="HARDWARE" hardwareAccelerationAndroid
                    />
                    <Text>No Reminders, Start by creating one!</Text>
                    <Button icon='plus' mode="contained" textColor="white" onPress={() => { setModalVisible(true) }}>Create New</Button>
                </View>}
            <Portal>
                <Modal visible={modalVisible}
                    dismissable={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ alignItems: 'center', width: screenWidth - 50, height: 300, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 30, justifyContent: 'space-evenly' }}>
                        <TextInput label='Reminder' style={{ width: '90%', backgroundColor: colorScheme === 'dark' ? '#505050' : '#e3e3e3' }} value={titleText} onChangeText={(txt) => { setTitleText(txt) }} maxLength={40} numberOfLines={1} />
                        <TextInput label='Reminder Message (Optional)' style={{ width: '90%', backgroundColor: colorScheme === 'dark' ? '#505050' : '#e3e3e3' }} value={messageText} onChangeText={(txt) => { setMessageText(txt) }} maxLength={100} numberOfLines={1} />
                        <Text style={{ fontSize: 11, width: '90%', textAlign: 'center' }}>On Next page, Time set in Reminder is in 24 hour format, make sure to put correct timing!</Text>
                        <View style={{ alignItems: 'center', alignSelf: 'flex-end', flexDirection: 'row' }}>
                            <Button onPress={() => {
                                setModalVisible(false)
                            }}>CANCEL</Button>
                            <Button style={{ marginEnd: 10 }}
                                onPress={() => {
                                    setModalVisible(false)
                                    setVisible(true)
                                }}>OK</Button>
                        </View>

                    </View>
                </Modal>
            </Portal>
            <Modal visible={recordModal} dismissable dismissableBackButton onDismiss={() => { setRecordModal(false) }} style={{ alignItems: 'center', justifyContent: 'flex-end', elevation: 20 }}>
                <View style={{
                    width: screenWidth, paddingVertical: 20, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white',
                    borderTopEndRadius: 20, borderTopStartRadius: 20, alignItems: 'center', justifyContent: 'space-evenly',
                }}>
                    {taskData ?
                        <View style={{ width: screenWidth, alignItems: 'center', alignSelf: 'center', marginTop: 30, marginBottom: 30 }}>
                            <View style={{ alignItems: 'center', width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginStart: 20, marginBottom: 20, marginEnd: 20 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'mulish' }}>Reminder Records</Text>
                                <TouchableOpacity onPress={() => {
                                    ClearTaskRecord()
                                    setRecordModal(false)
                                }}>
                                    <Text style={{ fontSize: 13, color: '#FFBC01', fontWeight: 'bold' }}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <DataTable style={{ width: '90%', backgroundColor: colorScheme === 'dark' ? '#303030' : '#F4f4f4', borderRadius: 10 }}>
                                <DataTable.Header>
                                    <DataTable.Title>Title</DataTable.Title>
                                    <DataTable.Title>Extra Message</DataTable.Title>
                                    <DataTable.Title numeric>Time</DataTable.Title>
                                    <DataTable.Title numeric>ID</DataTable.Title>
                                </DataTable.Header>
                                {taskData.slice(from, to).map((item, index) => {
                                    return (
                                        <DataTable.Row key={item.id} onPress={() => {
                                            setTime(item.time)
                                            setTitle(item.title)
                                            setExtra(item.message)
                                        }}>
                                            <DataTable.Cell>{item.title.trim().slice(0, 10)}</DataTable.Cell>
                                            <DataTable.Cell>{item.message ? 'Yes' : 'No'}</DataTable.Cell>
                                            <DataTable.Cell numeric>{item.time}</DataTable.Cell>
                                            <DataTable.Cell numeric>{item.id}</DataTable.Cell>
                                        </DataTable.Row>
                                    )
                                })}

                                <DataTable.Pagination
                                    page={page}
                                    numberOfPages={Math.ceil(taskData.length / itemsPerPage)}
                                    onPageChange={(page) => setPage(page)}
                                    label={`${from + 1}-${to} of ${taskData.length}`}
                                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                                    numberOfItemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={onItemsPerPageChange}
                                    showFastPaginationControls
                                    selectPageDropdownLabel={'Rows per page'}
                                />
                            </DataTable>
                            {title || extra ?
                                <View style={{
                                    width: screenWidth - 50, paddingVertical: 10, backgroundColor: colorScheme === 'dark' ? '#212121' : 'white', borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#303030' : '#e3e3e3',
                                    marginTop: 10
                                }}>
                                    <View style={{ marginStart: 15, marginTop: 5, marginBottom: 5, marginEnd: 15 }}>
                                        <Text style={{ fontSize: 17, fontWeight: 'bold', maxWidth: 200 }} numberOfLines={2}>{title.trim()}</Text>
                                        <Text style={{ fontSize: 12, marginTop: 2, maxWidth: 230 }}>{extra.trim()}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                                        <View style={{ marginEnd: 10 }}>
                                            <Text style={{ fontSize: 10, marginEnd: 10 }}>Set For</Text>
                                            <Text style={{ alignSelf: 'center' }}>{time}</Text>
                                        </View>
                                        <TouchableOpacity style={{ alignSelf: 'flex-start', marginEnd: 15 }} onPress={() => {
                                            setTitle('')
                                            setExtra('')
                                        }}>
                                            <MaterialIcons name="close" size={15} color={colorScheme === 'dark' ? 'white' : '#101010'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                null}
                        </View>
                        :
                        null}
                </View>
            </Modal>
        </View>
    )
}

export default Reminders