import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '@/hooks/useThemeColors';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ColorSlider from '@/components/ui/ColorSlider';
import ModalHeader from '@/components/ui/ModalHeader';
import { createCommunity, updateCommunity } from '@/services/api/communities';
import { uploadImage } from '@/services/api/storage';

const CreateCommunityModal = ({ visible, onClose, onCommunityCreated, editMode, community }) => {
  const colors = useThemeColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [removedImage, setRemovedImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editMode && community) {
        setName(community.name || '');
        setDescription(community.description || '');
        setIsPublic(community.visibility === 'PUBLIC');
        setSelectedImage(null);
        setSelectedColor(community.color || null);
        setRemovedImage(false);
      } else {
        setName('');
        setDescription('');
        setIsPublic(false);
        setSelectedImage(null);
        setSelectedColor(null);
        setRemovedImage(false);
      }
    }
  }, [visible, editMode, community]);

  const handleImagePick = () => {
    Alert.alert('Community Photo', 'Choose how you want to add a photo', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handleChooseFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error choosing from library:', error);
    }
  };

  const handleSave = async () => {
    if (isSaving || !name.trim()) return;
    setIsSaving(true);

    try {
      let imageUrl = editMode ? community?.imageUrl : null;

      if (selectedImage) {
        const uploadResult = await uploadImage(selectedImage, 'communities');
        imageUrl = uploadResult.url;
      } else if (removedImage) {
        imageUrl = null;
      }

      const data = {
        name: name.trim(),
        description: description.trim() || null,
        imageUrl,
        color: selectedColor,
        ...(!editMode && { visibility: isPublic ? 'PUBLIC' : 'PRIVATE' }),
      };

      let result;
      if (editMode && community) {
        result = await updateCommunity(community.id, data);
      } else {
        result = await createCommunity(data);
      }

      if (!editMode) {
        if (isPublic) {
          Alert.alert('Submitted for Approval', 'Your public community has been submitted for review. You\'ll be notified when it\'s approved.');
        } else {
          Alert.alert(
            'Community Created!',
            `Your invite code is: ${result.inviteCode}`,
            [
              {
                text: 'Share Code',
                onPress: () => Share.share({ message: result.inviteCode }),
              },
              { text: 'OK' },
            ]
          );
        }
      }

      onCommunityCreated?.(result);
      onClose();
    } catch (error) {
      console.error('Error saving community:', error);
      Alert.alert('Error', 'Failed to save community. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = editMode
    ? name !== (community?.name || '') || description !== (community?.description || '') || selectedImage !== null || removedImage || selectedColor !== (community?.color || null)
    : name.trim().length > 0;

  const handleClose = () => {
    if (hasChanges && (editMode || name.trim())) {
      Alert.alert('Discard Changes?', 'You have unsaved changes. Are you sure you want to discard them?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  const avatarSource = selectedImage || (editMode && !removedImage ? community?.imageUrl : null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ModalHeader
          title={editMode ? 'Edit Community' : 'New Community'}
          onClose={handleClose}
          rightAction={
            <TouchableOpacity onPress={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.saveText, { color: colors.primary }, !name.trim() && { opacity: 0.4 }]}>
                  {editMode ? 'Save' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Picker */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePick} activeOpacity={0.8}>
                {avatarSource ? (
                  <Image source={{ uri: avatarSource }} style={styles.avatar} contentFit="cover" transition={200} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.borderLight }]}>
                    <Ionicons name="people" size={40} color={colors.secondaryText} />
                  </View>
                )}
                <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  <Ionicons name="camera" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              {avatarSource && (
                <TouchableOpacity
                  style={[styles.avatarRemoveButton, { backgroundColor: colors.borderLight }]}
                  onPress={() => {
                    setSelectedImage(null);
                    if (editMode && community?.imageUrl) setRemovedImage(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color={colors.secondaryText} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.imageTip, { color: colors.secondaryText }]}>
              Tip: Use a simple logo or icon for best results
            </Text>

            {/* Color Picker */}
            <Text style={[styles.colorLabel, { color: colors.text }]}>Badge Color</Text>
            <ColorSlider
              value={selectedColor}
              onColorChange={setSelectedColor}
              style={{ width: '100%', marginBottom: 14 }}
            />
            <View style={styles.colorPreviewRow}>
              <Badge label={name || 'Community'} image={avatarSource} color={selectedColor || colors.primary} size="md" />
            </View>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Name <Text style={{ color: colors.primary }}>*</Text></Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, color: colors.text }]}
              placeholder="Community name"
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoCapitalize="words"
            />
            <Text style={[styles.charCount, { color: colors.secondaryText }]}>{name.length}/20</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.cardBackground, borderColor: colors.borderLight, color: colors.text }]}
              placeholder="What's this community about?"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: colors.secondaryText }]}>{description.length}/500</Text>
          </View>

          {/* Visibility Toggle */}
          {!editMode && (
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Public Community</Text>
                  <Text style={[styles.toggleDescription, { color: colors.secondaryText }]}>
                    Public communities are visible to everyone and require approval. Private communities use invite codes.
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: colors.borderLight, true: colors.primary + '80' }}
                  thumbColor={isPublic ? colors.primary : colors.cardBackground}
                  ios_backgroundColor={colors.borderLight}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateCommunityModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  imageTip: {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.6,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  colorPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRemoveButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
  charCount: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
