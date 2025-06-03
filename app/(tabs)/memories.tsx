import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Plus, X, Camera, Play } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Text from '@/components/typography/Text';
import Button from '@/components/Button';
import MemoryCard from '@/components/MemoryCard';
import Colors from '@/constants/Colors';
import Spacing from '@/constants/Spacing';
import { FontSizes } from '@/constants/Fonts';
import { Memory } from '@/types';
import { getMemories, addMemory, deleteMemory, updateElderStatus } from '@/utils/storage';
import { requestCameraPermissions, requestMediaLibraryPermissions } from '@/utils/permissions';

export default function MemoriesScreen() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  
  // Form state
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [caption, setCaption] = useState('');

  useEffect(() => {
    loadMemories();
    
    // Update the elder's status
    updateElderStatus({
      lastSeen: Date.now(),
    });
  }, []);

  const loadMemories = async () => {
    const data = await getMemories();
    setMemories(data);
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is needed to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermissions();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Photo library permission is needed to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddMemory = async () => {
    if (!imageUri) {
      Alert.alert('Missing Image', 'Please take or select a photo for this memory.');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Missing Caption', 'Please add a caption to describe this memory.');
      return;
    }

    // Create new memory
    const newMemory: Memory = {
      id: Date.now().toString(),
      imageUri,
      caption,
      timestamp: Date.now(),
    };

    // Save memory
    await addMemory(newMemory);
    
    // Refresh list
    await loadMemories();
    
    // Reset form and close modal
    resetForm();
    setAddModalVisible(false);
  };

  const resetForm = () => {
    setImageUri(undefined);
    setCaption('');
  };

  const handleViewMemory = (index: number) => {
    setCurrentMemoryIndex(index);
    setViewModalVisible(true);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            await deleteMemory(memoryId);
            await loadMemories();
            setViewModalVisible(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const startSlideshow = () => {
    setSlideshowActive(true);
    setViewModalVisible(false);
    
    if (memories.length > 0) {
      // Navigate to a dedicated slideshow view or handle in-page
      // For this MVP, we'll just show an alert
      Alert.alert(
        'Slideshow Started', 
        'In a full implementation, this would start a full-screen slideshow with music.',
        [
          {
            text: 'Stop',
            onPress: () => setSlideshowActive(false),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">Memory Lane</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.slideshowButton]}
            onPress={startSlideshow}
          >
            <Play size={20} color={Colors.primary[600]} />
            <Text variant="bodySmall" color={Colors.primary[600]}>
              Slideshow
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {memories.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="h3" center style={styles.emptyTitle}>
            No Memories Yet
          </Text>
          <Text variant="body" center color={Colors.gray[500]} style={styles.emptyText}>
            Add photos and captions to create your memory collection.
          </Text>
          <Button
            title="Add Memory"
            size="large"
            onPress={() => setAddModalVisible(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={memories}
          renderItem={({ item, index }) => (
            <MemoryCard memory={item} onPress={() => handleViewMemory(index)} />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.memoryGrid}
          contentContainerStyle={styles.memoriesList}
        />
      )}

      {/* Add Memory Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setAddModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h2">Add Memory</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setAddModalVisible(false);
                  resetForm();
                }}
              >
                <X size={24} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerContainer}>
              {imageUri ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(undefined)}
                  >
                    <X size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePickerButtons}>
                  <Button
                    title="Take Photo"
                    variant="outline"
                    icon={<Camera size={20} color={Colors.primary[600]} />}
                    onPress={takePicture}
                    style={styles.imagePickerButton}
                  />
                  <Button
                    title="Choose from Gallery"
                    variant="outline"
                    onPress={pickImage}
                    style={styles.imagePickerButton}
                  />
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text variant="bodyLarge" bold style={styles.label}>
                Caption
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={caption}
                onChangeText={setCaption}
                placeholder="Describe this memory..."
                placeholderTextColor={Colors.gray[400]}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <Button
              title="Save Memory"
              size="large"
              onPress={handleAddMemory}
              style={styles.saveButton}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* View Memory Modal */}
      {memories.length > 0 && (
        <Modal
          visible={viewModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setViewModalVisible(false)}
        >
          <View style={styles.viewModalContainer}>
            <TouchableOpacity
              style={styles.closeViewButton}
              onPress={() => setViewModalVisible(false)}
            >
              <X size={28} color={Colors.white} />
            </TouchableOpacity>
            
            <Image
              source={{ uri: memories[currentMemoryIndex]?.imageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            
            <View style={styles.captionContainer}>
              <Text variant="body" color={Colors.white} style={styles.viewCaption}>
                {memories[currentMemoryIndex]?.caption}
              </Text>
              <Text variant="caption" color={Colors.gray[300]}>
                {new Date(memories[currentMemoryIndex]?.timestamp).toLocaleDateString()}
              </Text>
              
              <View style={styles.memoryActions}>
                <Button
                  title="Delete"
                  variant="danger"
                  size="small"
                  onPress={() => handleDeleteMemory(memories[currentMemoryIndex]?.id)}
                  style={styles.memoryActionButton}
                />
                <Button
                  title="Start Slideshow"
                  size="small"
                  onPress={startSlideshow}
                  style={styles.memoryActionButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 16,
    marginRight: Spacing.sm,
  },
  slideshowButton: {
    backgroundColor: Colors.primary[50],
  },
  addButton: {
    backgroundColor: Colors.primary[600],
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
  memoriesList: {
    padding: Spacing.md,
  },
  memoryGrid: {
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing.lg,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  imagePickerContainer: {
    marginBottom: Spacing.lg,
  },
  imagePickerButtons: {
    gap: Spacing.md,
  },
  imagePickerButton: {
    marginBottom: Spacing.sm,
  },
  selectedImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
  viewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  closeViewButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: Spacing.sm,
  },
  fullImage: {
    width: '100%',
    height: '60%',
  },
  captionContainer: {
    padding: Spacing.lg,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  viewCaption: {
    marginBottom: Spacing.sm,
  },
  memoryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  memoryActionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});