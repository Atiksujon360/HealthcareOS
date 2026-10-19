import { normalizeLocalizedText, TRANSLATIONS } from '../locales/translations';

export function runLocalizationTests(): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;
  const assert = (condition: boolean) => {
    if (condition) passed += 1;
    else failed += 1;
  };

  const englishKeys = Object.keys(TRANSLATIONS.en).sort();
  const bengaliKeys = Object.keys(TRANSLATIONS.bn).sort();
  assert(JSON.stringify(englishKeys) === JSON.stringify(bengaliKeys));
  assert(normalizeLocalizedText(TRANSLATIONS.bn.currentLanguageLabel).length > 0);
  assert(!normalizeLocalizedText(TRANSLATIONS.bn.currentLanguageLabel).includes('à¦'));

  return { passed, failed };
}
