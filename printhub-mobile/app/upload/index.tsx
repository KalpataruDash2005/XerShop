import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/src/constants/Colors';
import { useCartStore } from '@/src/store/authStore';
import { generateId, formatFileSize } from '@/src/lib/utils';
import { Upload, FileText, Image, X, ChevronRight } from 'lucide-react-native';

interface UploadedFile {
  id: string;
  fileName: string;
  fileUri: string;
  fileSize: number;
  pageCount: number;
}

export default function UploadScreen() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset) => ({
          id: generateId(),
          fileName: asset.name,
          fileUri: asset.uri,
          fileSize: asset.size || 0,
          pageCount: Math.floor(Math.random() * 20) + 1, // Simulated
        }));
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset) => ({
          id: generateId(),
          fileName: asset.fileName || `Image_${Date.now()}.jpg`,
          fileUri: asset.uri,
          fileSize: asset.fileSize || 0,
          pageCount: 1,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newFile: UploadedFile = {
          id: generateId(),
          fileName: `Photo_${Date.now()}.jpg`,
          fileUri: result.assets[0].uri,
          fileSize: result.assets[0].fileSize || 0,
          pageCount: 1,
        };
        setFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleContinue = () => {
    if (files.length === 0) {
      Alert.alert('Error', 'Please upload at least one file');
      return;
    }

    files.forEach((file) => {
      addItem({
        id: file.id,
        fileName: file.fileName,
        fileUri: file.fileUri,
        pageCount: file.pageCount,
        copies: 1,
        colorMode: 'BW',
        sides: 'SINGLE',
        paperSize: 'A4',
        gsm: 70,
        binding: 'NONE',
        lamination: false,
      });
    });

    router.push('/shops' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>Choose files to print</Text>

        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={pickDocument}>
            <View style={[styles.optionIcon, { backgroundColor: '#2F6FED20' }]}>
              <FileText color="#2F6FED" size={28} />
            </View>
            <Text style={styles.optionTitle}>Documents</Text>
            <Text style={styles.optionSubtitle}>PDF, DOC, PPT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOption} onPress={pickImage}>
            <View style={[styles.optionIcon, { backgroundColor: '#16A34A20' }]}>
              <Image color="#16A34A" size={28} />
            </View>
            <Text style={styles.optionTitle}>Gallery</Text>
            <Text style={styles.optionSubtitle}>Photos & Images</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOption} onPress={takePhoto}>
            <View style={[styles.optionIcon, { backgroundColor: '#F59E0B20' }]}>
              <Upload color="#F59E0B" size={28} />
            </View>
            <Text style={styles.optionTitle}>Camera</Text>
            <Text style={styles.optionSubtitle}>Scan Document</Text>
          </TouchableOpacity>
        </View>

        {files.length > 0 && (
          <View style={styles.filesSection}>
            <Text style={styles.sectionTitle}>Uploaded Files ({files.length})</Text>
            {files.map((file) => (
              <View key={file.id} style={styles.fileCard}>
                <View style={styles.fileIcon}>
                  <FileText color={Colors.light.primary} size={24} />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{file.fileName}</Text>
                  <Text style={styles.fileMeta}>
                    {formatFileSize(file.fileSize)} | {file.pageCount} pages
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeButton}>
                  <X color={Colors.light.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, files.length === 0 && styles.disabledButton]}
          onPress={handleContinue}
          disabled={files.length === 0}
        >
          <Text style={styles.continueText}>Select Shop</Text>
          <ChevronRight color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  subtitle: { fontSize: 14, color: Colors.light.textSecondary, marginTop: 4, marginBottom: 24 },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadOption: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  optionSubtitle: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
  filesSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.text, marginBottom: 12 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { fontSize: 14, fontWeight: '500', color: Colors.light.text },
  fileMeta: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
  removeButton: { padding: 8 },
  footer: {
    padding: 24,
    paddingBottom: 32,
    borderTopColor: Colors.light.border,
    borderTopWidth: 1,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.5 },
  continueText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
