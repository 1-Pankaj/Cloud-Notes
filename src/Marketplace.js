import React, { useCallback, useEffect, useState } from "react";

import { Appearance, Dimensions, FlatList, Image, ScrollView, TouchableOpacity, View, BackHandler } from "react-native";
import { ActivityIndicator, Card, FAB, Portal, ProgressBar, Surface, Text, TouchableRipple, Modal as LoadModal } from "react-native-paper";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import { useIsFocused } from "@react-navigation/native";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { ExpandableSection, Fader } from "react-native-ui-lib";

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const db = SQLite.openDatabase("CloudNotes.db")

const Marketplace = (props) => {

    const [data, setData] = useState(null)
    const [progress, setProgress] = useState(false);
    const [message, setMessage] = useState('')
    const [modalMore, setModalMore] = useState(false)
    const [fabvisible, setFabVisible] = useState(true)
    const [modalMoreIndex, setModalMoreIndex] = useState(0)

    const EnablePackage = (tablename) => {
        setFabVisible(true)
        setModalMore(false)
        setProgress(true)
        setMessage('Installing Extension')
        setTimeout(() => {
            setMessage('Enabling Packages')
            setTimeout(() => {
                setMessage('Packages Enabled, Linking Data')
                setTimeout(() => {

                    db.transaction((tx) => {
                        tx.executeSql(`UPDATE features set ${tablename} = true`, [],
                            (sql, rs) => {
                                setMessage("Data linking finished, Refreshing")
                                setTimeout(() => {
                                    setProgress(false)
                                }, 300);
                                GetData()
                            }, error => {
                            })
                    })
                }, 600);
            }, 2000);
        }, 1500);

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

    const DisablePackage = (tablename) => {
        setFabVisible(true)
        setModalMore(false)
        setProgress(true)
        setMessage('Uninstalling Extension')
        setTimeout(() => {
            setMessage('Removing linked data')
            setTimeout(() => {
                setMessage('Linked data removed, removing package just a bit more...')
                setTimeout(() => {

                    db.transaction((tx) => {
                        tx.executeSql(`UPDATE features set ${tablename} = false`, [],
                            (sql, rs) => {
                                setMessage("Package removing finished, Refreshing")
                                setTimeout(() => {
                                    setProgress(false)
                                }, 500);
                                GetData()
                            }, error => {
                            })
                    })
                }, 600);
            }, 2000);
        }, 1500);
    }

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const listData = [
        {
            index: 0,
            title: 'To-Do List',
            enabled: data === null ? 0 : data[0].todo,
            message: "With CloudNotes create and maintain To-Do lists efficiently. Create, Read, Update, or Delete your ToDo's anytime as you go!\n\nYou can access todo list anytime from pressing the floating button on home page.",
            icon: <FontAwesome5 name="tasks" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'todo',
            page: 'ToDo',
            images: [
                {
                    image: require('../assets/marketplaceimages/todoimage.png')
                }
            ]
        },
        {
            index: 1,
            title: 'Reminders',
            enabled: data === null ? 0 : data[0].reminder,
            message: "Get Reminded about anything with your own custom notification message with CloudNotes. Reminders are stored Locally on your device storage and are not stored in cloud, so remember to manage them by yourself!\n\nCloudNotes Reminder features an Interruption free reminder which can be cancelled and manipulated at anytime.",
            icon: <MaterialIcons name="notifications-active" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'reminder',
            page: 'Reminders',
            images: [
                {
                    image: require('../assets/marketplaceimages/reminderimage1.png')
                },
                {
                    image: require('../assets/marketplaceimages/reminderimage2.png')
                },
            ]
        },

        {
            index: 2,
            title: 'Starred Notes',
            enabled: data === null ? 0 : data[0].starred,
            message: "Star the notes you like and find them in Starred Notes section of CloudNotes later on. You can find starred notes in Directory section of Cloud Notes too. Starred notes are also synced with your Cloud Storage if you are logged in!\n\nAfter installing, you can find starred notes section in Home page Floating button and in Directory section of CloudNotes too.\n\nTo star the notes, you can long press the notes in All Notes section of CloudNotes and select Star Note or simply slide the note to the right and star the note from there.",
            icon: <MaterialCommIcons name="star-outline" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'starred',
            page: 'StarredNotes',
            images: [
                {
                    image: require('../assets/marketplaceimages/starredimage1.png')
                },
                {
                    image: require('../assets/marketplaceimages/starredimage2.png')
                },
            ]
        },
        {
            index: 3,
            title: 'Moodify',
            enabled: data === null ? 0 : data[0].moodify,
            message: "Enhance your experience of using CloudNotes with Moodify! Get Personalized experience according to your mood data provided by you. Manage, Alter, Track your mood data anytime.",
            icon: <MaterialIcons name="mood" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'moodify',
            page: 'Moodify',
            images: [
                {
                    image: require('../assets/marketplaceimages/moodifyempty.png')
                }
            ]
        },
        {
            index: 4,
            title: 'Colourful Notes',
            enabled: data === null ? 0 : data[0].notebackground,
            message: "Get custom coloured backgrounds in CloudNotes All notes section according your note's colour used while creating it!\n\nColourful backgrounds for Notes are also available in Starred notes, Archives and Trash page too.",
            icon: <MaterialCommIcons name="format-color-fill" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'notebackground',
            page: 'Home',
            images: [
                {
                    image: require('../assets/marketplaceimages/notebackgroundimage.png')
                }
            ]
        },
        {
            index: 5,
            title: 'Grid View',
            enabled: data === null ? 0 : data[0].gridlist,
            message: "View your saved notes as a Grid like you were scrolling in a gallery of photos with CloudNotes Grid View.\n\nGrid View can be accessed by simply pressing the menu button on home page and selecting Grid View from there.",
            icon: <MaterialCommIcons name="view-grid-plus-outline" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'gridlist',
            page: 'Home',
            images: [
                {
                    image: require('../assets/marketplaceimages/moodifyempty.png')
                }
            ]
        },
        {
            index: 6,
            title: 'Archive',
            enabled: data === null ? 0 : data[0].archive,
            message: "CloudNotes provides an Effecient way to protect your private and important notes with CloudNotes Archive. Secure your Archive with password or Fingerprint lock for better protection.\n\nWith archive you get better privacy protection for your notes and you can decide wether to sync your archive with cloud or not, "
                + "Plus you gain access to a unique password protected section which has seprate password from CloudNotes App.\n\nTo archive any note, simply slide the note to the left on All Notes section of Home Screen and archive from there. Archived notes are stored in Directory and you can access them from there anytime.",
            icon: <MaterialCommIcons name="archive-lock-outline" size={25} color="#FFBC01" />,
            last: 0,
            tablename: 'archive',
            page: 'ArchivePage',
            images: [
                {
                    image: require('../assets/marketplaceimages/archiveimage1.png')
                },
                {
                    image: require('../assets/marketplaceimages/archiveimage2.png')
                },
                {
                    image: require('../assets/marketplaceimages/archiveimage3.png')
                }
            ]
        },
        {
            index: 7,
            title: 'Reading Mode',
            enabled: data === null ? 0 : data[0].readingmode,
            message: "Reading long notes getting messy with edit mode? CloudNotes has a seprate Reading mode for your long notes. Customize your reading experience in many ways, save highlighted parts to your phone gallery or share them with others as an Image."
                + "\n\nAs your note's length increases, it becomes hefty to edit and read note altogether, so to clear out this situation CloudNotes has seprate Reading Mode for your notes.\n\n"
                + "To access Reading Mode, Long press any note on Home Page All Notes section and choose Open in reading mode option from pop-up",
            icon: <FontAwesome5 name="book-reader" color="#FFBC01" size={25} />,
            last: 50,
            tablename: 'readingmode',
            page: 'Home',
            images: [
                {
                    image: require('../assets/marketplaceimages/readingmodeimage1.png')
                },
                {
                    image: require('../assets/marketplaceimages/readingmodeimage2.png')
                },
                {
                    image: require('../assets/marketplaceimages/readingmodeimage3.png')
                },
                {
                    image: require('../assets/marketplaceimages/readingmodeimage4.png')
                }
            ]
        }
    ]

    const ShowModalMore = (index) => {
        setFabVisible(false)
        setModalMore(true)
        setModalMoreIndex(index)
    }

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const OpenPackage = (page) => {
        props.navigation.navigate(page)
        setFabVisible(false)
        setModalMore(false)
    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS features (todo Boolean, reminder Boolean, starred Boolean, moodify Boolean, notebackground Boolean, gridlist Boolean, archive Boolean, readingmode Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM features", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let results = []
                                let todo = rs.rows._array[0].todo
                                let reminder = rs.rows._array[0].reminder
                                let starred = rs.rows._array[0].starred
                                let moodify = rs.rows._array[0].moodify
                                let notebackground = rs.rows._array[0].notebackground
                                let gridlist = rs.rows._array[0].gridlist
                                let archive = rs.rows._array[0].archive
                                let readingmode = rs.rows._array[0].readingmode

                                results.push({ todo: todo, reminder: reminder, starred: starred, moodify: moodify, notebackground: notebackground, gridlist: gridlist, archive: archive, readingmode: readingmode })
                                setData(results)
                            } else {
                                sql.executeSql("INSERT INTO features (todo, reminder, starred, moodify, notebackground, gridlist, archive, readingmode) values (false,false,false,false,false,false,false,false)", [],
                                    (sql, rs) => {
                                        GetData()
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const isFocused = useIsFocused()

    useEffect(() => {
        GetData()
    }, [isFocused, props])

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
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 10 }}
                    onPress={() => { props.navigation.goBack() }}>
                    <MaterialIcons name="arrow-back-ios" size={27} color="#FFBC01" />
                    <Text style={{ fontSize: 23, color: '#FFBC01', fontWeight: 'bold' }}>Marketplace</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: screenWidth, flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'mulish', fontSize: 18, alignSelf: 'flex-start', marginTop: 30, marginStart: 25 }}>All available packages</Text>
                <FlatList
                    data={listData} scrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    key={item => item.index}
                    renderItem={item => {
                        return (
                            <TouchableRipple onPress={() => { ShowModalMore(item.item.index) }}
                                borderless style={{ width: screenWidth - 40, marginTop: 15, paddingVertical: 20, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: item.item.last }}>

                                <View style={{ width: '100%', height: '100%', flexDirection: "row", alignItems: 'center', justifyContent: 'space-between' }}>
                                    <View style={{ alignItems: 'flex-start', marginStart: 20, }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                            <Card style={{ width: 45, height: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#303030' : '#ECECEC', borderRadius: 10 }}>
                                                {item.item.icon}
                                            </Card>
                                            <Text style={{ fontWeight: 'bold', fontSize: 18, marginStart: 20 }}>{item.item.title}</Text>
                                        </View>
                                        <Text style={{ maxWidth: 200, fontSize: 13, marginTop: 3 }} numberOfLines={2}>{item.item.message.trim().slice(0, 60)}</Text>
                                    </View>


                                    <View style={{ alignItems: 'center', marginEnd: 20 }}>
                                        <TouchableOpacity style={{ paddingHorizontal: 10, paddingVertical: 3, backgroundColor: '#FFBC01', borderRadius: 20 }} activeOpacity={0.6}
                                            onPress={() => {
                                                item.item.enabled == 1 ?
                                                    OpenPackage(item.item.page)
                                                    :
                                                    EnablePackage(item.item.tablename)
                                            }}>
                                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: 'white' }}>{item.item.enabled == 1 ? 'Open' : 'Install'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </TouchableRipple>

                        )
                    }}
                />
            </View>


            <Portal>
                <FAB
                    visible={fabvisible}
                    icon="help"
                    onPress={() => { }}
                    style={{
                        position: 'absolute',
                        margin: 16,
                        right: 0,
                        bottom: 0,
                        borderRadius: 30,
                        backgroundColor: 'black',
                    }}
                    color="white"

                />
            </Portal>
            <Fader visible position={Fader.position.BOTTOM} tintColor={colorScheme === 'dark' ? "#1c1c1c" : '#f4f4f4'} size={150} />

            <LoadModal visible={progress} dismissable={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Card style={{ width: 220, height: 220, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size={50} />
                    <Text style={{ textAlign: 'center', marginTop: 30, paddingHorizontal: 20 }}>{message}</Text>
                </Card>
            </LoadModal>

            <LoadModal  visible={modalMore} dismissable onDismiss={()=>{setModalMore(false)}} style={{ alignItems: 'center', justifyContent: 'flex-end' }} dismissableBackButton={true}>
                <View style={{ width: screenWidth, height: screenHeight - 20, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4', borderTopStartRadius: 20, borderTopEndRadius: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginStart: 10, marginTop: 25, marginBottom: 25 }}
                        onPress={() => {
                            setFabVisible(true)
                            setModalMore(false)
                        }}>
                        <MaterialIcons name="arrow-back-ios" size={24} color="#FFBC01" />
                        <Text style={{ fontSize: 20, color: '#FFBC01', fontWeight: 'bold' }}>{listData[modalMoreIndex].title}</Text>
                    </TouchableOpacity>
                    <ScrollView style={{ flex: 1, width: screenWidth }} contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>

                        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 20, marginTop: 20 }}>
                                <Card style={{ width: 55, height: 55, alignItems: 'center', justifyContent: 'center', backgroundColor: colorScheme === 'dark' ? '#303030' : '#ECECEC', borderRadius: 10 }}>
                                    {listData[modalMoreIndex].icon}
                                </Card>
                                <Text style={{ alignSelf: 'flex-start', marginTop: 5, fontSize: 22, fontWeight: 'bold', marginStart: 20 }}>{listData[modalMoreIndex].title}</Text>
                            </View>
                            <TouchableOpacity style={{ paddingHorizontal: 15, justifyContent: 'center', alignItems: 'center', paddingVertical: 5, backgroundColor: '#FFBC01', borderRadius: 20, marginTop: 20, marginEnd: 20 }} activeOpacity={0.6}
                                onPress={() => {
                                    listData[modalMoreIndex].enabled == 1 ?
                                        OpenPackage(listData[modalMoreIndex].page)
                                        :
                                        EnablePackage(listData[modalMoreIndex].tablename)
                                }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: 'white' }}>{listData[modalMoreIndex].enabled == 1 ? 'Open' : 'Install'}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ textAlign: 'left', paddingHorizontal: 25, marginTop: 20, fontSize: 15, fontFamily: 'mulish', alignSelf: 'flex-start' }}>{listData[modalMoreIndex].message.trim()}</Text>
                        <FlatList
                            data={listData[modalMoreIndex].images}
                            key={item => item.image} horizontal showsHorizontalScrollIndicator={false}
                            style={{ marginTop: 30, marginBottom: 10, width: screenWidth, height: 220 }}
                            renderItem={(item) => {
                                return (
                                    <Image source={item.item.image} style={{ marginStart: 20, marginEnd: 20, width: 100, height: 200 }} />
                                )
                            }}
                        />

                        <View style={{ alignItems: 'center', marginTop: 30 }}>

                            {listData[modalMoreIndex].enabled == 1 ?
                                <TouchableOpacity style={{ width: 199, height: 49, borderRadius: 50, borderColor: '#FFBC01', borderWidth: 1, justifyContent: 'center', alignItems: 'center', }} activeOpacity={0.6}
                                    onPress={() => [DisablePackage(listData[modalMoreIndex].tablename)]}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFBC01' }}>Uninstall</Text>
                                </TouchableOpacity>
                                :
                                null}
                            <TouchableOpacity style={{ width: 200, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFBC01', borderRadius: 50, marginTop: 10, }} activeOpacity={0.6}
                                onPress={() => {
                                    listData[modalMoreIndex].enabled == 1 ?
                                        OpenPackage(listData[modalMoreIndex].page)
                                        :
                                        EnablePackage(listData[modalMoreIndex].tablename)
                                }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{listData[modalMoreIndex].enabled == 1 ? 'Open' : 'Install'}</Text>
                            </TouchableOpacity>
                            <Text style={{ paddingHorizontal: 35, textAlign: 'center', marginTop: 20, fontFamily: 'mulish', fontSize: 12, marginBottom: 20 }}>If you wish to remove this package, you can remove it anytime and your data won't be lost and you can continue from where you left after installing again.</Text>
                        </View>
                    </ScrollView>
                </View>

            </LoadModal>
        </View>
    )
}

export default Marketplace