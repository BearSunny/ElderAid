import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
  notifications: boolean;
  mediaLibrary: boolean;
}

// Request camera permissions
export const requestCameraPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web handles permissions differently
  }
  
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

// Request location permissions
export const requestLocationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web handles permissions differently
  }
  
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web handles permissions differently
  }
  
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Request media library permissions
export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true; // Web handles permissions differently
  }
  
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
};

// Check all permissions
export const checkAllPermissions = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    // Web handles permissions differently
    return {
      camera: true,
      location: true,
      notifications: true,
      mediaLibrary: true,
    };
  }
  
  const cameraStatus = (await Camera.getCameraPermissionsAsync()).status === 'granted';
  const locationStatus = (await Location.getForegroundPermissionsAsync()).status === 'granted';
  const notificationStatus = (await Notifications.getPermissionsAsync()).status === 'granted';
  const mediaLibraryStatus = (await MediaLibrary.getPermissionsAsync()).status === 'granted';
  
  return {
    camera: cameraStatus,
    location: locationStatus,
    notifications: notificationStatus,
    mediaLibrary: mediaLibraryStatus,
  };
};

// Request all permissions
export const requestAllPermissions = async (): Promise<PermissionStatus> => {
  const camera = await requestCameraPermissions();
  const location = await requestLocationPermissions();
  const notifications = await requestNotificationPermissions();
  const mediaLibrary = await requestMediaLibraryPermissions();
  
  return {
    camera,
    location,
    notifications,
    mediaLibrary,
  };
};