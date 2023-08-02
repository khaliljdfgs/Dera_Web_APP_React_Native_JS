import { createNativeStackNavigator } from "@react-navigation/native-stack"

import ROUTES from "../config/routes"
import COLORS from "../config/colors"

///////////////////////////////////////////////////////////////////////////////////////////////////
// DERA SCREENS -----------------------------------------------------------------------------------
import TabNavigator from '../screens/dera/TabNavigator'
// DERA - DAIRY PRODUCT SCREENS -------------------------------------------------------------------
import AddDairyProductScreen from '../screens/dera/DairyProduct/AddDairyProductScreen'
import EditDairyProductScreen from '../screens/dera/DairyProduct/EditDairyProductScreen'
import ShowDairyProductsScreen from '../screens/dera/DairyProduct/ShowDairyProductsScreen'
import ViewDairyProductScreen from "../screens/dera/DairyProduct/ViewDairyProductScreen"
// DERA - LIVESTOCK PRODUCT SCREENS --------------------------------------------------------------
import AddLiveStockScreen from "../screens/dera/LiveStock/AddLiveStockScreen"
import EditLiveStockScreen from "../screens/dera/LiveStock/EditLiveStockScreen"
import ShowLiveStocksScreen from "../screens/dera/LiveStock/ShowLiveStocksScreen"
import ViewLiveStockScreen from "../screens/dera/LiveStock/ViewLiveStockScreen"
import LiveStockFeaturesScreen from "../screens/dera/LiveStock/LiveStockFeaturesScreen"
import LiveStockPhotosScreen from "../screens/dera/LiveStock/LiveStockPhotosScreen"
import SelectConsumerScreen from "../screens/dera/LiveStock/SelectConsumerScreen"
// DERA - DVM SERVICES SCREENS --------------------------------------------------------------------
import ViewDvmProfileScreen from "../screens/dera/DVMService/ViewDvmProfileScreen"
import ViewDVMServiceScreen from "../screens/dera/DVMService/ViewDVMServiceScreen"
import ShowDVMServicesScreen from "../screens/dera/DVMService/ShowDVMServicesScreen"
// DERA - SETTINGS SCREENS ------------------------------------------------------------------------
import EditAccountInfoScreen from "../screens/dera/Settings/EditAccountInfoScreen"
import LocationAndAddressScreen from "../screens/dera/Settings/LocationAndAddressScreen"
import ManageBannerPhotosScreen from "../screens/dera/Settings/ManageBannerPhotosScreen"
import PaymentWalletsScreen from "../screens/dera/Settings/PaymentWalletsScreen"
import SocialMediaHandlesScreen from "../screens/dera/Settings/SocialMediaHandlesScreen"
import DairyProductOrdersScreen from "../screens/dera/Settings/DairyProductOrdersScreen"
import DvmAppointmentsScreen from "../screens/dera/Settings/DvmAppointmentsScreen"
import DvmAppointmentDetailsScreen from "../screens/dera/Settings/DvmAppointmentDetailsScreen"
import NotificationDetailsScreen from "../screens/dera/NotificationDetailsScreen"
import ScheduleDetailsScreen from "../screens/dera/ScheduleDetailsScreen"
import QRCodeScanScreen from "../screens/dera/QRCodeScanScreen"
import LiveStockSoldOutScreen from "../screens/dera/Settings/LiveStockSoldOutScreen"
import DemoConfigScreen from "../screens/dera/Settings/DemoConfigScreen"

const DeraStackNavigator = ({ navigation }) => {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      statusBarColor: COLORS.COLOR_01,
    }}>
      <Stack.Screen name={ROUTES.DERA.TAB_NAVIGATOR} component={TabNavigator} />
      {/* DERA - DAIRY PRODUCT SCREENS  */}
      <Stack.Screen name={ROUTES.DERA.ADD_DAIRY_PRODUCT} component={AddDairyProductScreen} />
      <Stack.Screen name={ROUTES.DERA.EDIT_DAIRY_PRODUCT} component={EditDairyProductScreen} />
      <Stack.Screen name={ROUTES.DERA.SHOW_DAIRY_PRODUCTS} component={ShowDairyProductsScreen} />
      <Stack.Screen name={ROUTES.DERA.VIEW_DAIRY_PRODUCT} component={ViewDairyProductScreen} />
      {/* DERA - LIVESTOCK PRODUCT SCREENS  */}
      <Stack.Screen name={ROUTES.DERA.ADD_LIVESTOCK} component={AddLiveStockScreen} />
      <Stack.Screen name={ROUTES.DERA.EDIT_LIVESTOCK} component={EditLiveStockScreen} />
      <Stack.Screen name={ROUTES.DERA.SHOW_LIVESTOCKS} component={ShowLiveStocksScreen} />
      <Stack.Screen name={ROUTES.DERA.VIEW_LIVESTOCK} component={ViewLiveStockScreen} />
      <Stack.Screen name={ROUTES.DERA.LIVESTOCK_FEATURES} component={LiveStockFeaturesScreen} />
      <Stack.Screen name={ROUTES.DERA.LIVESTOCK_PHOTOS} component={LiveStockPhotosScreen} />
      <Stack.Screen name={ROUTES.DERA.SELECT_CONSUMER} component={SelectConsumerScreen} />
      {/* DERA - DVM SERVICES SCREENS  */}
      <Stack.Screen name={ROUTES.DERA.VIEW_DVM_PROFILE} component={ViewDvmProfileScreen} />
      <Stack.Screen name={ROUTES.DERA.VIEW_DVM_SERVICE} component={ViewDVMServiceScreen} />
      <Stack.Screen name={ROUTES.DERA.SHOW_DVM_SERVICES} component={ShowDVMServicesScreen} />
      {/* DERA - SETTINGS SCREENS  */}
      <Stack.Screen name={ROUTES.DERA.EDIT_ACCOUNT_INFO} component={EditAccountInfoScreen} />
      <Stack.Screen name={ROUTES.DERA.LOCATION_AND_ADDRESS} component={LocationAndAddressScreen} />
      <Stack.Screen name={ROUTES.DERA.MANAGE_BANNER_PHOTOS} component={ManageBannerPhotosScreen} />
      <Stack.Screen name={ROUTES.DERA.PAYMENT_WALLETS} component={PaymentWalletsScreen} />
      <Stack.Screen name={ROUTES.DERA.SOCIAL_MEDIA_HANDLES} component={SocialMediaHandlesScreen} />
      <Stack.Screen name={ROUTES.DERA.DAIRY_PRODUCT_ORDERS} component={DairyProductOrdersScreen} />
      <Stack.Screen name={ROUTES.DERA.DVM_APPOINTMENTS} component={DvmAppointmentsScreen} />
      <Stack.Screen name={ROUTES.DERA.DVM_APPOINTMENT_DETAILS} component={DvmAppointmentDetailsScreen} />
      <Stack.Screen name={ROUTES.DERA.NOTIFICATION_DETAILS} component={NotificationDetailsScreen} />
      <Stack.Screen name={ROUTES.DERA.SCHEDULE_DETAILS} component={ScheduleDetailsScreen} />
      <Stack.Screen name={ROUTES.DERA.QR_CODE_SCAN} component={QRCodeScanScreen} />
      <Stack.Screen name={ROUTES.DERA.LIVESTOCK_SOLD_OUT} component={LiveStockSoldOutScreen} />
      <Stack.Screen name={ROUTES.DERA.DEMO_CONFIG} component={DemoConfigScreen} />
    </Stack.Navigator>
  )
}
export default DeraStackNavigator