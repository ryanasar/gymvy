import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/lib/auth';
import { useSync } from '@/contexts/SyncContext';
import { createPost, updatePost } from '@/services/api/posts';
import { uploadImage, deleteImage } from '@/services/api/storage';
import { storage } from '@/services/storage';
import { preparePostImage } from '@/utils/imageUpload';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TagUsersModal from '@/components/post/TagUsersModal';
import { createTagNotification } from '@/services/api/notifications';

const CreatePostScreen = () => {
  const colors = useThemeColors();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, refreshPosts } = useAuth();
  const { manualSync } = useSync();

  // Determine if we're editing or creating
  const postId = params.postId;
  const isEditMode = !!postId;

  // Safely parse JSON params with try-catch to prevent crashes
  let workoutData = null;
  let initialTaggedUsers = [];
  try {
    workoutData = params.workoutData ? JSON.parse(params.workoutData) : null;
  } catch (e) {
    console.error('[CreatePost] Failed to parse workoutData:', e);
  }
  try {
    initialTaggedUsers = params.taggedUsers ? JSON.parse(params.taggedUsers) : [];
  } catch (e) {
    console.error('[CreatePost] Failed to parse taggedUsers:', e);
  }

  const workoutSessionId = params.workoutSessionId;
  const splitId = params.splitId;
  const streak = params.streak ? parseInt(params.streak) : null;
  const isSplitCompleted = params.isSplitCompleted === 'true';
  const initialDescription = params.description || '';
  const initialImageUrl = params.imageUrl || null;

  const [description, setDescription] = useState(initialDescription);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(initialImageUrl);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);
  const [taggedUsers, setTaggedUsers] = useState(initialTaggedUsers);
  const [showTagUsersModal, setShowTagUsersModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleImagePick = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Library',
          onPress: handleChooseFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        setSelectedImage(photoUri);

        // Save to camera roll
        try {
          const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
          if (mediaStatus === 'granted') {
            await MediaLibrary.saveToLibraryAsync(photoUri);
          }
        } catch (saveError) {
          console.warn('Could not save to camera roll:', saveError);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library permission is required to choose photos. Please enable it in your device settings.'
        );
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing from library:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleTagUsers = () => {
    setShowTagUsersModal(true);
  };

  const handleTagsUpdated = (users) => {
    setTaggedUsers(users);
  };

  const handleRemoveTag = (userId) => {
    setTaggedUsers(taggedUsers.filter((user) => user.id !== userId));
  };

  const handlePost = async () => {
    if (isPosting) return;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post.');
      return;
    }

    setIsPosting(true);

    try {
      let imageUrl = uploadedImageUrl;
      let imagePath = uploadedImagePath;

      // Upload image if one is selected and not already uploaded
      if (selectedImage && !uploadedImageUrl) {
        try {
          // Resize and compress image before upload
          const preparedImage = await preparePostImage(selectedImage);
          const uploadResult = await uploadImage(preparedImage.uri, 'posts');
          imageUrl = uploadResult.url;
          imagePath = uploadResult.path;
          setUploadedImageUrl(imageUrl);
          setUploadedImagePath(imagePath);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          const userChoice = await new Promise(resolve => {
            Alert.alert(
              'Image Upload Failed',
              uploadError.message || 'Failed to upload image.',
              [
                { text: 'Post Without Image', onPress: () => resolve('continue') },
                { text: 'Cancel', style: 'cancel', onPress: () => resolve('cancel') },
              ]
            );
          });
          if (userChoice === 'cancel') {
            setIsPosting(false);
            return;
          }
          imageUrl = null;
          imagePath = null;
        }
      }

      if (isEditMode) {
        // Update existing post
        const postData = {
          description: description.trim() || null,
          imageUrl: imageUrl || null,
          taggedUserIds: taggedUsers.map(u => u.id),
        };

        await updatePost(postId, postData);

        // Refresh posts to show the updated post
        await refreshPosts();

        // Trigger automatic sync
        manualSync();

        router.replace('/(tabs)');
      } else {
        // Create new post
        // Look up database ID for local workout ID
        let databaseWorkoutSessionId = null;
        if (workoutSessionId) {
          // Try to parse as integer first (in case it's already a database ID)
          const parsedId = parseInt(workoutSessionId);
          if (!isNaN(parsedId) && workoutSessionId === parsedId.toString()) {
            // It's already an integer ID
            databaseWorkoutSessionId = parsedId;
          } else {
            // It's a local ID, look up the database ID
            databaseWorkoutSessionId = await storage.getWorkoutDatabaseId(user.id, workoutSessionId);

            if (!databaseWorkoutSessionId) {
              console.log('[CreatePost] Workout not synced yet, waiting for sync...');

              // Await sync completion (if sync is in progress, this waits for it)
              try {
                await manualSync();
              } catch (error) {
                console.warn('[CreatePost] Sync error:', error);
              }

              // Check if ID is now available after sync
              databaseWorkoutSessionId = await storage.getWorkoutDatabaseId(user.id, workoutSessionId);

              // If still not available, poll briefly as a fallback
              if (!databaseWorkoutSessionId) {
                const maxWaitMs = 5000;
                const pollIntervalMs = 500;
                const startTime = Date.now();

                while (Date.now() - startTime < maxWaitMs) {
                  await new Promise(r => setTimeout(r, pollIntervalMs));
                  databaseWorkoutSessionId = await storage.getWorkoutDatabaseId(user.id, workoutSessionId);
                  if (databaseWorkoutSessionId) break;
                }
              }

              if (!databaseWorkoutSessionId) {
                Alert.alert(
                  'Sync Failed',
                  'Could not sync your workout. Please check your internet connection and try again.',
                  [{ text: 'OK', onPress: () => setIsPosting(false) }]
                );
                return;
              }
            }
          }
        }

        const postData = {
          authorId: user.id,
          title: workoutData?.dayName || 'Workout Post',
          description: description.trim() || '',
          imageUrl: imageUrl || null,
          published: true,
          workoutSessionId: databaseWorkoutSessionId,
          splitId: splitId ? parseInt(splitId) : null,
          streak: streak > 1 ? streak : null,
          isSplitCompleted: isSplitCompleted || false,
          taggedUserIds: taggedUsers.map(u => u.id),
          activityType: 'workout',
        };

        const createdPost = await createPost(postData);

        // Send tag notifications to tagged users
        if (createdPost?.id && taggedUsers.length > 0) {
          await Promise.all(
            taggedUsers.map(taggedUser =>
              createTagNotification(taggedUser.id, user.id, createdPost.id)
            )
          );
        }

        // Mark this workout session as posted
        if (workoutSessionId) {
          await AsyncStorage.setItem(`posted_${workoutSessionId}`, 'true');
        }

        // Refresh posts to show the new post
        await refreshPosts();

        // Trigger automatic sync
        manualSync();

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);

      // Clean up uploaded image if post creation failed
      if (uploadedImagePath && !isEditMode) {
        try {
          await deleteImage(uploadedImagePath);
        } catch (deleteError) {
          console.error('Error deleting uploaded image:', deleteError);
        }
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    if (description || selectedImage || taggedUsers.length > 0) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={[styles.cancelText, { color: colors.secondaryText }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditMode ? 'Edit Post' : 'Create Post'}</Text>
        <TouchableOpacity
          onPress={handlePost}
          style={[styles.headerButton, styles.postButton]}
          disabled={isPosting}
        >
          <Text style={[styles.postText, { color: colors.primary }, isPosting && { color: colors.placeholder }]}>
            {isPosting ? (isEditMode ? 'Saving...' : 'Posting...') : (isEditMode ? 'Save' : 'Post')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Workout Summary Card */}
          {workoutData && (
            <View style={[styles.workoutCard, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}>
              <View style={styles.workoutCardHeader}>
                <Text style={[styles.workoutCardTitle, { color: colors.accent }]}>Workout Completed</Text>
                <View style={[styles.completeBadge, { backgroundColor: colors.accent }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              </View>

              <Text style={[styles.workoutName, { color: colors.text }]}>{workoutData.dayName}</Text>
              {workoutData.weekNumber && workoutData.dayNumber && (
                <Text style={[styles.workoutDetails, { color: colors.secondaryText }]}>
                  Week {workoutData.weekNumber} • Day {workoutData.dayNumber}
                </Text>
              )}

              <View style={[styles.exercisesSummary, { backgroundColor: colors.cardBackground + '80' }]}>
                <Text style={[styles.exercisesSummaryTitle, { color: colors.text }]}>
                  {workoutData.exercises?.length || 0} Exercises
                </Text>
                {workoutData.exercises?.slice(0, 3).map((exercise, index) => (
                  <Text key={index} style={[styles.exercisePreview, { color: colors.secondaryText }]}>
                    • {exercise.name}
                  </Text>
                ))}
                {workoutData.exercises?.length > 3 && (
                  <Text style={[styles.exerciseMore, { color: colors.primary }]}>
                    +{workoutData.exercises.length - 3} more
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Photo</Text>
            {selectedImage || uploadedImageUrl ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage || uploadedImageUrl }}
                  style={styles.selectedImage}
                  contentFit="cover"
                  transition={200}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setUploadedImageUrl(null);
                  }}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleImagePick}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={[styles.uploadText, { color: colors.text }]}>Add Photo</Text>
                <Text style={[styles.uploadSubtext, { color: colors.secondaryText }]}>Show off your progress!</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tag Users Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Tag Workout Partners</Text>
            <TouchableOpacity style={[styles.tagButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} onPress={handleTagUsers}>
              <Text style={[styles.tagButtonText, { color: colors.primary }]}>+ Tag Users</Text>
            </TouchableOpacity>

            {taggedUsers.length > 0 && (
              <View style={styles.taggedUsersContainer}>
                {taggedUsers.map((taggedUser) => (
                  <View key={taggedUser.id} style={[styles.taggedUser, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.taggedUserText, { color: colors.primary }]}>@{taggedUser.username}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(taggedUser.id)}>
                      <Text style={[styles.removeTagText, { color: colors.primary }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Description Input - Fixed at bottom like comments */}
      <View style={[styles.descriptionInputContainer, { backgroundColor: colors.cardBackground, borderTopColor: colors.borderLight }]}>
        <TextInput
          style={[styles.descriptionInput, { backgroundColor: colors.borderLight + '30', color: colors.text }]}
          placeholder="How did your workout go? Share your thoughts..."
          placeholderTextColor={colors.placeholder}
          multiline
          blurOnSubmit
          returnKeyType="done"
          value={description}
          onChangeText={setDescription}
          maxLength={500}
        />
        <Text style={[styles.charCount, { color: colors.secondaryText }]}>{description.length}/500</Text>
      </View>

      {/* Tag Users Modal */}
      <TagUsersModal
        visible={showTagUsersModal}
        onClose={() => setShowTagUsersModal(false)}
        selectedUsers={taggedUsers}
        onUsersSelected={handleTagsUpdated}
        currentUserId={user?.id}
      />
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.light.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.light.secondaryText,
  },
  postButton: {
    alignItems: 'flex-end',
  },
  postText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  postTextDisabled: {
    color: Colors.light.placeholder,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },

  // Workout Card
  workoutCard: {
    backgroundColor: '#4CAF50' + '15',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completeBadge: {
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    marginBottom: 16,
  },
  exercisesSummary: {
    backgroundColor: Colors.light.cardBackground + '80',
    borderRadius: 12,
    padding: 12,
  },
  exercisesSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  exercisePreview: {
    fontSize: 13,
    color: Colors.light.secondaryText,
    marginBottom: 4,
  },
  exerciseMore: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
    marginTop: 4,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  optionalText: {
    color: Colors.light.placeholder,
    fontWeight: '400',
    fontSize: 14,
  },

  // Description Input Container - Fixed at bottom
  descriptionInputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
    backgroundColor: Colors.light.cardBackground,
  },
  descriptionInput: {
    backgroundColor: Colors.light.borderLight + '30',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: Colors.light.text,
    maxHeight: 100,
    minHeight: 44,
  },
  charCount: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },

  // Image Upload
  uploadButton: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.light.border,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.light.secondaryText,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Tag Users
  tagButton: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tagButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  taggedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
  },
  taggedUserText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  removeTagText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
