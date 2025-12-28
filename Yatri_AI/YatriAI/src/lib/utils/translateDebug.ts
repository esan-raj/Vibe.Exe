/**
 * Google Translate Debug Utilities
 * 
 * Helper functions to debug and monitor Google Translate functionality
 */

export interface TranslateDebugInfo {
  scriptLoaded: boolean;
  googleApiAvailable: boolean;
  translateElementExists: boolean;
  selectElementExists: boolean;
  currentLanguage: string;
  bannerHidden: boolean;
  errors: string[];
}

/**
 * Get comprehensive debug information about Google Translate status
 */
export const getTranslateDebugInfo = (): TranslateDebugInfo => {
  const errors: string[] = [];
  
  // Check if script is loaded
  const scriptLoaded = !!document.getElementById('google-translate-script');
  
  // Check if Google API is available
  const googleApiAvailable = !!(window as any).google?.translate?.TranslateElement;
  
  // Check if translate element exists
  const translateElementExists = !!document.querySelector('.goog-te-combo');
  
  // Check if select element exists
  const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
  const selectElementExists = !!selectElement;
  
  // Get current language
  let currentLanguage = 'en';
  if (selectElement) {
    currentLanguage = selectElement.value || 'en';
  }
  
  // Check if banner is hidden
  const bannerFrame = document.querySelector('.goog-te-banner-frame');
  const bannerHidden = !bannerFrame || (bannerFrame as HTMLElement).style.display === 'none';
  
  // Collect errors
  if (!scriptLoaded) {
    errors.push('Google Translate script not loaded');
  }
  
  if (!googleApiAvailable) {
    errors.push('Google Translate API not available');
  }
  
  if (!translateElementExists) {
    errors.push('Google Translate element not found');
  }
  
  if (!selectElementExists) {
    errors.push('Google Translate select element not found');
  }
  
  if (!bannerHidden) {
    errors.push('Google Translate banner not hidden');
  }
  
  return {
    scriptLoaded,
    googleApiAvailable,
    translateElementExists,
    selectElementExists,
    currentLanguage,
    bannerHidden,
    errors,
  };
};

/**
 * Log debug information to console
 */
export const logTranslateDebugInfo = (): void => {
  const info = getTranslateDebugInfo();
  
  console.group('🌐 Google Translate Debug Info');
  console.log('Script Loaded:', info.scriptLoaded ? '✅' : '❌');
  console.log('Google API Available:', info.googleApiAvailable ? '✅' : '❌');
  console.log('Translate Element Exists:', info.translateElementExists ? '✅' : '❌');
  console.log('Select Element Exists:', info.selectElementExists ? '✅' : '❌');
  console.log('Current Language:', info.currentLanguage);
  console.log('Banner Hidden:', info.bannerHidden ? '✅' : '❌');
  
  if (info.errors.length > 0) {
    console.group('❌ Errors:');
    info.errors.forEach(error => console.log(`- ${error}`));
    console.groupEnd();
  } else {
    console.log('✅ No errors detected');
  }
  
  console.groupEnd();
};

/**
 * Test translation functionality
 */
export const testTranslation = (languageCode: string = 'hi'): Promise<boolean> => {
  return new Promise((resolve) => {
    const selectElement = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
    
    if (!selectElement) {
      console.error('❌ Cannot test translation: select element not found');
      resolve(false);
      return;
    }
    
    console.log(`🧪 Testing translation to: ${languageCode}`);
    
    const originalValue = selectElement.value;
    selectElement.value = languageCode;
    selectElement.dispatchEvent(new Event('change'));
    
    // Wait for translation to complete
    setTimeout(() => {
      const newValue = selectElement.value;
      const success = newValue === languageCode;
      
      console.log(success ? '✅ Translation test passed' : '❌ Translation test failed');
      
      // Reset to original language
      selectElement.value = originalValue;
      selectElement.dispatchEvent(new Event('change'));
      
      resolve(success);
    }, 2000);
  });
};

/**
 * Force reinitialize Google Translate
 */
export const reinitializeTranslate = (): void => {
  console.log('🔄 Reinitializing Google Translate...');
  
  // Remove existing script
  const existingScript = document.getElementById('google-translate-script');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Clear existing elements
  const existingElements = document.querySelectorAll('[id*="google_translate"]');
  existingElements.forEach(el => el.remove());
  
  // Reload the page to start fresh
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

/**
 * Add debug utilities to window for console access
 */
if (typeof window !== 'undefined') {
  (window as any).translateDebug = {
    getInfo: getTranslateDebugInfo,
    logInfo: logTranslateDebugInfo,
    test: testTranslation,
    reinitialize: reinitializeTranslate,
  };
  
  console.log('🔧 Google Translate debug utilities available:');
  console.log('- translateDebug.getInfo() - Get debug information');
  console.log('- translateDebug.logInfo() - Log debug info to console');
  console.log('- translateDebug.test(langCode) - Test translation');
  console.log('- translateDebug.reinitialize() - Force reinitialize');
}