// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.data.token) {
        setUserToken(response.data.token);
        setUserData(response.data.data.client);
        setUserRole('client');
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.client));
        await AsyncStorage.setItem('userRole', 'client');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginStaff = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.loginPersonnel(email, password);
      if (response.data.token) {
        setUserToken(response.data.token);
        setUserData(response.data.data.personnel);
        setUserRole(response.data.role);
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.personnel));
        await AsyncStorage.setItem('userRole', response.data.role);
      }
    } catch (error) {
      console.error('Staff login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserData(null);
    setUserRole(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('userRole');
    setIsLoading(false);
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUserRole = await AsyncStorage.getItem('userRole');
      
      if (token) {
        setUserToken(token);
        setUserData(JSON.parse(storedUserData));
        setUserRole(storedUserRole);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('isLoggedIn error:', error);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        login, 
        loginStaff, 
        logout, 
        isLoading, 
        userToken, 
        userData, 
        userRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
