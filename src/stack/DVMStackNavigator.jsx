import { createNativeStackNavigator } from "@react-navigation/native-stack"

import ROUTES from "../config/routes"
import COLORS from "../config/colors"

///////////////////////////////////////////////////////////////////////////////////////////////////
// DVM SCREENS ------------------------------------------------------------------------------------
import TabNavigator from '../screens/dvm/TabNavigator'
// DVM - APPOINTMENT SCREENS ----------------------------------------------------------------------
import ViewAppointmentDetailsScreen from '../screens/dvm/Appointments/ViewAppointmentDetailsScreen'
import ViewDeraProfileScreen from "../screens/dvm/Appointments/ViewDeraProfileScreen"
// DVM - SERVICES SCREENS -------------------------------------------------------------------------
import AddServiceScreen from '../screens/dvm/Services/AddServiceScreen'
import EditServiceScreen from '../screens/dvm/Services/EditServiceScreen'
import ShowServicesScreen from '../screens/dvm/Services/ShowServicesScreen'
import ViewServiceScreen from '../screens/dvm/Services/ViewServiceScreen'
// DVM - SETTINGS SCREENS -------------------------------------------------------------------------
import EditAccountInfoScreen from '../screens/dvm/Settings/EditAccountInfoScreen'
import LocationAndAddressScreen from "../screens/dvm/Settings/LocationAndAddressScreen"
import PaymentWalletsScreen from '../screens/dvm/Settings/PaymentWalletsScreen'
import SocialMediaHandlesScreen from '../screens/dvm/Settings/SocialMediaHandlesScreen'
import AppointmentsHistoryScreen from "../screens/dvm/Settings/AppointmentsHistoryScreen"

const DVMStackNavigator = ({ navigation }) => {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      statusBarColor: COLORS.COLOR_01,
    }}>
      <Stack.Screen name={ROUTES.DVM.TAB_NAVIGATOR} component={TabNavigator} />
      {/* DVM - APPOINTMENT SCREENS */}
      <Stack.Screen name={ROUTES.DVM.VIEW_APPOINTMENT_DETAILS} component={ViewAppointmentDetailsScreen} />
      <Stack.Screen name={ROUTES.DVM.VIEW_DERA_PROFILE} component={ViewDeraProfileScreen} />
      {/* DVM - SERVICES SCREENS  */}
      <Stack.Screen name={ROUTES.DVM.ADD_SERVICE} component={AddServiceScreen} />
      <Stack.Screen name={ROUTES.DVM.EDIT_SERVICE} component={EditServiceScreen} />
      <Stack.Screen name={ROUTES.DVM.SHOW_SERVICES} component={ShowServicesScreen} />
      <Stack.Screen name={ROUTES.DVM.VIEW_SERVICE} component={ViewServiceScreen} />
      {/* DVM - SETTINGS SCREENS  */}
      <Stack.Screen name={ROUTES.DVM.EDIT_ACCOUNT_INFO} component={EditAccountInfoScreen} />
      <Stack.Screen name={ROUTES.DVM.LOCATION_AND_ADDRESS} component={LocationAndAddressScreen} />
      <Stack.Screen name={ROUTES.DVM.PAYMENT_WALLETS} component={PaymentWalletsScreen} />
      <Stack.Screen name={ROUTES.DVM.SOCIAL_MEDIA_HANDLES} component={SocialMediaHandlesScreen} />
      <Stack.Screen name={ROUTES.DVM.APPOINTMENTS_HISTORY} component={AppointmentsHistoryScreen} />
    </Stack.Navigator>
  )
}
export default DVMStackNavigator