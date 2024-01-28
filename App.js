import { React, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './src/HomeScreen';
import {
  Provider as PaperProvider, MD3LightTheme as LightTheme,
  MD3DarkTheme as DarkTheme
} from 'react-native-paper'
import SplashScreenPage from './src/SplashScreen'
import { StatusBar } from 'expo-status-bar';
import Loading from './src/Loading';
import CreateNote from './src/CreateNote';
import Directory from './src/Directory';
import { isAndroid } from '@freakycoder/react-native-helpers';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Browser from './src/Browser';
import HomeSplash from './src/splashscreens/HomeSplash';
import ArchiveSplash from './src/splashscreens/ArchiveSplash';
import DeleteSplash from './src/splashscreens/DeleteSplash';
import ArchivePage from './src/ArchivePage';
import ArchivePasswordSplash from './src/splashscreens/ArchivePasswordSplash';
import PasswordPage from './src/PasswordPage';
import TrashPage from './src/TrashPage';
import ToDo from './src/ToDo';
import ToDoSplash from './src/splashscreens/ToDoSplash';
import BookmarkAndHistory from './src/BookmarkAndHistory';
import Reminders from './src/Reminders';
import ReminderSplash from './src/splashscreens/ReminderSplash';
import StarredNotesSplash from './src/splashscreens/StarredNotesSplash';
import StarredNotes from './src/StarredNotes';
import ReadingModeSplash from './src/splashscreens/ReadingModeSplash';
import ReadingMode from './src/ReadingMode';
import MarketplaceSplash from './src/splashscreens/MarketplaceSplash';
import Marketplace from './src/Marketplace';

import * as SQLite from 'expo-sqlite'
import FolderSplash from './src/splashscreens/FolderSplash';
import Folder from './src/Folder';
import OpenFolder from './src/OpenFolder';
import Moodify from './src/Moodify';
import MoodifySplash from './src/splashscreens/MoodifySplash';
import VoiceSearch from './src/VoiceSearch';
import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';
import PersonalFolder from './src/PersonalFolder';
import PersonalPassword from './src/PersonalPassword';

const Stack = createStackNavigator()

const db = SQLite.openDatabase('CloudNotes.db')

function App() {

  const [splashScreen, setSplashScreen] = useState(true)
  const [homeSplash, setHomeSplash] = useState(true)
  const [archiveSplash, setArchiveSplash] = useState(true)
  const [deleteSplash, setDeleteSplash] = useState(true)
  const [marketplaceSplash, setMarketplaceSplash] = useState(true)
  const [todoSplash, setTodoSplash] = useState(true)
  const [reminderSplash, setReminderSplash] = useState(true)
  const [starredNotesSplash, setStarredNotesSplash] = useState(true)
  const [readingModeSplash, setReadingModeSplash] = useState(true)
  const [folderSplash, setFolderSplash] = useState(true)
  const [moodifySplash, setMoodifySplash] = useState(true)


  const GetSplashData = () => {
    db.transaction((tx) => {
      tx.executeSql("SELECT * FROM splash", [],
        (sql, rs) => {
          if (rs.rows.length > 0) {
            setSplashScreen(false)
            if (rs.rows._array[0].homepage == 'true') {
              setHomeSplash(false)
            }
            if (rs.rows._array[0].archivebtn == 'true') {
              setArchiveSplash(false)
            }
            if (rs.rows._array[0].deletebtn == 'true') {
              setDeleteSplash(false)
            }
          }
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS marketplacesplash(firsttime Boolean)', [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM marketplacesplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setMarketplaceSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS todosplash (firsttime VARCHAR(20))", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM todosplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setTodoSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS remindersplash (firsttime Boolean)", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM remindersplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setReminderSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS starredsplash (firsttime Boolean)", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM starredsplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setStarredNotesSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS readingsplash(firsttime Boolean)", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM readingsplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setReadingModeSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })


    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS foldersplash(firsttime Boolean)", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM foldersplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setFolderSplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })

    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS moodifysplash(firsttime Boolean)", [],
        (sql, rs) => {
          sql.executeSql("SELECT firsttime FROM moodifysplash", [],
            (sql, rs) => {
              if (rs.rows.length > 0) {
                setMoodifySplash(false)
              }
            }, error => {
            })
        }, error => {
        })
    })


  }

  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme)

  useEffect(() => {
    GetSplashData()
  }, [])

  const [themeState, setThemeState] = useState({
    ...LightTheme, colors: {
      primary: "#FFCD00",
      secondary: 'white'
    }
  })


  Appearance.addChangeListener(() => {
    setColorScheme(Appearance.getColorScheme)
  })


  useEffect(() => {
    if (colorScheme == "dark") {
      setThemeState({
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: "#FFBC01",
          secondary: 'white',
          background: '#1c1c1c'
        }
      })
    } else {
      setThemeState({
        ...LightTheme, colors: {
          ...LightTheme.colors,
          primary: '#FFBC01',
          secondary: 'black',
          background: "#f4f4f4"
        }
      })
    }

  }, [colorScheme])


  return (
    <PaperProvider theme={themeState}>
      <NavigationContainer theme={themeState}>
        <Stack.Navigator
          initialRouteName='Loading'
          screenOptions={{
            headerShown: false
          }} >
          <Stack.Screen name='Loading' component={Loading} />
          {splashScreen ?
            <Stack.Screen name='SplashScreen' component={SplashScreenPage} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          {homeSplash ?
            <Stack.Screen name='HomeSplash' component={HomeSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          {archiveSplash ?
            <Stack.Screen name='ArchiveSplash' component={ArchiveSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          {deleteSplash ?
            <Stack.Screen name='DeleteSplash' component={DeleteSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='ArchivePage' component={ArchivePage} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          {marketplaceSplash ?
            <Stack.Screen name='MarketplaceSplash' component={MarketplaceSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='Marketplace' component={Marketplace} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='VoiceSearch' component={VoiceSearch} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='ArchivePasswordSplash' component={ArchivePasswordSplash} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='PasswordPage' component={PasswordPage} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='Moodify' component={Moodify} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          {moodifySplash ?
            <Stack.Screen name='MoodifySplash' component={MoodifySplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          {folderSplash ?
            <Stack.Screen name='FolderSplash' component={FolderSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='Folder' component={Folder} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='PersonalFolder' component={PersonalFolder} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='PersonalPassword' component={PersonalPassword} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='OpenFolder' component={OpenFolder} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='TrashPage' component={TrashPage} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='ToDo' component={ToDo} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          {todoSplash ?
            <Stack.Screen name='ToDoSplash' component={ToDoSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='Reminders' component={Reminders} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          {reminderSplash ?
            <Stack.Screen name='ReminderSplash' component={ReminderSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          {starredNotesSplash ?
            <Stack.Screen name='StarredNotesSplash' component={StarredNotesSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='StarredNotes' component={StarredNotes} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          {readingModeSplash ?
            <Stack.Screen name='ReadingModeSplash' component={ReadingModeSplash} options={{
              gestureEnabled: true,
              presentation: 'modal',
              animation: "slide_from_bottom",
              ...(isAndroid && TransitionPresets.ModalPresentationIOS),
              headerShown: false
            }} />
            :
            null}
          <Stack.Screen name='ReadingMode' component={ReadingMode} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateNote" component={CreateNote} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name="Directory" component={Directory} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name="BookmarkAndHistory" component={BookmarkAndHistory} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name="Browser" component={Browser} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />

        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}


export default App;