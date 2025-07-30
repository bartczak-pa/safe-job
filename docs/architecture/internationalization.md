# Internationalization Strategy

This document outlines the comprehensive internationalization (i18n) strategy for the Safe Job platform, based on validated architectural analysis and market requirements for the Dutch temporary work sector.

## 1. Strategic Overview

The Safe Job platform internationalization strategy balances rapid MVP delivery with the multi-language requirements of the diverse Dutch temporary work market. This approach prioritizes core functionality validation while establishing a solid foundation for European market expansion.

### 1.1 Architecture Decision: English-Only MVP

**Rationale for English-Only Launch:**

- ✅ **Single Developer Optimization**: Maximizes development velocity during 8-week MVP timeline
- ✅ **Technical Simplicity**: Reduces complexity in forms, validation, database design, and testing
- ✅ **Market Validation**: Enables business model validation before internationalization investment
- ✅ **Cost Management**: Avoids translation costs and complexity during MVP validation phase
- ✅ **AWS Free Tier**: Minimizes infrastructure complexity and storage requirements

**Market Context:**

- English proficiency is high among Dutch employers and international temporary workers
- Technical documentation and job descriptions often use English in the Netherlands
- MVP validation can proceed effectively with English-only interface
- Post-MVP expansion aligns with proven market demand

### 1.2 Strategic Language Prioritization

**Target Market Analysis:**
Based on Dutch temporary work demographics and business requirements:

| Language | Market Size | Business Priority | Implementation Phase |
|----------|-------------|-------------------|----------------------|
| **English (en)** | Universal | Critical | MVP (Weeks 1-8) |
| **Dutch (nl)** | Primary market | High | Phase 2 (Months 3-4) |
| **Polish (pl)** | Large worker demographic | High | Phase 2 (Months 3-4) |
| **Romanian (ro)** | Significant population | Medium | Phase 3 (Months 5-6) |
| **Bulgarian (bg)** | EU worker demographic | Medium | Phase 3 (Months 5-6) |
| **Ukrainian (uk)** | Refugee/worker support | Medium | Phase 3 (Months 5-6) |

---

## 2. MVP Implementation (English-Only)

### 2.1 Technical Configuration

**Django Settings (MVP):**
```python
# settings/base.py - MVP Configuration
USE_I18N = False           # Disabled for MVP simplicity
USE_L10N = True           # Keep locale formatting (dates, numbers)
USE_TZ = True             # Timezone support maintained

LANGUAGE_CODE = 'en-us'   # Default language
TIME_ZONE = 'Europe/Amsterdam'  # Netherlands timezone

# Template and static files
LOCALE_PATHS = []         # No locale directories needed for MVP
```

**Frontend Configuration (React):**
```typescript
// src/i18n.ts - MVP stub for future expansion
export const i18n = {
  language: 'en',
  t: (key: string, params?: any) => {
    // MVP: Return keys as-is, ready for translation system
    return key;
  }
};
```

### 2.2 Content Strategy (MVP)

**Text Content Approach:**
- **Clear, Simple English**: Accessible to international audience
- **Technical Term Consistency**: Standard job market terminology
- **Cultural Neutrality**: Avoid idioms or culture-specific references
- **Professional Tone**: Appropriate for business/employment context

**Content Categories:**
```typescript
// Content organization ready for i18n extraction
const contentAreas = {
  'auth': ['login', 'registration', 'password_reset'],
  'jobs': ['search', 'details', 'requirements', 'application'],
  'profile': ['candidate', 'employer', 'verification'],
  'messaging': ['conversations', 'notifications'],
  'admin': ['moderation', 'verification', 'reports']
};
```

### 2.3 Database Design (i18n Ready)

**Schema Preparation:**
```python
# models.py - MVP with i18n preparation
class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    # MVP: Single language fields
    # Post-MVP: Will add language-specific versions

    # Location stored in multiple formats for i18n
    location_en = models.CharField(max_length=200)  # "Amsterdam, Netherlands"
    location_nl = models.CharField(max_length=200, blank=True)  # "Amsterdam, Nederland"

    # Geospatial data is language-neutral
    geo_location = models.PointField(geography=True)

    # Prepared for future content versioning
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 3. Post-MVP Internationalization Architecture

### 3.1 Phase 2: Core European Languages (Months 3-4)

**Technology Stack Enhancement:**
```python
# settings/production.py - Post-MVP i18n activation
USE_I18N = True
USE_L10N = True

LANGUAGES = [
    ('en', 'English'),
    ('nl', 'Nederlands'),
    ('pl', 'Polski'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

MIDDLEWARE = [
    'django.middleware.locale.LocaleMiddleware',  # Add language detection
    # ... other middleware
]
```

**Database Schema Evolution:**
```python
# Enhanced models for multi-language content
class TranslatableContent(models.Model):
    """Base class for translatable content"""

    class Meta:
        abstract = True

class JobTranslation(models.Model):
    """Job content translations"""
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='translations')
    language = models.CharField(max_length=5, choices=settings.LANGUAGES)
    title = models.CharField(max_length=200)
    description = models.TextField()

    class Meta:
        unique_together = ('job', 'language')
        indexes = [
            models.Index(fields=['job', 'language']),
        ]
```

### 3.2 Translation Workflow Integration

**Professional Translation Pipeline:**
```python
# translation/services.py
class TranslationService:
    """Integration with professional translation services"""

    @staticmethod
    def create_translation_job(content_type: str, source_id: int, target_languages: List[str]):
        """Create translation job for external service"""
        translation_job = TranslationJob.objects.create(
            content_type=content_type,
            source_id=source_id,
            target_languages=target_languages,
            status='pending',
            provider='deepl'  # Primary: DeepL, Fallback: Google Translate
        )

        # Queue for background processing
        process_translation_job.delay(translation_job.id)
        return translation_job

    @staticmethod
    def process_deepl_translation(job_id: int):
        """Process translation via DeepL API"""
        job = TranslationJob.objects.get(id=job_id)

        for target_lang in job.target_languages:
            try:
                translated_content = deepl.translate(
                    text=job.source_content,
                    target_lang=target_lang,
                    source_lang='en'
                )

                # Store translation with quality score
                Translation.objects.create(
                    job=job,
                    language=target_lang,
                    content=translated_content.text,
                    confidence_score=translated_content.detected_source_lang_confidence,
                    provider='deepl'
                )

            except Exception as e:
                # Fallback to Google Translate
                fallback_translation = google_translate(job.source_content, target_lang)
                Translation.objects.create(
                    job=job,
                    language=target_lang,
                    content=fallback_translation,
                    confidence_score=0.8,  # Lower confidence for fallback
                    provider='google'
                )
```

### 3.3 Frontend Internationalization

**React i18next Integration:**
```typescript
// src/i18n/index.ts - Full i18n implementation
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'nl', 'pl', 'ro', 'bg', 'uk'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },

    // Namespace organization
    ns: ['common', 'auth', 'jobs', 'profile', 'messaging', 'admin'],
    defaultNS: 'common',
  });

export default i18n;
```

**Component Implementation:**
```typescript
// components/JobCard.tsx - i18n implementation
import { useTranslation } from 'react-i18next';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { t, i18n } = useTranslation('jobs');

  // Get localized content based on current language
  const localizedTitle = job.translations?.[i18n.language]?.title || job.title;
  const localizedDescription = job.translations?.[i18n.language]?.description || job.description;

  return (
    <div className="job-card">
      <h3>{localizedTitle}</h3>
      <p>{localizedDescription}</p>

      <div className="job-meta">
        <span>{t('salary_range', { min: job.salary_min, max: job.salary_max })}</span>
        <span>{t('location', { city: job.location })}</span>
        <span>{t('posted_date', { date: job.created_at })}</span>
      </div>

      <button className="apply-btn">
        {t('apply_now')}
      </button>
    </div>
  );
};
```

---

## 4. Advanced Internationalization Features

### 4.1 Dynamic Content Translation

**Real-time Translation Service:**
```python
# services/realtime_translation.py
class RealTimeTranslationService:
    """Real-time translation for user-generated content"""

    @staticmethod
    def translate_message(message_id: int, target_language: str):
        """Translate chat messages on-demand"""
        message = Message.objects.get(id=message_id)

        # Check cache first
        cache_key = f"translation:{message_id}:{target_language}"
        cached_translation = cache.get(cache_key)

        if cached_translation:
            return cached_translation

        # Translate via API
        translated_text = deepl.translate(
            text=message.content,
            target_lang=target_language,
            preserve_formatting=True
        )

        # Cache for 1 hour
        cache.set(cache_key, translated_text, 3600)

        return translated_text
```

**Smart Content Detection:**
```python
class ContentIntelligence:
    """AI-powered content analysis for translation optimization"""

    @staticmethod
    def detect_translation_priority(content: str, content_type: str) -> int:
        """Determine translation priority based on content analysis"""
        priority_indicators = {
            'safety_keywords': ['safety', 'dangerous', 'protection', 'insurance'],
            'legal_terms': ['contract', 'wage', 'hours', 'rights'],
            'urgent_markers': ['urgent', 'immediate', 'asap', 'today'],
        }

        priority_score = 0
        content_lower = content.lower()

        for category, keywords in priority_indicators.items():
            matches = sum(1 for keyword in keywords if keyword in content_lower)
            priority_score += matches * 10

        # Content type weights
        type_weights = {
            'job_safety_info': 50,
            'contract_terms': 40,
            'application_requirements': 30,
            'general_description': 10,
        }

        return priority_score + type_weights.get(content_type, 0)
```

### 4.2 Localization Features

**Cultural Adaptation:**
```python
# localization/adapters.py
class LocalizationAdapter:
    """Adapt content for local cultural context"""

    CULTURAL_ADAPTATIONS = {
        'nl': {
            'date_format': 'DD-MM-YYYY',
            'currency_symbol': '€',
            'address_format': 'street number, postal_code city',
            'phone_format': '+31 XX XXX XXXX',
        },
        'pl': {
            'date_format': 'DD.MM.YYYY',
            'currency_symbol': 'zł',
            'address_format': 'street number, postal_code city',
            'phone_format': '+48 XXX XXX XXX',
        },
    }

    @classmethod
    def format_address(cls, address: dict, language: str) -> str:
        """Format address according to local conventions"""
        format_template = cls.CULTURAL_ADAPTATIONS[language]['address_format']

        return format_template.format(
            street=address.get('street', ''),
            number=address.get('number', ''),
            postal_code=address.get('postal_code', ''),
            city=address.get('city', '')
        )

    @classmethod
    def format_salary(cls, amount: Decimal, language: str, period: str) -> str:
        """Format salary according to local conventions"""
        currency = cls.CULTURAL_ADAPTATIONS[language]['currency_symbol']

        if language == 'nl':
            return f"{currency} {amount:,.2f} per {period}"
        elif language == 'pl':
            return f"{amount:,.2f} {currency} za {period}"

        # Default English format
        return f"{currency}{amount:,.2f} per {period}"
```

**Legal Compliance Localization:**
```python
class LegalComplianceLocalizer:
    """Ensure legal text compliance in different languages"""

    LEGAL_TEMPLATES = {
        'nl': {
            'gdpr_notice': 'Uw gegevens worden verwerkt conform de AVG wetgeving.',
            'contract_terms': 'Deze arbeidsovereenkomst valt onder Nederlands recht.',
            'worker_rights': 'U heeft recht op een eerlijk loon conform de CAO.',
        },
        'pl': {
            'gdpr_notice': 'Pańskie dane są przetwarzane zgodnie z RODO.',
            'contract_terms': 'Ta umowa o pracę podlega prawu holenderskiemu.',
            'worker_rights': 'Ma Pan/Pani prawo do godziwego wynagrodzenia.',
        },
        'en': {  # English fallback to avoid KeyError
            'gdpr_notice': 'Your data is processed in accordance with the GDPR.',
            'contract_terms': 'This employment contract is governed by Dutch law.',
            'worker_rights': 'You are entitled to fair pay under the CLA.',
        },
    }

    @classmethod
    def get_legal_text(cls, text_key: str, language: str) -> str:
        """Get legally compliant text in specified language"""
        return cls.LEGAL_TEMPLATES.get(language, {}).get(
            text_key,
            cls.LEGAL_TEMPLATES['en'][text_key]  # Fallback to English
        )
```

---

## 5. Implementation Roadmap

### 5.1 MVP Phase (Weeks 1-8): English Foundation

**Week 1-2: Content Architecture**

- [ ] Establish content categorization system
- [ ] Implement translation-ready string management
- [ ] Set up database schema for future i18n support
- [ ] Create content style guide for consistent English

**Week 3-4: Technical Preparation**

- [ ] Configure Django settings for future i18n activation
- [ ] Implement React i18n stub for seamless future integration
- [ ] Establish content extraction patterns
- [ ] Set up timezone handling for European context

**Week 5-8: Content Optimization**

- [ ] Ensure all user-facing text uses clear, simple English
- [ ] Implement proper date/time formatting for Netherlands
- [ ] Test content accessibility and clarity
- [ ] Document content for future translation

### 5.2 Phase 2 (Months 3-4): Core Languages

**Month 3: Django Backend i18n Activation**

- [ ] Activate Django internationalization framework
- [ ] Implement database schema for translations
- [ ] Set up translation workflow with DeepL integration
- [ ] Create admin interface for translation management
- [ ] Implement language detection and switching

**Month 4: Frontend Internationalization**

- [ ] Integrate React i18next with full feature set
- [ ] Implement language switcher component
- [ ] Create translation files for Dutch and Polish
- [ ] Professional translation of core content
- [ ] User testing with native speakers

**Success Metrics:**

- [ ] 95%+ content translated for Dutch and Polish
- [ ] Language switching works seamlessly
- [ ] No performance degradation from i18n features
- [ ] Positive user feedback from native speakers

### 5.3 Phase 3 (Months 5-6): Extended Language Support

**Advanced Features Implementation:**

- [ ] Real-time message translation
- [ ] Cultural adaptation for local conventions
- [ ] Advanced content prioritization
- [ ] Legal text localization
- [ ] Professional translation quality assurance

**Language Expansion:**

- [ ] Romanian language support
- [ ] Bulgarian language support
- [ ] Ukrainian language support
- [ ] Community feedback integration
- [ ] Continuous translation quality improvement

---

## 6. Quality Assurance & Testing

### 6.1 Translation Quality Framework

**Quality Assurance Process:**
```python
# qa/translation_quality.py
class TranslationQualityAssurance:
    """Automated and manual QA for translations"""

    @staticmethod
    def validate_translation_completeness(language: str) -> dict:
        """Check translation coverage for a language"""
        total_strings = TranslatableString.objects.count()
        translated_strings = Translation.objects.filter(language=language).count()

        coverage = (translated_strings / total_strings) * 100

        missing_areas = TranslatableString.objects.exclude(
            id__in=Translation.objects.filter(language=language).values('string_id')
        ).values_list('category', flat=True).distinct()

        return {
            'coverage_percentage': coverage,
            'missing_areas': list(missing_areas),
            'quality_issues': TranslationQualityAssurance.detect_quality_issues(language)
        }

    @staticmethod
    def detect_quality_issues(language: str) -> List[dict]:
        """Detect potential translation quality issues"""
        issues = []
        translations = Translation.objects.filter(language=language)

        for translation in translations:
            # Check for placeholder issues
            if '{{' in translation.original_text and '{{' not in translation.translated_text:
                issues.append({
                    'type': 'missing_placeholder',
                    'string_id': translation.string_id,
                    'severity': 'high'
                })

            # Check for length discrepancies
            length_ratio = len(translation.translated_text) / len(translation.original_text)
            if length_ratio > 2.0 or length_ratio < 0.3:
                issues.append({
                    'type': 'length_discrepancy',
                    'string_id': translation.string_id,
                    'severity': 'medium',
                    'ratio': length_ratio
                })

        return issues
```

### 6.2 User Testing Framework

**Native Speaker Testing:**
```python
class LocalizationTesting:
    """Framework for native speaker testing"""

    @staticmethod
    def create_testing_scenarios(language: str) -> List[dict]:
        """Generate user testing scenarios for specific language"""
        scenarios = [
            {
                'name': 'job_search_flow',
                'description': f'Complete job search in {language}',
                'steps': [
                    'Navigate to job search page',
                    'Enter search criteria in local language',
                    'Review job listings',
                    'Read job descriptions',
                    'Submit application'
                ],
                'success_criteria': [
                    'All text renders correctly',
                    'Cultural references appropriate',
                    'No confusion about meaning',
                    'Professional tone maintained'
                ]
            },
            {
                'name': 'registration_flow',
                'description': f'Account registration in {language}',
                'steps': [
                    'Access registration page',
                    'Fill out profile information',
                    'Upload documents',
                    'Verify email address',
                    'Complete profile setup'
                ],
                'success_criteria': [
                    'Form labels clear and accurate',
                    'Error messages understandable',
                    'Help text appropriate',
                    'Legal text compliant'
                ]
            }
        ]

        return scenarios
```

---

## 7. Performance & Technical Considerations

### 7.1 Performance Optimization

**Translation Caching Strategy:**
```python
# caching/translation_cache.py
class TranslationCache:
    """Optimized caching for translation content"""

    @staticmethod
    def get_cached_translation(key: str, language: str) -> Optional[str]:
        """Get translation from multi-tier cache"""

        # L1: In-memory cache (fastest)
        cache_key = f"i18n:{language}:{key}"
        translation = cache.get(cache_key)

        if translation:
            return translation

        # L2: Database cache table
        try:
            cached_translation = TranslationCache.objects.get(
                key=key,
                language=language,
                expires_at__gt=timezone.now()
            )

            # Populate L1 cache
            cache.set(cache_key, cached_translation.value, 3600)
            return cached_translation.value

        except TranslationCache.DoesNotExist:
            return None

    @staticmethod
    def warm_translation_cache(language: str):
        """Pre-populate cache with frequently used translations"""
        high_priority_keys = [
            'common.navigation.*',
            'jobs.search.*',
            'auth.login.*',
            'profile.candidate.*'
        ]

        for key_pattern in high_priority_keys:
            translations = Translation.objects.filter(
                key__startswith=key_pattern.replace('*', ''),
                language=language
            )

            for translation in translations:
                TranslationCache.set_cached_translation(
                    translation.key,
                    language,
                    translation.value
                )
```

### 7.2 Bundle Size Optimization

**Frontend Bundle Management:**
```typescript
// webpack/i18n-optimization.js
const I18nOptimizationPlugin = {
  // Lazy load translation files
  async loadTranslations(language: string, namespace: string) {
    return import(`../locales/${language}/${namespace}.json`);
  },

  // Split translations by route
  getRouteTranslations(route: string, language: string) {
    const routeMap = {
      '/jobs': ['jobs', 'common'],
      '/profile': ['profile', 'common'],
      '/auth': ['auth', 'common'],
      '/messaging': ['messaging', 'common'],
    };

    const namespaces = routeMap[route] || ['common'];
    return Promise.all(
      namespaces.map(ns => this.loadTranslations(language, ns))
    );
  },

  // Compress translation files
  compressTranslations(translations: object) {
    // Remove unused keys, minify JSON
    return JSON.stringify(translations);
  }
};
```

---

## 8. Future Enhancements

### 8.1 AI-Powered Translation (Year 2)

**Machine Learning Integration:**

- **Context-Aware Translation**: ML models trained on job market terminology
- **Translation Quality Scoring**: Automated quality assessment
- **Personalized Content**: User preference-based language selection
- **Real-time Improvement**: Translation quality enhancement based on user feedback

### 8.2 Advanced Localization (Year 2+)

**Regional Customization:**

- **Local Labor Law Integration**: Country-specific legal requirements
- **Regional Job Market Data**: Local salary ranges and market conditions
- **Cultural Event Integration**: Local holidays and work patterns
- **Payment Method Localization**: Regional payment preferences

### 8.3 Community Translation Platform

**Crowdsource Translation System:**

- **Community Contributor Program**: Native speakers contribute translations
- **Translation Validation**: Peer review and quality scoring
- **Incentive System**: Contributors earn platform credits
- **Quality Metrics**: Community-driven quality assessment

---

## 9. Conclusion

The Safe Job platform internationalization strategy provides a pragmatic approach that optimizes for rapid MVP delivery while establishing a robust foundation for European market expansion. The English-only MVP enables immediate market validation while the comprehensive post-MVP roadmap ensures seamless scaling to serve the diverse linguistic needs of the Dutch temporary work market.

**Key Strategic Advantages:**

1. **MVP Velocity**: English-only approach maximizes single-developer productivity
2. **Market Validation**: Business model validation before translation investment
3. **Technical Foundation**: Architecture ready for seamless i18n activation
4. **Scalable Translation**: Professional workflow with quality assurance
5. **Cultural Adaptation**: Localization beyond translation for market fit

**Implementation Confidence: 95%**

This internationalization strategy balances immediate business needs with long-term market expansion requirements, providing a clear path from English-only MVP to comprehensive multi-language platform serving the diverse European temporary work market.

---

*Document Version: 2.0*
*Last Updated: July 2025*
*Internationalization Status: Strategy Validated - Ready for Implementation*

## Future Implementation Strategy

### Django Backend (Post-MVP)

Django's built-in i18n framework will be configured when multi-language support is added:

**MVP Settings (English Only):**
```python
# settings/base.py
USE_I18N = False  # Disabled for MVP simplicity
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Europe/Amsterdam'  # Netherlands timezone
```

**Post-MVP Settings:**
```python
# settings/base.py
USE_I18N = True
USE_L10N = True
LANGUAGE_CODE = 'en-us'
LANGUAGES = [
    ('en', 'English'),
    ('nl', 'Nederlands'),
    ('pl', 'Polski'),
]
LOCALE_PATHS = [BASE_DIR / 'locale']
```

### URL Configuration

URLs can be prefixed with language codes using `i18n_patterns` in `backend/src/safe_job/config/urls.py`. For example:
```
/en/admin/ - English admin interface
/nl/admin/ - Dutch admin interface
```

A language switcher endpoint is available at `/i18n/setlang/` to change the current language.

### Translation Workflow

1. Mark strings for translation in Python code using `gettext_lazy` (imported as `_`):
   ```python
   from django.utils.translation import gettext_lazy as _

   class MyModel(models.Model):
       name = models.CharField(_("Name"), max_length=100)
   ```

2. Extract translatable strings to message files:
   ```
   make makemessages
   ```

3. Translate the extracted strings in `.po` files located in `backend/locale/{language_code}/LC_MESSAGES/django.po`

4. Compile translations to binary `.mo` files:
   ```
   make compilemessages
   ```

## Frontend (React) Internationalization

### Configuration

The React app uses the i18next library for translation. The configuration is in `frontend/src/i18n.ts`.

### Translation Files Structure

Translation files are stored in `frontend/public/locales/{language_code}/{namespace}.json`:

- `common.json` - Common UI elements
- `auth.json` - Authentication-related translations
- `jobs.json` - Job-related translations
- `profile.json` - Profile-related translations

### Translation Workflow

1. Mark strings for translation in React components:
   ```tsx
   import { useTranslation } from 'react-i18next';

   function MyComponent() {
     const { t } = useTranslation();

     return <h1>{t('welcome')}</h1>;
   }
   ```

2. Extract translatable strings to JSON files:
   ```
   npm run extract-translations
   ```

3. Translate the extracted strings in the JSON files

### Language Switching

The app provides a language selector component that allows users to change the language. Language preferences are stored in localStorage.

## MVP Implementation Notes

### Why English-Only for MVP?

1. **Single Developer Focus:** Maximizes development speed on core features
2. **Market Validation:** Tests business model before internationalization investment
3. **Technical Simplicity:** Reduces complexity in forms, validation, and testing
4. **Cost Management:** Avoids translation costs during MVP validation phase
5. **AWS Free Tier:** Minimizes infrastructure complexity

### Post-MVP Migration Strategy

When implementing multi-language support:

1. **Enable Django i18n:** Update settings and middleware
2. **String Extraction:** Mark all user-facing strings for translation
3. **Database Schema:** Add language fields to content models
4. **Translation Workflow:** Implement professional translation pipeline
5. **Testing Strategy:** Add language-specific test cases
6. **Performance:** Cache translated content appropriately

## Technical Implementation (Post-MVP)

### Adding a New Language

1. Update `LANGUAGES` setting in Django
2. Create locale directories for backend translations
3. Configure React i18next for frontend
4. Generate and translate message files
5. Add language switcher UI component
6. Test all user workflows in new language

## Translation Best Practices

1. Use context variables in translations: `t('greeting', { name: 'John' })`
2. Use pluralization when needed: `t('itemCount', { count: items.length })`
3. Keep translations organized by namespaces to avoid key conflicts
4. Always provide a fallback for the default language (English)
5. Avoid hardcoded strings in both backend and frontend
