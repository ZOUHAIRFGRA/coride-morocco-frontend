import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { COLORS } from '@/constants/theme';
import { useUser } from '@/hooks/useUserProfile';
import type { UserDocuments, DocumentType, DocumentStatus } from '@/types/user';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { FormModal } from '@/components/schema-forms/FormModal';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDocumentVerificationWebSocket } from '@/hooks/useDocumentVerificationWebSocket';
import DocumentVerificationStatus from '@/components/DocumentVerificationStatus';
import { WebSocketDebugPanel } from '@/components/WebSocketDebugPanel';

const DocumentVerification = () => {
  const router = useRouter();
  const { colors, isDarkMode } = useAppTheme();
  const { 
    getDocuments, 
    uploadIdentityDocument, 
    uploadDriverLicense, 
    getDocumentStatus,
    getVerificationStatus,
    getDocumentExtractions 
  } = useUser();

  const [documents, setDocuments] = useState<UserDocuments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  // License modal states
  const [licenseModalVisible, setLicenseModalVisible] = useState(false);
  
  // Verification tracking states (legacy - will be replaced by WebSocket)
  const [verificationTasks, setVerificationTasks] = useState<{[key: string]: string}>({});
  const [verificationStatus, setVerificationStatus] = useState<{[key: string]: any}>({});
  
  // Debug panel state
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  
  // WebSocket integration for real-time updates
  const { 
    verificationStatus: wsVerificationStatus, 
    isConnected: wsConnected, 
    resetStatus: resetWsStatus,
    testConnection: testWsConnection
  } = useDocumentVerificationWebSocket();

  const documentTypes = [
    { value: 'national_id', label: 'National ID', icon: 'card', description: 'Moroccan National Identity Card' },
    { value: 'passport', label: 'Passport', icon: 'airplane', description: 'Valid passport' },
    { value: 'residence_permit', label: 'Residence Permit', icon: 'document-text', description: 'Residence permit for foreigners' }
  ];

  // WebSocket diagnostic function
  const runWebSocketDiagnostics = async () => {
    console.log('🔍 Running WebSocket diagnostics...');
    setDebugPanelVisible(true);
  };

  // WebSocket event handlers
  const handleWebSocketVerificationComplete = (result: any) => {
    console.log('WebSocket verification completed:', result);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Verification Complete! ✅',
      'Your document has been successfully verified. All extracted data has been validated.',
      [
        {
          text: 'Refresh Documents',
          onPress: async () => {
            await loadDocuments();
          }
        }
      ]
    );
  };

  const handleWebSocketVerificationFailed = (error: string) => {
    console.log('WebSocket verification failed:', error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      'Verification Failed ❌',
      `Document verification failed: ${error}\n\nPlease check your document quality and try uploading again.`,
      [
        {
          text: 'Try Again',
          onPress: () => {
            resetWsStatus();
          }
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  useEffect(() => {
    loadDocuments();
    requestPermissions();
  }, []);

  // Monitor WebSocket connection status and fallback to polling if needed
  useEffect(() => {
    if (!wsConnected && Object.keys(verificationTasks).length > 0) {
      console.log('WebSocket disconnected, starting fallback polling for pending tasks');
      Object.entries(verificationTasks).forEach(([key, taskId]) => {
        if (!verificationStatus[key] || verificationStatus[key].status === 'processing') {
          trackVerificationStatus(taskId, key);
        }
      });
    }
  }, [wsConnected, verificationTasks]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is needed to upload documents.');
    }
  };

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      Alert.alert('Error', 'Failed to load document status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async (allowsMultipleSelection = false) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is needed to take photos.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  };

  const showImagePicker = (callback: (asset: any) => void) => {
    Alert.alert(
      'Select Document Photo',
      'Choose how to add your document photo',
      [
        { text: 'Camera', onPress: async () => {
          const asset = await takePhoto();
          if (asset) callback(asset);
        }},
        { text: 'Photo Library', onPress: async () => {
          const asset = await pickImage();
          if (asset) callback(asset);
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleUploadIdentityDocument = (documentType: DocumentType) => {
    let frontImage: any = null;
    let backImage: any = null;

    const uploadFrontImage = () => {
      showImagePicker((asset) => {
        frontImage = asset;
        
        if (documentType === 'passport') {
          // Passport only needs front image
          performIdentityUpload(documentType, frontImage, null);
        } else {
          // Ask for back image for ID and residence permit
          Alert.alert(
            'Back Side Required',
            'Please also upload the back side of your document',
            [
              { text: 'Take Back Photo', onPress: () => {
                showImagePicker((backAsset) => {
                  backImage = backAsset;
                  performIdentityUpload(documentType, frontImage, backImage);
                });
              }},
              { text: 'Skip Back Photo', onPress: () => {
                performIdentityUpload(documentType, frontImage, null);
              }}
            ]
          );
        }
      });
    };

    uploadFrontImage();
  };

  const performIdentityUpload = async (
    documentType: DocumentType, 
    frontAsset: any, 
    backAsset: any = null
  ) => {
    try {
      if (!frontAsset) {
        throw new Error("Front image is required for identity upload.");
      }

      setIsUploading(true);
      setUploadProgress('Preparing documents...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Frontend - Front asset details:', {
        uri: frontAsset.uri,
        width: frontAsset.width,
        height: frontAsset.height,
        fileSize: frontAsset.fileSize,
        type: frontAsset.type
      });

      // Create proper File objects for React Native upload
      const frontFile = {
        uri: frontAsset.uri,
        type: frontAsset.type || 'image/jpeg',
        name: `${documentType}_front.jpg`,
      } as any;

      let backFile = undefined;
      if (backAsset) {
        console.log('Frontend - Back asset details:', {
          uri: backAsset.uri,
          width: backAsset.width,
          height: backAsset.height,
          fileSize: backAsset.fileSize,
          type: backAsset.type
        });
        
        backFile = {
          uri: backAsset.uri,
          type: backAsset.type || 'image/jpeg',
          name: `${documentType}_back.jpg`,
        } as any;
      }

      setUploadProgress('Uploading to server...');
      
      // Log file details for debugging
      console.log('Frontend - Files prepared for upload:', {
        documentType,
        frontFile: frontFile.name,
        backFile: backFile?.name,
        frontImageIncluded: true,
        backImageIncluded: !!backAsset
      });
      
      const response = await uploadIdentityDocument(frontFile, documentType, backFile);
      
      if (response.success && response.data) {
        const { verification_task_id } = response.data;
        
        setUploadProgress('Upload successful! Processing document...');
        
        // Store task ID for tracking (legacy approach)
        setVerificationTasks(prev => ({
          ...prev,
          [`identity_${documentType}`]: verification_task_id
        }));
        
        // Reset WebSocket status for new verification
        resetWsStatus();
        
        // Note: WebSocket will automatically receive real-time updates
        // No need for manual polling anymore!
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Document uploaded successfully! OCR processing has started. You can track the progress below.');
        await loadDocuments(); // Refresh documents
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleUploadDriverLicense = () => {
    // Show FormModal for license details
    setLicenseModalVisible(true);
  };

  const handleLicenseDetailsSuccess = (result: any, formData: any) => {
    // Close modal
    setLicenseModalVisible(false);
    
    // Extract license details from form data
    const { licenseNumber, expiryDate } = formData;
    
    // Convert date to ISO format - handle both YYYY-MM-DD and DD/MM/YYYY formats
    let isoDate: string;
    try {
      if (expiryDate.includes('-')) {
        // YYYY-MM-DD format from date picker
        isoDate = `${expiryDate}T23:59:59`;
      } else if (expiryDate.includes('/')) {
        // DD/MM/YYYY format from manual entry
        const [day, month, year] = expiryDate.split('/');
        isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59`;
      } else {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid date format. Please try again.');
      return;
    }

    // Store license details and start the photo upload process
    const licenseDetails = {
      licenseNumber: licenseNumber.trim(),
      expiryDate: isoDate
    };

    // Start image selection process
    Alert.alert(
      'Upload License Photos',
      'Please take photos of both sides of your driver license. Make sure all text is clearly visible.',
      [
        { 
          text: 'Start Upload', 
          onPress: () => uploadLicensePhotos(licenseDetails)
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
  };

  const uploadLicensePhotos = (licenseDetails: { licenseNumber: string, expiryDate: string }) => {
    let frontAsset: any = null;
    let backAsset: any = null;

    // First, get front photo
    Alert.alert(
      'Front Side Photo',
      'Take or select a photo of the front side of your driver license',
      [
        { 
          text: 'Take Photo', 
          onPress: async () => {
            const asset = await takePhoto();
            if (asset) {
              frontAsset = asset;
              promptForBackPhoto(licenseDetails, frontAsset);
            }
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: async () => {
            const asset = await pickImage();
            if (asset) {
              frontAsset = asset;
              promptForBackPhoto(licenseDetails, frontAsset);
            }
          }
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
  };

  const promptForBackPhoto = (licenseDetails: { licenseNumber: string, expiryDate: string }, frontAsset: any) => {
    Alert.alert(
      'Back Side Photo',
      'Now take or select a photo of the back side of your driver license',
      [
        { 
          text: 'Take Photo', 
          onPress: async () => {
            const backAsset = await takePhoto();
            if (backAsset) {
              performDriverLicenseUpload(frontAsset, backAsset, licenseDetails.licenseNumber, licenseDetails.expiryDate);
            }
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: async () => {
            const backAsset = await pickImage();
            if (backAsset) {
              performDriverLicenseUpload(frontAsset, backAsset, licenseDetails.licenseNumber, licenseDetails.expiryDate);
            }
          }
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ]
    );
  };

  const performDriverLicenseUpload = async (
    frontAsset: any,
    backAsset: any,
    licenseNumber: string,
    expiryDate: string
  ) => {
    try {
      setIsUploading(true);
      setUploadProgress('Preparing license documents...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Frontend - License front asset:', {
        uri: frontAsset.uri,
        fileSize: frontAsset.fileSize,
        type: frontAsset.type
      });
      
      console.log('Frontend - License back asset:', {
        uri: backAsset.uri,
        fileSize: backAsset.fileSize,
        type: backAsset.type
      });

      // Create proper File objects for React Native upload
      const frontFile = {
        uri: frontAsset.uri,
        type: frontAsset.type || 'image/jpeg',
        name: 'license_front.jpg',
      } as any;
      
      const backFile = {
        uri: backAsset.uri,
        type: backAsset.type || 'image/jpeg',
        name: 'license_back.jpg',
      } as any;

      setUploadProgress('Uploading license...');
      
      console.log('Frontend - License files prepared for upload:', {
        licenseNumber,
        expiryDate,
        frontFile: frontFile.name,
        backFile: backFile.name,
        frontImageIncluded: true,
        backImageIncluded: true
      });
      
      const response = await uploadDriverLicense(frontFile, backFile, licenseNumber, expiryDate);
      
      if (response.success && response.data) {
        const { verification_task_id } = response.data;
        
        setUploadProgress('License uploaded successfully! Processing document...');
        
        // Store task ID for tracking (legacy approach)
        setVerificationTasks(prev => ({
          ...prev,
          driver_license: verification_task_id
        }));
        
        // Reset WebSocket status for new verification
        resetWsStatus();
        
        // Note: WebSocket will automatically receive real-time updates
        // No need for manual polling anymore!
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Driver license uploaded successfully! OCR processing has started. You can track the progress below.');
        await loadDocuments(); // Refresh documents
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('License upload failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload driver license. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // Legacy verification tracking function (fallback when WebSocket is not connected)
  const trackVerificationStatus = async (taskId: string, documentKey: string) => {
    // Only use polling if WebSocket is not connected
    if (wsConnected) {
      console.log('WebSocket is connected, skipping polling for:', documentKey);
      return;
    }
    
    console.log('WebSocket not available, falling back to polling for:', documentKey);
    const maxAttempts = 30; // Maximum polling attempts (5 minutes at 10s intervals)
    let attempts = 0;
    
    const pollStatus = async () => {
      try {
        if (attempts >= maxAttempts) {
          console.log(`Verification tracking stopped for ${documentKey} - max attempts reached`);
          return;
        }
        
        const response = await getVerificationStatus(taskId);
        
        if (response.success && response.data) {
          const status = response.data;
          
          // Update verification status state
          setVerificationStatus(prev => ({
            ...prev,
            [documentKey]: status
          }));
          
          console.log(`Verification status for ${documentKey}:`, status);
          
          // Continue polling if still processing
          if (status.status === 'pending' || status.status === 'processing') {
            attempts++;
            setTimeout(pollStatus, 10000); // Poll every 10 seconds
          } else if (status.status === 'completed') {
            console.log(`Verification completed for ${documentKey}:`, status.extracted_data);
            // Refresh documents when verification completes
            await loadDocuments();
          } else if (status.status === 'failed') {
            console.error(`Verification failed for ${documentKey}:`, status.error);
          }
        }
      } catch (error) {
        console.error(`Error checking verification status for ${documentKey}:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollStatus, 10000);
        }
      }
    };
    
    // Start polling immediately
    pollStatus();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const DocumentCard = ({ 
    title, 
    status, 
    uploadedAt, 
    verifiedAt, 
    onUpload, 
    showImages = false,
    frontImageUrl,
    backImageUrl,
    description
  }: {
    title: string;
    status?: string;
    uploadedAt?: string;
    verifiedAt?: string;
    onUpload: () => void;
    showImages?: boolean;
    frontImageUrl?: string;
    backImageUrl?: string;
    description: string;
  }) => (
    <View style={{
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border.secondary
    }}>
      <View style={{ padding: 16 }}>
        {/* Add visual upload zone when no document exists */}
        {!status && (
          <TouchableOpacity
            onPress={onUpload}
            disabled={isUploading}
            className="mb-4 p-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50"
            style={{
              backgroundColor: isUploading ? '#F3F4F6' : '#EFF6FF',
              borderColor: isUploading ? '#D1D5DB' : '#93C5FD'
            }}
          >
            <View className="items-center">
              <Ionicons 
                name="cloud-upload-outline" 
                size={32} 
                color={isUploading ? '#9CA3AF' : '#3B82F6'} 
              />
              <Text className="mt-2 text-blue-600 font-semiBold text-center">
                Tap here to upload {title.toLowerCase()}
              </Text>
              <Text className="mt-1 text-blue-500 text-sm text-center">
                Take photo or choose from gallery
              </Text>
            </View>
          </TouchableOpacity>
        )}
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>{title}</Text>
          {status && (
            <View className="flex-row items-center">
              <Ionicons 
                name={getStatusIcon(status) as any} 
                size={16} 
                color={getStatusColor(status)} 
              />
              <Text 
                className="ml-1 text-sm font-medium capitalize"
                style={{ color: getStatusColor(status) }}
              >
                {status}
              </Text>
            </View>
          )}
        </View>

        <Text style={{
          color: colors.text.secondary,
          fontSize: 14,
          marginBottom: 16
        }}>{description}</Text>

        {showImages && (frontImageUrl || backImageUrl) && (
          <View className="flex-row mb-4">
            {frontImageUrl && (
              <View className="flex-1 mr-2">
                <Text style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginBottom: 4
                }}>Front</Text>
                <Image 
                  source={{ uri: frontImageUrl }} 
                  className="w-full h-20 rounded-lg bg-gray-100"
                  resizeMode="cover"
                />
              </View>
            )}
            {backImageUrl && (
              <View className="flex-1 ml-2">
                <Text style={{
                  fontSize: 12,
                  color: colors.text.secondary,
                  marginBottom: 4
                }}>Back</Text>
                <Image 
                  source={{ uri: backImageUrl }} 
                  className="w-full h-20 rounded-lg bg-gray-100"
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        )}

        {uploadedAt && (
          <Text style={{
            fontSize: 12,
            color: colors.text.secondary,
            marginBottom: 12
          }}>
            Uploaded: {new Date(uploadedAt).toLocaleDateString()}
            {verifiedAt && ` • Verified: ${new Date(verifiedAt).toLocaleDateString()}`}
          </Text>
        )}

        {/* Only show button-style upload for documents that already exist (have status) */}
        {status && (
          <TouchableOpacity
            className={`py-4 px-4 rounded-xl flex-row items-center justify-center ${
              status === 'verified' 
                ? 'bg-green-50 border-2 border-green-200' 
                : status === 'pending'
                ? 'bg-amber-50 border-2 border-amber-200'
                : 'bg-primary-oceanBlue600 border-2 border-primary-oceanBlue600'
            } ${isUploading ? 'opacity-50' : ''}`}
            onPress={onUpload}
            disabled={isUploading}
            style={{
              shadowColor: status === 'verified' || status === 'pending' ? '#000' : '#006389',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {/* Upload Icon */}
            <Ionicons 
              name={
                status === 'verified' ? 'refresh-circle' : 
                status === 'pending' ? 'cloud-upload' : 
                'camera'
              } 
              size={20} 
              color={
                status === 'verified' ? '#047857' : 
                status === 'pending' ? '#D97706' : 
                'white'
              } 
            />
            
            {/* Upload Text */}
            <Text className={`ml-2 text-center font-semiBold ${
              status === 'verified' 
                ? 'text-green-700' 
                : status === 'pending'
                ? 'text-amber-700'
                : 'text-white'
            }`}>
              {status === 'verified' 
                ? 'Re-upload Document' 
                : status === 'pending'
                ? 'Upload New Version'
                : 'Tap to Upload Document'
              }
            </Text>

            {/* Arrow indicating action */}
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={
                status === 'verified' ? '#047857' : 
                status === 'pending' ? '#D97706' : 
                'white'
              }
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background.secondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.primary
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Document Verification</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text style={{
            marginTop: 16,
            color: colors.text.secondary
          }}>Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.primary
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary
          }}>Document Verification</Text>
          {/* WebSocket Connection Status */}
          <View className="ml-2 flex-row items-center">
            <View 
              className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Text className={`text-xs ml-1 ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
              {wsConnected ? 'Live' : 'Offline'}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity onPress={runWebSocketDiagnostics}>
            <Ionicons name="bug" size={20} color={colors.primary.dark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadDocuments}>
            <Ionicons name="refresh" size={24} color={colors.primary.dark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* License Details Form Modal */}
      <FormModal
        visible={licenseModalVisible}
        formName="driverLicenseDetails"
        onClose={() => setLicenseModalVisible(false)}
        onSuccess={handleLicenseDetailsSuccess}
      />

      {/* Upload Progress Modal */}
      <Modal visible={isUploading} transparent animationType="fade">
        <View 
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        >
          <View style={{
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 24,
            marginHorizontal: 32,
            alignItems: 'center',
            shadowColor: colors.text.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8
          }}>
            <ActivityIndicator size="large" color={colors.primary.oceanBlue700} />
            <Text style={{
              color: colors.text.primary,
              fontWeight: '600',
              marginTop: 16,
              fontSize: 16
            }}>Uploading Document</Text>
            <Text style={{
              color: colors.text.secondary,
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center'
            }}>{uploadProgress}</Text>
          </View>
        </View>
      </Modal>

      {/* WebSocket Debug Panel */}
      <WebSocketDebugPanel
        visible={debugPanelVisible}
        onClose={() => setDebugPanelVisible(false)}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Real-time Verification Status with WebSocket */}
        <DocumentVerificationStatus
          onVerificationComplete={handleWebSocketVerificationComplete}
          onVerificationFailed={handleWebSocketVerificationFailed}
          showConnectionStatus={true}
        />

        {/* Legacy Verification Progress Tracking (Fallback) */}
        {!wsConnected && Object.keys(verificationStatus).length > 0 && (
          <View className="mt-4 mx-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={20} color="#D97706" />
              <Text className="text-lg font-bold text-yellow-900 ml-2">📊 Fallback Status (Polling)</Text>
            </View>
            <Text className="text-sm text-yellow-800 mb-3">
              Real-time updates unavailable. Using polling method.
            </Text>
            {Object.entries(verificationStatus).map(([key, status]: [string, any]) => (
              <View key={key} className="mb-3 last:mb-0">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-medium text-yellow-800 capitalize">{key.replace('_', ' ')}</Text>
                  <Text className={`text-sm font-medium ${
                    status.status === 'completed' ? 'text-green-600' :
                    status.status === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {status.status.toUpperCase()}
                  </Text>
                </View>
                <View className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                  <View 
                    className={`h-2 rounded-full ${
                      status.status === 'completed' ? 'bg-green-500' :
                      status.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${status.progress || 0}%` }}
                  />
                </View>
                {status.message && (
                  <Text className="text-sm text-yellow-700">{status.message}</Text>
                )}
                {status.extracted_data && (
                  <View className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <Text className="text-xs font-medium text-green-800 mb-1">✅ Extracted Data:</Text>
                    {Object.entries(status.extracted_data).map(([field, value]: [string, any]) => (
                      <Text key={field} className="text-xs text-green-700">
                        {field}: {typeof value === 'string' ? value : JSON.stringify(value)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Verification Status Summary */}
        {documents && (
          <View style={{
            marginTop: 16,
            marginHorizontal: 16,
            backgroundColor: colors.background.secondary,
            borderRadius: 12,
            padding: 16,
            shadowColor: colors.text.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.border.secondary
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text.primary,
              marginBottom: 12
            }}>Verification Status</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text style={{color: colors.text.secondary}}>Identity Verification</Text>
              <View className="flex-row items-center">
                <Ionicons 
                  name={documents.verification_summary.identity_verified ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={documents.verification_summary.identity_verified ? '#10B981' : '#EF4444'} 
                />
                <Text className={`ml-1 text-sm font-medium ${
                  documents.verification_summary.identity_verified ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documents.verification_summary.identity_verified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text style={{color: colors.text.secondary}}>Driver License</Text>
              <View className="flex-row items-center">
                <Ionicons 
                  name={documents.verification_summary.driver_license_verified ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={documents.verification_summary.driver_license_verified ? '#10B981' : '#EF4444'} 
                />
                <Text className={`ml-1 text-sm font-medium ${
                  documents.verification_summary.driver_license_verified ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documents.verification_summary.driver_license_verified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text style={{
                color: colors.text.secondary,
                fontWeight: '500'
              }}>Can Drive Rides</Text>
              <View className="flex-row items-center">
                <Ionicons 
                  name={documents.verification_summary.can_drive ? 'car' : 'ban'} 
                  size={16} 
                  color={documents.verification_summary.can_drive ? '#10B981' : '#EF4444'} 
                />
                <Text className={`ml-1 text-sm font-medium ${
                  documents.verification_summary.can_drive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {documents.verification_summary.can_drive ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Identity Documents Section */}
        <View className="mt-6">
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.text.secondary,
            textTransform: 'uppercase',
            paddingHorizontal: 16,
            marginBottom: 12
          }}>
            Identity Documents
          </Text>
          
          {documents?.identity_documents && documents.identity_documents.length > 0 ? (
            documents.identity_documents.map((doc, index) => {
              const typeInfo = documentTypes.find(t => t.value === doc.document_type) || documentTypes[0];
              return (
                <DocumentCard
                  key={index}
                  title={typeInfo.label}
                  description={typeInfo.description}
                  status={doc.status}
                  uploadedAt={doc.uploaded_at}
                  verifiedAt={doc.verified_at}
                  showImages={true}
                  frontImageUrl={doc.front_image_url}
                  backImageUrl={doc.back_image_url}
                  onUpload={() => handleUploadIdentityDocument(doc.document_type as DocumentType)}
                />
              );
            })
          ) : (
            <View>
              {documentTypes.map((docType) => (
                <DocumentCard
                  key={docType.value}
                  title={docType.label}
                  description={docType.description}
                  onUpload={() => handleUploadIdentityDocument(docType.value as DocumentType)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Driver License Section */}
        <View className="mt-6">
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.secondary,
            textTransform: 'uppercase',
            paddingHorizontal: 16,
            marginBottom: 12
          }}>
            Driver License
          </Text>
          
          {documents?.driver_license ? (
            <DocumentCard
              title="Driver License"
              description="Valid Moroccan driver license required to offer rides"
              status={documents.driver_license.status}
              uploadedAt={documents.driver_license.uploaded_at}
              verifiedAt={documents.driver_license.verified_at}
              showImages={true}
              frontImageUrl={documents.driver_license.front_image_url}
              backImageUrl={documents.driver_license.back_image_url}
              onUpload={handleUploadDriverLicense}
            />
          ) : (
            <DocumentCard
              title="Driver License"
              description="Upload your driver license to offer rides as a driver. Both front and back photos are required along with license number and expiry date."
              onUpload={handleUploadDriverLicense}
            />
          )}
        </View>

        {/* Info Section */}
        <View style={{
          marginTop: 24,
          marginHorizontal: 16,
          backgroundColor: isDarkMode ? colors.background.secondary : '#EFF6FF',
          borderWidth: 1,
          borderColor: isDarkMode ? colors.border.primary : '#BFDBFE',
          borderRadius: 12,
          padding: 16
        }}>
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium">Verification Process</Text>
              <Text className="text-blue-700 text-sm mt-1">
                • Real-time processing updates via WebSocket{'\n'}
                • Documents are reviewed within 24-48 hours{'\n'}
                • Ensure photos are clear and well-lit{'\n'}
                • All information must be clearly visible{'\n'}
                • Identity verification is required for all users{'\n'}
                • Driver license is required only to offer rides
              </Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentVerification;