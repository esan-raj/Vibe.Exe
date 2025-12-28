import React, { useEffect, useRef, useState } from 'react';
import { Languages } from 'lucide-react';

/**
 * Direct Google Translate Implementation
 * This component directly uses Google Translate without any fancy UI
 * to ensure it actually works and translates the page
 */
const DirectTranslate: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const translateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to initialize Google Translate
    const initGoogleTranslate = () => {
      // Set up the global callback
      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google?.translate && translateRef.current) {
          new (window as any).google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'hi,bn,fr,es,ar,de,ja,zh,ko,pt,ru,it,nl,sv,da,no,fi,pl,tr',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          }, translateRef.current);

          // Wait for the select element to appear
          const checkSelect = () => {
            const select = translateRef.current?.querySelector('select.goog-te-combo');
            if (select) {
              setIsLoaded(true);
              console.log('✅ Direct translate ready');
              
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
        }
      };

      // Load the script
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.head.appendChild(script);
      } else {
        // Script already exists, just initialize
        (window as any).googleTranslateElementInit?.();
      }
    };

    initGoogleTranslate();
  }, []);

  const handleTranslate = (langCode: string) => {
    const select = translateRef.current?.querySelector('select.goog-te-combo') as HTMLSelectElement;
    if (select) {
      console.log(`🚀 Direct translating to: ${langCode}`);
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      setCurrentLang(langCode || 'en');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Languages className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-blue-600" />
      <select
        value={currentLang}
        onChange={(e) => handleTranslate(e.target.value)}
        className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
      >
        <option value="">English</option>
        <option value="hi">हिन्दी (Hindi)</option>
        <option value="bn">বাংলা (Bengali)</option>
        <option value="fr">Français (French)</option>
        <option value="es">Español (Spanish)</option>
        <option value="ar">العربية (Arabic)</option>
        <option value="de">Deutsch (German)</option>
        <option value="ja">日本語 (Japanese)</option>
        <option value="zh">中文 (Chinese)</option>
        <option value="ko">한국어 (Korean)</option>
        <option value="pt">Português (Portuguese)</option>
        <option value="ru">Русский (Russian)</option>
        <option value="it">Italiano (Italian)</option>
      </select>
      
      {/* Hidden Google Translate Element */}
      <div ref={translateRef} style={{ display: 'none' }} />
    </div>
  );
};

export default DirectTranslate;