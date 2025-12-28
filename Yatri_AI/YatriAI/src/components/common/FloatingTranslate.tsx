import React from 'react';
import BrowserTranslate from './BrowserTranslate';

/**
 * Floating Browser Translate Button
 * 
 * This component provides a floating translate button that appears
 * in the bottom-right corner of the screen. It uses browser-based
 * translation methods instead of Google Translate widget.
 */
const FloatingTranslate: React.FC = () => {
  return <BrowserTranslate variant="floating" />;
};

export default FloatingTranslate;