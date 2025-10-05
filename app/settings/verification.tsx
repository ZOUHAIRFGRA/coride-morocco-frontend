import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Modal
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

const DocumentVerification = () => {
  const router = useRouter();
  const { 
    getDocuments, 
    uploadIdentityDocument, 
    uploadDriverLicense, 
    getDocumentStatus 
  } = useUser();

  const [documents, setDocuments] = useState<UserDocuments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const documentTypes = [
    { value: 'national_id', label: 'National ID', icon: 'card', description: 'Moroccan National Identity Card' },
    { value: 'passport', label: 'Passport', icon: 'airplane', description: 'Valid passport' },
    { value: 'residence_permit', label: 'Residence Permit', icon: 'document-text', description: 'Residence permit for foreigners' }
  ];

  useEffect(() => {
    loadDocuments();
    requestPermissions();
  }, []);

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
      setIsUploading(true);
      setUploadProgress('Preparing documents...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create File objects from assets
      const frontBlob = await fetch(frontAsset.uri).then(r => r.blob());
      const frontFile = new File([frontBlob], `${documentType}_front.jpg`, { type: 'image/jpeg' });
      
      let backFile = undefined;
      if (backAsset) {
        const backBlob = await fetch(backAsset.uri).then(r => r.blob());
        backFile = new File([backBlob], `${documentType}_back.jpg`, { type: 'image/jpeg' });
      }

      setUploadProgress('Uploading to server...');
      const response = await uploadIdentityDocument(frontFile, documentType, backFile);
      
      if (response.success) {
        setUploadProgress('Upload successful!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Document uploaded successfully! It will be reviewed within 24-48 hours.');
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
    let frontAsset: any = null;
    let backAsset: any = null;
    let licenseNumber = '';
    let expiryDate = '';

    // First, get license details
    Alert.prompt(
      'Driver License Details',
      'Enter your license number',
      (text) => {
        if (!text || text.trim().length < 5) {
          Alert.alert('Error', 'Please enter a valid license number');
          return;
        }
        licenseNumber = text.trim();

        // Get expiry date
        Alert.prompt(
          'License Expiry Date',
          'Enter expiry date (YYYY-MM-DD)',
          (dateText) => {
            if (!dateText || !dateText.match(/^\d{4}-\d{2}-\d{2}$/)) {
              Alert.alert('Error', 'Please enter date in YYYY-MM-DD format (e.g., 2025-12-31)');
              return;
            }
            expiryDate = `${dateText}T23:59:59`;

            // Now get images
            showImagePicker((asset) => {
              frontAsset = asset;
              
              Alert.alert(
                'Back Side Required',
                'Please also upload the back side of your driver license',
                [
                  { text: 'Take Back Photo', onPress: () => {
                    showImagePicker((backAssetData) => {
                      backAsset = backAssetData;
                      performDriverLicenseUpload(frontAsset, backAsset, licenseNumber, expiryDate);
                    });
                  }}
                ]
              );
            });
          }
        );
      }
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

      // Create File objects
      const frontBlob = await fetch(frontAsset.uri).then(r => r.blob());
      const frontFile = new File([frontBlob], 'license_front.jpg', { type: 'image/jpeg' });
      
      const backBlob = await fetch(backAsset.uri).then(r => r.blob());
      const backFile = new File([backBlob], 'license_back.jpg', { type: 'image/jpeg' });

      setUploadProgress('Uploading license...');
      const response = await uploadDriverLicense(frontFile, backFile, licenseNumber, expiryDate);
      
      if (response.success) {
        setUploadProgress('License uploaded successfully!');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Driver license uploaded successfully! It will be reviewed within 24-48 hours.');
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
    <View className="bg-white rounded-xl mx-4 mb-4 shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semiBold text-gray-900">{title}</Text>
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

        <Text className="text-gray-600 text-sm mb-4">{description}</Text>

        {showImages && (frontImageUrl || backImageUrl) && (
          <View className="flex-row mb-4">
            {frontImageUrl && (
              <View className="flex-1 mr-2">
                <Text className="text-xs text-gray-500 mb-1">Front</Text>
                <Image 
                  source={{ uri: frontImageUrl }} 
                  className="w-full h-20 rounded-lg bg-gray-100"
                  resizeMode="cover"
                />
              </View>
            )}
            {backImageUrl && (
              <View className="flex-1 ml-2">
                <Text className="text-xs text-gray-500 mb-1">Back</Text>
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
          <Text className="text-xs text-gray-500 mb-3">
            Uploaded: {new Date(uploadedAt).toLocaleDateString()}
            {verifiedAt && ` • Verified: ${new Date(verifiedAt).toLocaleDateString()}`}
          </Text>
        )}

        <TouchableOpacity
          className={`py-3 px-4 rounded-lg ${
            status === 'verified' 
              ? 'bg-green-50 border border-green-200' 
              : status === 'pending'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-primary-oceanBlue600'
          }`}
          onPress={onUpload}
          disabled={isUploading}
        >
          <Text className={`text-center font-semiBold ${
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
              : 'Upload Document'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006389" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Document Verification</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
          <Text className="mt-4 text-gray-500">Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#006389" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Document Verification</Text>
        <TouchableOpacity onPress={loadDocuments}>
          <Ionicons name="refresh" size={24} color="#006389" />
        </TouchableOpacity>
      </View>

      {/* Upload Progress Modal */}
      <Modal visible={isUploading} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 mx-8 items-center">
            <ActivityIndicator size="large" color={COLORS.primary.oceanBlue700} />
            <Text className="text-gray-900 font-semiBold mt-4">Uploading Document</Text>
            <Text className="text-gray-600 text-sm mt-2 text-center">{uploadProgress}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Verification Status Summary */}
        {documents && (
          <View className="mt-4 mx-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-bold text-gray-900 mb-3">Verification Status</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Identity Verification</Text>
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
              <Text className="text-gray-600">Driver License</Text>
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
              <Text className="text-gray-600 font-medium">Can Drive Rides</Text>
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
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-3">
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
          <Text className="text-sm font-semiBold text-gray-500 uppercase px-4 mb-3">
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
        <View className="mt-6 mx-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className="text-blue-800 font-medium">Verification Process</Text>
              <Text className="text-blue-700 text-sm mt-1">
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