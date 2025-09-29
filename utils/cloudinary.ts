import * as ImagePicker from "expo-image-picker";

// Cloudinary upload preset and cloud name - replace with your actual values
const CLOUDINARY_UPLOAD_PRESET = "user_profile";
const CLOUDINARY_CLOUD_NAME = "dj2ynb4rg";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Opens the image picker and uploads the selected image to Cloudinary
 */
export const pickImageAndUpload = async (): Promise<{ imageUrl: string } | null> => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error("Permission to access media library is required");
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(result.assets[0].uri);
    return { imageUrl };
  } catch (error) {
    console.error("Error picking/uploading image:", error);
    throw error;
  }
};

/**
 * Takes a camera photo and uploads it to Cloudinary
 */
export const takePictureAndUpload = async (): Promise<{ imageUrl: string } | null> => {
  try {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      throw new Error("Permission to access camera is required");
    }

    // Take picture
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(result.assets[0].uri);
    return { imageUrl };
  } catch (error) {
    console.error("Error taking/uploading image:", error);
    throw error;
  }
};

/**
 * Uploads an image to Cloudinary
 */
const uploadToCloudinary = async (uri: string): Promise<string> => {
  try {
    // Prepare form data
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    // Upload image
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to upload image");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export default {
  pickImageAndUpload,
  takePictureAndUpload,
};
