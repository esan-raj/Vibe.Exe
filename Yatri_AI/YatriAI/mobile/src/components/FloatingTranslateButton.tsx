/**
 * Floating Translate Button Component
 * Provides a floating translate icon in the bottom right corner
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
// Using Text for icons since @expo/vector-icons might not be installed
// You can replace with @expo/vector-icons if available

const FloatingTranslateButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  ];

  const showTranslationInstructions = (langCode: string) => {
    const lang = languages.find((l) => l.code === langCode);
    Alert.alert(
      'Browser Translation',
      `To translate this page to ${lang?.name}:\n\n1. Use your device's built-in translation feature\n2. Or use a translation app\n3. The app will automatically detect your device language\n\nNote: For best results, change your device language in Settings.`,
      [{ text: 'OK', onPress: () => setIsModalVisible(false) }]
    );
  };

  return (
    <>
      {/* Floating Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.iconText}>🌐</Text>
      </Pressable>

      {/* Translation Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Translate Page</Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Instructions */}
            <Pressable
              style={styles.instructionCard}
              onPress={() => {
                Alert.alert(
                  'How to Translate',
                  'To translate this app:\n\n1. Go to your device Settings\n2. Find Language & Region\n3. Add your preferred language\n4. The app will use your device language\n\nFor web version, use browser translation features.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <View style={styles.instructionIcon}>
                <Text style={styles.infoIcon}>ℹ️</Text>
              </View>
              <View style={styles.instructionText}>
                <Text style={styles.instructionTitle}>How to Translate</Text>
                <Text style={styles.instructionSubtitle}>
                  Tap for instructions
                </Text>
              </View>
            </Pressable>

            {/* Language List */}
            <Text style={styles.sectionTitle}>Select Language:</Text>
            <ScrollView style={styles.languageList}>
              {languages.map((language) => (
                <Pressable
                  key={language.code}
                  style={styles.languageItem}
                  onPress={() => showTranslationInstructions(language.code)}
                >
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={styles.languageNative}>{language.native}</Text>
                    <Text style={styles.languageName}>{language.name}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Above tab bar (60px) + padding (24px) = ~84px, so 100px is safe
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  instructionSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  flag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 12,
    color: '#6B7280',
  },
  iconText: {
    fontSize: 24,
  },
  closeIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
  },
  infoIcon: {
    fontSize: 20,
  },
});

export default FloatingTranslateButton;

