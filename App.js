import { React, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './src/HomeScreen';
import {
  Provider as PaperProvider, MD3LightTheme as LightTheme,
  MD3DarkTheme as DarkTheme} from 'react-native-paper'
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

const Stack = createStackNavigator()


function App() {


  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme)


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
      <StatusBar style='auto' backgroundColor='transparent' animated={true} hidden />
      <NavigationContainer theme={themeState}>
        <Stack.Navigator
          initialRouteName='Loading'
          screenOptions={{
            headerShown: false
          }} >
          <Stack.Screen name='Loading' component={Loading} />
          <Stack.Screen name='SplashScreen' component={SplashScreenPage} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='HomeSplash' component={HomeSplash} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='ArchiveSplash' component={ArchiveSplash} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='DeleteSplash' component={DeleteSplash} options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: "slide_from_bottom",
            ...(isAndroid && TransitionPresets.ModalPresentationIOS),
            headerShown: false
          }} />
          <Stack.Screen name='ArchivePage' component={ArchivePage} options={{
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
          <Stack.Screen name='TrashPage' component={TrashPage} options={{
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