// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SidebarProvider } from './context/SidebarContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { requestUserPermission, setupFCMListeners, registerFCMToken } from './utils/NotificationService';

// Import screens
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import MenuScreen from './Screens/MenuScreen';
import StockScreen from './Screens/StockScreen';
import HealthAlertsScreen from './Screens/HealthAlertsScreen';
import PromotionsScreen from './Screens/PromotionsScreen';
import StaffScreen from './Screens/StaffScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  const { userRole } = React.useContext(AuthContext);
  
  return (
    <SidebarProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Menu" component={MenuScreen} />
        {userRole === 'gerant' && (
          <>
            <Stack.Screen name="Stock" component={StockScreen} />
            <Stack.Screen name="Staff" component={StaffScreen} />
          </>
        )}
        <Stack.Screen name="HealthAlerts" component={HealthAlertsScreen} />
        <Stack.Screen name="Promotions" component={PromotionsScreen} />
      </Stack.Navigator>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};



const RootNavigator = () => {
  const { userToken, isLoading, userData, userRole } = React.useContext(AuthContext);
  
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestUserPermission();
      if (hasPermission && userData?.id) {
        await registerFCMToken(userData.id, userRole);
      }
    };
    
    if (userData) {
      setupNotifications();
    }
  }, [userData, userRole]);
  
  useEffect(() => {
    if (userData) {
      const unsubscribe = setupFCMListeners(navigation);
      return unsubscribe;
    }
  }, [userData]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return userToken ? <AppStack /> : <AuthStack />;
};


export default App;
