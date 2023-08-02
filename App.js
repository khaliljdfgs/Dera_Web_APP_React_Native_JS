import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Notifications from "expo-notifications"

import ROUTES from "./src/config/routes"
import COLORS from "./src/config/colors"

///////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON SCREENS ---------------------------------------------------------------------------------
import SplashScreen from "./src/screens/common/SplashScreen"
import LoginScreen from './src/screens/common/LoginScreen'
import RegisterScreen from './src/screens/common/RegisterScreen'
import ResetPasswordScreen from './src/screens/common/ResetPasswordScreen'
import AddtionalInformationScreen from './src/screens/common/AddtionalInformationScreen'
import ChatScreen from './src/screens/common/ChatScreen'
import SubmitQueryScreen from './src/screens/common/SubmitQueryScreen'
import AdminNotificationScreen from './src/screens/common/AdminNotificationScreen'

///////////////////////////////////////////////////////////////////////////////////////////////////
import DeraStackNavigator from "./src/stack/DeraStackNavigator"
import DVMStackNavigator from "./src/stack/DVMStackNavigator"
import ConsumerStackNavigator from './src/stack/ConsumerStackNavigator'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH
    }
  }
})

const App = () => {
  const Stack = createNativeStackNavigator()

  try {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          statusBarColor: COLORS.COLOR_01
        }}>
          <Stack.Screen name={ROUTES.COMMON.SPLASH} component={SplashScreen} options={{
            navigationBarHidden: true,
            animation: 'default',
            statusBarHidden: true,
          }} />
          <Stack.Screen name={ROUTES.COMMON.LOGIN} component={LoginScreen} />
          <Stack.Screen name={ROUTES.COMMON.REGISTER} component={RegisterScreen} />
          <Stack.Screen name={ROUTES.COMMON.RESET_PASSWORD} component={ResetPasswordScreen} />

          <Stack.Screen name={ROUTES.COMMON.ADDITIONAL_INFORMATION} component={AddtionalInformationScreen} />
          <Stack.Screen name={ROUTES.COMMON.CHAT_SCREEN} component={ChatScreen} />
          <Stack.Screen name={ROUTES.COMMON.SUBMIT_QUERY} component={SubmitQueryScreen} />
          <Stack.Screen name={ROUTES.COMMON.ADMIN_NOTIFICATION} component={AdminNotificationScreen} />

          <Stack.Screen name={ROUTES.DERA.STACK_NAVIGATOR} component={DeraStackNavigator} />
          <Stack.Screen name={ROUTES.DVM.STACK_NAVIGATOR} component={DVMStackNavigator} />
          <Stack.Screen name={ROUTES.CONSUMER.STACK_NAVIGATOR} component={ConsumerStackNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  } catch (error) {
    console.log(error)
  }
}

export default App