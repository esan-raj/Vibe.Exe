/**
 * Google Translate Integration
 * 
 * This module handles the initialization and management of Google Translate
 * functionality across the application.
 */

interface GoogleTranslateConfig {
  pageLanguage: string;
  includedLanguages: string[];
  onInit?: () => void;
  onError?: (error: string) => void;
}

class GoogleTranslateManager {
  private static instance: GoogleTranslateManager;
  private isInitialized = false;
  private isLoading = false;
  private callbacks: Array<() => void> = [];
  private errorCallbacks: Array<(error: string) => void> = [];

  static getInstance(): GoogleTranslateManager {
    if (!GoogleTranslateManager.instance) {
      GoogleTranslateManager.instance = new GoogleTranslateManager();
    }
    return GoogleTranslateManager.instance;
  }

  /**
   * Initialize Google Translate
   */
  async init(config: GoogleTranslateConfig): Promise<void> {
    if (this.isInitialized) {
      config.onInit?.();
      return;
    }

    if (this.isLoading) {
      // Add to callback queue
      if (config.onInit) this.callbacks.push(config.onInit);
      if (config.onError) this.errorCallbacks.push(config.onError);
      return;
    }

    this.isLoading = true;

    try {
      await this.loadScript();
      await this.waitForGoogleAPI();
      this.isInitialized = true;
      this.isLoading = false;

      // Execute all callbacks
      this.callbacks.forEach(callback => callback());
      this.callbacks = [];
      
      config.onInit?.();
      
      console.log('✅ Google Translate Manager initialized');
    } catch (error) {
      this.isLoading = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Execute error callbacks
      this.errorCallbacks.forEach(callback => callback(errorMessage));
      this.errorCallbacks = [];
      
      config.onError?.(errorMessage);
      console.error('❌ Google Translate initialization failed:', error);
    }
  }

  /**
   * Load Google Translate script
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.getElementById('google-translate-script')) {
        resolve();
        return;
      }

      console.log('🔄 Loading Google Translate script...');

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;

      // Set up global callback
      (window as any).googleTranslateElementInit = () => {
        console.log('📡 Google Translate script loaded');
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Translate script'));
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isInitialized) {
          reject(new Error('Google Translate script load timeout'));
        }
      }, 10000);

      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Google API to be available
   */
  private waitForGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;

      const checkAPI = () => {
        if ((window as any).google?.translate?.TranslateElement) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkAPI, 100);
        } else {
          reject(new Error('Google Translate API not available'));
        }
      };

      checkAPI();
    });
  }

  /**
   * Create a translate element
   */
  createTranslateElement(container: HTMLElement, config: Partial<GoogleTranslateConfig> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isInitialized) {
        reject(new Error('Google Translate not initialized'));
        return;
      }

      try {
        const defaultConfig = {
          pageLanguage: 'en',
          includedLanguages: ['hi', 'bn', 'fr', 'es', 'ar', 'de', 'ja', 'zh', 'ko', 'pt', 'ru', 'it'],
        };

        const finalConfig = { ...defaultConfig, ...config };

        // Clear container
        container.innerHTML = '';

        // Create translate element
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: finalConfig.pageLanguage,
            includedLanguages: finalConfig.includedLanguages.join(','),
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          container
        );

        // Wait for the select element to be created
        const checkSelect = () => {
          const selectElement = container.querySelector('select.goog-te-combo');
          if (selectElement) {
            // Hide Google branding
            this.hideGoogleBranding();
            resolve();
          } else {
            setTimeout(checkSelect, 100);
          }
        };

        setTimeout(checkSelect, 100);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Hide Google branding and banner
   */
  private hideGoogleBranding(): void {
    // Hide banner
    const bannerFrame = document.querySelector('.goog-te-banner-frame');
    if (bannerFrame) {
      (bannerFrame as HTMLElement).style.display = 'none';
    }

    // Remove body top margin
    document.body.style.top = '0px';
    document.body.style.position = 'static';

    // Hide gadget
    const gadgets = document.querySelectorAll('.goog-te-gadget');
    gadgets.forEach(gadget => {
      (gadget as HTMLElement).style.display = 'none';
    });
  }

  /**
   * Translate to a specific language
   */
  translateTo(container: HTMLElement, languageCode: string): boolean {
    try {
      const selectElement = container.querySelector('select.goog-te-combo') as HTMLSelectElement;
      
      if (!selectElement) {
        console.error('❌ Google Translate select element not found');
        return false;
      }

      console.log(`🌐 Translating to: ${languageCode || 'original'}`);
      
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      return true;
    } catch (error) {
      console.error('❌ Translation error:', error);
      return false;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(container: HTMLElement): string {
    try {
      const selectElement = container.querySelector('select.goog-te-combo') as HTMLSelectElement;
      return selectElement?.value || 'en';
    } catch {
      return 'en';
    }
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const googleTranslateManager = GoogleTranslateManager.getInstance();

// Export types
export type { GoogleTranslateConfig };