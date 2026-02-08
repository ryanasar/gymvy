import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

/**
 * Capture the recap view as an image
 * @param {React.RefObject} viewRef - Ref to the recap view
 * @returns {Promise<string>} - URI of the captured image
 */
export async function captureRecapImage(viewRef) {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      width: 1080,
      height: 1920,
    });
    return uri;
  } catch (error) {
    console.error('[Recap] Failed to capture image:', error);
    throw error;
  }
}

/**
 * Share the recap using the system share sheet
 * @param {React.RefObject} viewRef - Ref to the recap view
 */
export async function shareRecap(viewRef) {
  try {
    const uri = await captureRecapImage(viewRef);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Sharing not available', 'Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your monthly recap',
    });

    return true;
  } catch (error) {
    console.error('[Recap] Failed to share:', error);
    Alert.alert('Error', 'Failed to share recap. Please try again.');
    return false;
  }
}

/**
 * Save the recap to the camera roll
 * @param {React.RefObject} viewRef - Ref to the recap view
 */
export async function saveRecapToGallery(viewRef) {
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow access to save images to your gallery',
        [{ text: 'OK' }]
      );
      return false;
    }

    const uri = await captureRecapImage(viewRef);

    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(uri);

    // Optionally create an album for the app
    const album = await MediaLibrary.getAlbumAsync('Gymvy');
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      await MediaLibrary.createAlbumAsync('Gymvy', asset, false);
    }

    Alert.alert('Saved!', 'Your recap has been saved to your gallery');
    return true;
  } catch (error) {
    console.error('[Recap] Failed to save to gallery:', error);
    Alert.alert('Error', 'Failed to save recap. Please try again.');
    return false;
  }
}

/**
 * Share directly to Instagram Stories (if available)
 * @param {React.RefObject} viewRef - Ref to the recap view
 */
export async function shareToInstagramStories(viewRef) {
  try {
    const uri = await captureRecapImage(viewRef);

    // Copy to a shareable location with proper extension
    const filename = `${FileSystem.cacheDirectory}gymvy_recap_${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: filename });

    // Use the share sheet which includes Instagram Stories on iOS
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filename, {
        mimeType: 'image/png',
        UTI: 'public.png',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Recap] Failed to share to Instagram:', error);
    Alert.alert('Error', 'Failed to share to Instagram. Please try again.');
    return false;
  }
}
