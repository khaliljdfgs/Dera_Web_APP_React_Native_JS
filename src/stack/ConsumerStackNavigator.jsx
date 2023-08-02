import { createNativeStackNavigator } from "@react-navigation/native-stack"

import ROUTES from "../config/routes"
import COLORS from "../config/colors"

///////////////////////////////////////////////////////////////////////////////////////////////////
// CONSUMER SCREENS -------------------------------------------------------------------------------
import TabNavigator from '../screens/consumer/TabNavigator'
import ViewDeraProfileScreen from '../screens/consumer/ViewDeraProfileScreen'
// CONSUMER - DAIRY PRODUCTS SCREENS --------------------------------------------------------------
import ShowDairyProductsScreen from '../screens/consumer/DairyProducts/ShowDairyProductsScreen'
import ViewDairyProductScreen from '../screens/consumer/DairyProducts/ViewDairyProductScreen'
import PlaceOrderNowScreen from "../screens/consumer/DairyProducts/PlaceOrderNowScreen"
// CONSUMER - LIVESTOCK SCREENS -------------------------------------------------------------------
import ShowLiveStocksScreen from '../screens/consumer/LiveStock/ShowLiveStocksScreen'
import ViewLiveStockScreen from '../screens/consumer/LiveStock/ViewLiveStockScreen'
// CONSUMER - SETTINGS SCREENS --------------------------------------------------------------------
import EditAccountInfoScreen from '../screens/consumer/Settings/EditAccountInfoScreen'
import LocationAndAddressScreen from "../screens/consumer/Settings/LocationAndAddressScreen"
import DairyProductOrdersScreen from "../screens/consumer/Settings/DairyProductOrdersScreen"
import ScheduleDetailsScreen from "../screens/consumer/ScheduleDetailsScreen"
import QRCodeScreen from "../screens/consumer/QRCodeScreen"
import LiveStockHistoryScreen from "../screens/consumer/Settings/LiveStockHistoryScreen"

const ConsumerStackNavigator = ({ navigation }) => {
  const Stack = createNativeStackNavigator()

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      statusBarColor: COLORS.COLOR_01,
    }}>
      <Stack.Screen name={ROUTES.CONSUMER.TAB_NAVIGATOR} component={TabNavigator} />
      <Stack.Screen name={ROUTES.CONSUMER.VIEW_DERA_PROFILE} component={ViewDeraProfileScreen} />
      {/* CONSUMER - DAIRY PRODUCTS SCREENS  */}
      <Stack.Screen name={ROUTES.CONSUMER.SHOW_DAIRY_PRODUCTS} component={ShowDairyProductsScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.VIEW_DAIRY_PRODUCT} component={ViewDairyProductScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.PLACE_ORDER_NOW} component={PlaceOrderNowScreen} />
      {/* CONSUMER - LIVESTOCK SCREENS */}
      <Stack.Screen name={ROUTES.CONSUMER.SHOW_LIVESTOCKS} component={ShowLiveStocksScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.VIEW_LIVESTOCK} component={ViewLiveStockScreen} />
      {/* CONSUMER - SETTINGS SCREENS  */}
      <Stack.Screen name={ROUTES.CONSUMER.EDIT_ACCOUNT_INFO} component={EditAccountInfoScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.LOCATION_AND_ADDRESS} component={LocationAndAddressScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.DAIRY_PRODUCT_ORDERS} component={DairyProductOrdersScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.SCHEDULE_DETAILS} component={ScheduleDetailsScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.QR_CODE} component={QRCodeScreen} />
      <Stack.Screen name={ROUTES.CONSUMER.LIVESTOCK_HISTORY} component={LiveStockHistoryScreen} />
    </Stack.Navigator>
  )
}
export default ConsumerStackNavigator