import React, { useEffect, useRef, useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';

/**
 * Simplified Google Translate Component
 * 
 * This is a minimal implementation to test Google Translate functionality
 * without complex state management or animations.
 */
const GoogleTranslateSimple: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Translate script
    const loadScript = () => {
      if (document.getElementById('google-translate-script')) {
        initTranslate();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      
      (window as any).googleTranslateElementInit = () => {
        console.log('Google Translate script loaded');
        setTimeout(initTranslate, 500);
      };

      document.head.appendChild(script);
    };

    const initTranslate = () => {
      if (!(window as any).google?.translate || !translateRef.current) {
        console.log('Google Translate API not ready, retrying...');
        setTimeout(initTranslate, 500);
        return;
      }

      try {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'hi,bn,fr,es,ar,de,ja,zh',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, translateRef.current);

        // Wait for select element
        const checkSelect = () => {
          const select = translateRef.current?.querySelector('select.goog-te-combo');
          if (select) {
            setIsLoaded(true);
            console.log('Google Translate initialized successfully');
            
            // Hide Google branding
            setTimeout(() => {
              const banner = document.querySelector('.goog-te-banner-frame');
              if (banner) (banner as HTMLElement).style.display = 'none';
              
              const gadget = translateRef.current?.querySelector('.goog-te-gadget');
              if (gadget) (gadget as HTMLElement).style.display = 'none';
              
              document.body.style.top = '0px';
            }, 100);
          } else {
            setTimeout(checkSelect, 200);
          }
        };
        
        checkSelect();
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    };

    loadScript();
  }, []);

  const translateTo = (langCode: string) => {
    if (!translateRef.current || isTranslating) return;
    
    setIsTranslating(true);
    console.log(`Translating to: ${langCode}`);

    const select = translateRef.current.querySelector('select.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(langCode || 'en');
      
      setTimeout(() => {
        setIsTranslating(false);
        console.log('Translation completed');
      }, 2000);
    } else {
      console.error('Select element not found');
      setIsTranslating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 p-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading translator...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-5 h-5 text-blue-600" />
      <select 
        onChange={(e) => translateTo(e.target.value)}
        value={currentLang}
        disabled={isTranslating}
        className="px-3 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:border-gray-600"
      >
        <option value="">English (Original)</option>
        <option value="hi">Hindi (हिन्दी)</option>
        <option value="bn">Bengali (বাংলা)</option>
        <option value="fr">French (Français)</option>
        <option value="es">Spanish (Español)</option>
        <option value="ar">Arabic (العربية)</option>
        <option value="de">German (Deutsch)</option>
        <option value="ja">Japanese (日本語)</option>
        <option value="zh">Chinese (中文)</option>
      </select>
      {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      
      {/* Hidden Google Translate Element */}
      <div ref={translateRef} style={{ display: 'none' }} />
    </div>
  );
};

export default GoogleTranslateSimple;