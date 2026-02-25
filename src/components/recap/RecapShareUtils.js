import { Alert } from 'react-native';

const REBUILD_MESSAGE =
  'Sharing requires a development build with native modules. Please rebuild your dev client.';

// Attempt to load native modules at import time — null if missing from binary
let viewShot = null;
try { viewShot = require('react-native-view-shot'); } catch (e) {}

let Sharing = null;
try { Sharing = require('expo-sharing'); } catch (e) {}

let MediaLibrary = null;
try { MediaLibrary = require('expo-media-library'); } catch (e) {}

let FileSystem = null;
try { FileSystem = require('expo-file-system'); } catch (e) {}

/**
 * Capture the recap view as an image
 * @param {React.RefObject} viewRef - Ref to the recap view
 * @returns {Promise<string|null>} - URI of the captured image
 */
export async function captureRecapImage(viewRef) {
  if (!viewShot) {
    Alert.alert('Feature Unavailable', REBUILD_MESSAGE);
    return null;
  }

  try {
    const uri = await viewShot.captureRef(viewRef, {
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
  if (!Sharing) {
    Alert.alert('Feature Unavailable', REBUILD_MESSAGE);
    return false;
  }

  try {
    const uri = await captureRecapImage(viewRef);
    if (!uri) return false;

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
  if (!MediaLibrary) {
    Alert.alert('Feature Unavailable', REBUILD_MESSAGE);
    return false;
  }

  try {
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
    if (!uri) return false;

    const asset = await MediaLibrary.createAssetAsync(uri);

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
  if (!FileSystem || !Sharing) {
    Alert.alert('Feature Unavailable', REBUILD_MESSAGE);
    return false;
  }

  try {
    const uri = await captureRecapImage(viewRef);
    if (!uri) return false;

    const filename = `${FileSystem.cacheDirectory}gymvy_recap_${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: filename });

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
