# Phase 8: Frontend Polish & User Experience - Detailed Implementation Plan

**Duration**: Week 8 (7 days)

**Dependencies**: All previous phases (1-7)

**Risk Level**: Medium

**Team**: 1 full-stack developer + Claude Code

## Overview

Phase 8 focuses on comprehensive frontend polish, user experience optimization, and performance enhancement. This phase transforms the functional platform into a professional, user-friendly application with exceptional usability, accessibility, and visual appeal that meets modern web standards and user expectations.

## Success Criteria

- [ ] Responsive design working flawlessly on all device sizes
- [ ] Complete internationalization (i18n) with 6 language support
- [ ] Accessibility compliance (WCAG 2.1 AA standard)
- [ ] Performance optimization with <2s load times
- [ ] Professional UI/UX with consistent design system
- [ ] Comprehensive error handling and user feedback

## Detailed Task Breakdown

### 8.1 Responsive Design & Mobile Optimization

#### 8.1.1 Mobile-First Responsive Implementation

**Duration**: 8 hours

**Priority**: Critical

**Tasks:**

- [ ] Implement mobile-first responsive design across all components
- [ ] Optimize touch interfaces for mobile and tablet users
- [ ] Create adaptive navigation for different screen sizes
- [ ] Implement responsive data tables and complex layouts
- [ ] Add mobile-specific features (swipe gestures, pull-to-refresh)

**Acceptance Criteria:**

- All pages function perfectly on screens from 320px to 4K
- Touch targets meet minimum 44px accessibility requirements
- Navigation is intuitive across all device types
- Data tables scroll horizontally on mobile with sticky columns
- Mobile-specific interactions enhance user experience

**Implementation Details:**

```typescript
// frontend/src/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof BreakpointConfig;

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<BreakpointKey>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Determine current breakpoint
      let breakpoint: BreakpointKey = 'xs';
      for (const [key, value] of Object.entries(breakpoints)) {
        if (width >= value) {
          breakpoint = key as BreakpointKey;
        }
      }
      setCurrentBreakpoint(breakpoint);
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBreakpoint = (breakpoint: BreakpointKey) => {
    return windowSize.width >= breakpoints[breakpoint];
  };

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  return {
    windowSize,
    currentBreakpoint,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
};

// frontend/src/components/ui/ResponsiveTable.tsx
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  sticky?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onSort
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (!columns.find(col => col.key === column)?.sortable) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 border">
              {columns.map(column => (
                <div key={column.key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-600 text-sm">
                    {column.label}:
                  </span>
                  <span className="text-gray-900 text-sm text-right">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.sticky ? 'sticky left-0 z-10 bg-gray-50' : ''}
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronLeftIcon
                          className={`h-3 w-3 transform rotate-90 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronRightIcon
                          className={`h-3 w-3 transform rotate-90 ${
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`
                        px-6 py-4 whitespace-nowrap text-sm text-gray-900
                        ${column.sticky ? 'sticky left-0 z-10 bg-white' : ''}
                      `}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

#### 8.1.2 Touch and Gesture Support

**Duration**: 4 hours

**Priority**: High

**Tasks:**

- [ ] Implement swipe gestures for mobile navigation
- [ ] Add pull-to-refresh functionality
- [ ] Optimize button and input sizes for touch
- [ ] Add haptic feedback for supported devices
- [ ] Implement long-press actions for power users

**Acceptance Criteria:**

- Swipe gestures work consistently across all mobile browsers
- Pull-to-refresh updates data without full page reload
- All interactive elements meet touch target size requirements
- Haptic feedback enhances user experience where supported
- Long-press actions provide convenient shortcuts

**Implementation Details:**

```typescript
// frontend/src/hooks/useGestures.ts
import { useEffect, useRef, useState } from 'react';

interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

export const useGestures = (config: GestureConfig) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = config;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      setIsPressed(true);

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          // Haptic feedback if available
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
          onLongPress();
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press if user moves finger
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      setIsPressed(false);

      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (!touchStart.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }

      touchStart.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [config]);

  return { elementRef, isPressed };
};

// frontend/src/components/ui/PullToRefresh.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, threshold * 1.5);
      setPullDistance(distance);
      setCanRefresh(distance >= threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setCanRefresh(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canRefresh, isRefreshing]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <div
        className={`
          absolute top-0 left-0 right-0 flex items-center justify-center
          transition-transform duration-200 ease-out z-10
          ${pullDistance > 0 ? 'bg-blue-50' : ''}
        `}
        style={{
          height: Math.max(pullDistance, 0),
          transform: `translateY(${Math.max(pullDistance - threshold, -threshold)}px)`
        }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center space-x-2 text-blue-600">
            <ArrowPathIcon
              className={`h-5 w-5 ${isRefreshing || canRefresh ? 'animate-spin' : ''}`}
            />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: `translateY(${isRefreshing ? threshold : pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
};
```

### 8.2 Internationalization (i18n) Implementation

#### 8.2.1 Complete Multi-language Support

**Duration**: 10 hours

**Priority**: Critical

**Tasks:**

- [ ] Set up i18next with React integration
- [ ] Create translation files for 6 languages (EN, NL, PL, RO, BG, UK)
- [ ] Implement dynamic language switching
- [ ] Add RTL support for future expansion
- [ ] Create translation management workflow

**Acceptance Criteria:**

- All user-facing text translated in 6 languages
- Language switching works instantly without page reload
- Date, number, and currency formatting localized
- RTL layout support prepared for Arabic/Hebrew
- Translation keys organized and maintainable

**Implementation Details:**

```typescript
// frontend/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en/common.json';
import nlTranslations from './locales/nl/common.json';
import plTranslations from './locales/pl/common.json';
import roTranslations from './locales/ro/common.json';
import bgTranslations from './locales/bg/common.json';
import ukTranslations from './locales/uk/common.json';

const resources = {
  en: { common: enTranslations },
  nl: { common: nlTranslations },
  pl: { common: plTranslations },
  ro: { common: roTranslations },
  bg: { common: bgTranslations },
  uk: { common: ukTranslations },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Language configuration
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
];

// frontend/src/components/ui/LanguageSwitcher.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { supportedLanguages } from '../../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);

    // Store preference
    localStorage.setItem('preferred-language', languageCode);

    // Update document lang attribute
    document.documentElement.lang = languageCode;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {supportedLanguages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-3
                    ${language.code === i18n.language ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                  `}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                  {language.code === i18n.language && (
                    <span className="ml-auto">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// frontend/src/hooks/useLocalization.ts
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();

  const formatters = useMemo(() => {
    const locale = i18n.language;

    return {
      currency: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
      }),

      number: new Intl.NumberFormat(locale),

      date: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      dateShort: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),

      time: new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),

      dateTime: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),

      relativeTime: new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }),
    };
  }, [i18n.language]);

  const formatCurrency = (amount: number) => formatters.currency.format(amount);
  const formatNumber = (number: number) => formatters.number.format(number);
  const formatDate = (date: Date | string) => formatters.date.format(new Date(date));
  const formatDateShort = (date: Date | string) => formatters.dateShort.format(new Date(date));
  const formatTime = (date: Date | string) => formatters.time.format(new Date(date));
  const formatDateTime = (date: Date | string) => formatters.dateTime.format(new Date(date));

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

    if (Math.abs(diffInSeconds) < 60) {
      return formatters.relativeTime.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return formatters.relativeTime.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return formatters.relativeTime.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return formatters.relativeTime.format(Math.floor(diffInSeconds / 86400), 'day');
    }
  };

  return {
    t,
    i18n,
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateShort,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    isRTL: ['ar', 'he', 'fa'].includes(i18n.language),
    locale: i18n.language,
  };
};
```

#### 8.2.2 Translation Files and Content Management

**Duration**: 6 hours

**Priority**: High

**Tasks:**

- [ ] Create comprehensive translation files for all languages
- [ ] Implement translation key validation and testing
- [ ] Set up automated translation workflow
- [ ] Create context-aware translations
- [ ] Add pluralization support for complex languages

**Acceptance Criteria:**

- All translation files complete with 100% coverage
- Translation keys validated to prevent missing translations
- Context provided for accurate translations
- Pluralization rules work correctly for all languages
- Translation workflow supports continuous updates

**Implementation Details:**

```json
// frontend/public/locales/en/common.json
{
  "app": {
    "name": "Safe Job",
    "tagline": "Connecting talent with trusted opportunities"
  },
  "navigation": {
    "home": "Home",
    "jobs": "Jobs",
    "candidates": "Candidates",
    "employers": "Employers",
    "about": "About",
    "contact": "Contact",
    "login": "Sign In",
    "register": "Sign Up",
    "dashboard": "Dashboard",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Sign Out"
  },
  "auth": {
    "welcome": "Welcome to Safe Job",
    "signIn": "Sign in to your account",
    "signUp": "Create your account",
    "email": "Email address",
    "password": "Password",
    "confirmPassword": "Confirm password",
    "firstName": "First name",
    "lastName": "Last name",
    "phone": "Phone number",
    "forgotPassword": "Forgot your password?",
    "rememberMe": "Remember me",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "createAccount": "Create account",
    "signInButton": "Sign in",
    "signUpButton": "Sign up",
    "magicLink": "Send magic link",
    "checkEmail": "Check your email for a sign-in link",
    "errors": {
      "invalidEmail": "Please enter a valid email address",
      "passwordTooShort": "Password must be at least 8 characters",
      "passwordMismatch": "Passwords do not match",
      "requiredField": "This field is required",
      "invalidCredentials": "Invalid email or password",
      "accountLocked": "Account locked due to too many failed attempts"
    }
  },
  "jobs": {
    "title": "Job Opportunities",
    "search": "Search jobs...",
    "location": "Location",
    "category": "Category",
    "type": "Job Type",
    "salary": "Salary Range",
    "filters": "Filters",
    "results": "{{count}} jobs found",
    "results_plural": "{{count}} jobs found",
    "noResults": "No jobs found matching your criteria",
    "apply": "Apply Now",
    "applied": "Applied",
    "save": "Save Job",
    "saved": "Saved",
    "share": "Share",
    "details": {
      "description": "Job Description",
      "requirements": "Requirements",
      "benefits": "Benefits",
      "company": "About the Company",
      "posted": "Posted {{date}}",
      "expires": "Expires {{date}}",
      "applications": "{{count}} application",
      "applications_plural": "{{count}} applications"
    },
    "application": {
      "title": "Apply for {{jobTitle}}",
      "coverLetter": "Cover Letter",
      "attachments": "Attachments",
      "submit": "Submit Application",
      "submitting": "Submitting...",
      "success": "Application submitted successfully!",
      "error": "Failed to submit application. Please try again."
    }
  },
  "profile": {
    "title": "My Profile",
    "basicInfo": "Basic Information",
    "workExperience": "Work Experience",
    "education": "Education",
    "skills": "Skills",
    "certifications": "Certifications",
    "documents": "Documents",
    "preferences": "Job Preferences",
    "save": "Save Changes",
    "saving": "Saving...",
    "saved": "Profile saved successfully",
    "photo": "Profile Photo",
    "uploadPhoto": "Upload Photo",
    "removePhoto": "Remove Photo"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Try Again",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "save": "Save",
    "close": "Close",
    "next": "Next",
    "previous": "Previous",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "clear": "Clear",
    "apply": "Apply",
    "reset": "Reset",
    "upload": "Upload",
    "download": "Download",
    "view": "View",
    "back": "Back",
    "continue": "Continue",
    "submit": "Submit",
    "required": "Required",
    "optional": "Optional",
    "yes": "Yes",
    "no": "No",
    "all": "All",
    "none": "None",
    "other": "Other"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "phone": "Please enter a valid phone number",
    "url": "Please enter a valid URL",
    "minLength": "Must be at least {{min}} characters",
    "maxLength": "Must be no more than {{max}} characters",
    "numeric": "Must be a number",
    "positiveNumber": "Must be a positive number",
    "fileSize": "File size must be less than {{size}}MB",
    "fileType": "File type not supported"
  },
  "dates": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "thisWeek": "This week",
    "lastWeek": "Last week",
    "thisMonth": "This month",
    "lastMonth": "Last month",
    "thisYear": "This year",
    "lastYear": "Last year"
  }
}

// frontend/public/locales/nl/common.json
{
  "app": {
    "name": "Safe Job",
    "tagline": "Talent verbinden met vertrouwde kansen"
  },
  "navigation": {
    "home": "Home",
    "jobs": "Vacatures",
    "candidates": "Kandidaten",
    "employers": "Werkgevers",
    "about": "Over ons",
    "contact": "Contact",
    "login": "Inloggen",
    "register": "Registreren",
    "dashboard": "Dashboard",
    "profile": "Profiel",
    "settings": "Instellingen",
    "logout": "Uitloggen"
  },
  "auth": {
    "welcome": "Welkom bij Safe Job",
    "signIn": "Inloggen op uw account",
    "signUp": "Maak uw account aan",
    "email": "E-mailadres",
    "password": "Wachtwoord",
    "confirmPassword": "Bevestig wachtwoord",
    "firstName": "Voornaam",
    "lastName": "Achternaam",
    "phone": "Telefoonnummer",
    "forgotPassword": "Wachtwoord vergeten?",
    "rememberMe": "Onthoud mij",
    "noAccount": "Nog geen account?",
    "hasAccount": "Al een account?",
    "createAccount": "Account aanmaken",
    "signInButton": "Inloggen",
    "signUpButton": "Registreren",
    "magicLink": "Stuur magic link",
    "checkEmail": "Controleer uw e-mail voor een inloglink",
    "errors": {
      "invalidEmail": "Voer een geldig e-mailadres in",
      "passwordTooShort": "Wachtwoord moet minstens 8 karakters zijn",
      "passwordMismatch": "Wachtwoorden komen niet overeen",
      "requiredField": "Dit veld is verplicht",
      "invalidCredentials": "Ongeldig e-mailadres of wachtwoord",
      "accountLocked": "Account vergrendeld vanwege te veel mislukte pogingen"
    }
  }
  // ... rest of translations
}
```

### 8.3 Accessibility (WCAG 2.1 AA) Implementation

#### 8.3.1 Comprehensive Accessibility Features

**Duration**: 8 hours

**Priority**: Critical

**Tasks:**

- [ ] Implement proper ARIA labels and roles
- [ ] Add keyboard navigation support
- [ ] Ensure color contrast meets WCAG standards
- [ ] Add screen reader optimization
- [ ] Implement focus management system

**Acceptance Criteria:**

- All interactive elements accessible via keyboard
- Color contrast ratios meet WCAG 2.1 AA requirements
- Screen readers can navigate the entire application
- Focus indicators clearly visible and logical
- ARIA labels provide meaningful context

**Implementation Details:**

```typescript
// frontend/src/hooks/useAccessibility.ts
import { useEffect, useRef, useState } from 'react';

export const useAccessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Check user preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsHighContrast(highContrastQuery.matches);
    setReducedMotion(reducedMotionQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    highContrastQuery.addEventListener('change', handleContrastChange);
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    if (savedFontSize) {
      setFontSize(savedFontSize);
      document.documentElement.style.fontSize = getFontSizeValue(savedFontSize);
    }

    return () => {
      highContrastQuery.removeEventListener('change', handleContrastChange);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const getFontSizeValue = (size: string) => {
    const sizes = {
      small: '14px',
      normal: '16px',
      large: '18px',
      xlarge: '20px',
    };
    return sizes[size as keyof typeof sizes] || sizes.normal;
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem('accessibility-font-size', size);
    document.documentElement.style.fontSize = getFontSizeValue(size);
  };

  return {
    isHighContrast,
    reducedMotion,
    fontSize,
    changeFontSize,
  };
};

// frontend/src/hooks/useFocusManagement.ts
import { useEffect, useRef } from 'react';

export const useFocusManagement = (isVisible: boolean, autoFocus: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isVisible && autoFocus) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the container or first focusable element
      if (containerRef.current) {
        const firstFocusable = containerRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;

        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          containerRef.current.focus();
        }
      }
    }

    return () => {
      // Restore focus when component unmounts or becomes invisible
      if (!isVisible && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isVisible, autoFocus]);

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', trapFocus);
      return () => document.removeEventListener('keydown', trapFocus);
    }
  }, [isVisible]);

  return { containerRef };
};

// frontend/src/components/ui/AccessibleModal.tsx
import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFocusManagement } from '../../hooks/useFocusManagement';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const { containerRef } = useFocusManagement(isOpen);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          ref={containerRef}
          className={`
            relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl
            transform transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// frontend/src/components/ui/AccessibilitySettings.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export const AccessibilitySettings: React.FC = () => {
  const { t } = useTranslation();
  const { fontSize, changeFontSize, isHighContrast, reducedMotion } = useAccessibility();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('accessibility.settings')}
        </h3>

        {/* Font Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('accessibility.fontSize')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['small', 'normal', 'large', 'xlarge'].map(size => (
              <button
                key={size}
                onClick={() => changeFontSize(size)}
                className={`
                  px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${fontSize === size
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-pressed={fontSize === size}
              >
                {t(`accessibility.fontSizes.${size}`)}
              </button>
            ))}
          </div>
        </div>

        {/* System Preferences */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('accessibility.highContrast')}
            </label>
            <span className={`
              px-2 py-1 text-xs rounded-full
              ${isHighContrast ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {isHighContrast ? t('common.enabled') : t('common.disabled')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t('accessibility.reducedMotion')}
            </label>
            <span className={`
              px-2 py-1 text-xs rounded-full
              ${reducedMotion ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {reducedMotion ? t('common.enabled') : t('common.disabled')}
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            {t('accessibility.systemPreferencesNote')}
          </p>
        </div>
      </div>
    </div>
  );
};
```

### 8.4 Performance Optimization

#### 8.4.1 Code Splitting and Lazy Loading

**Duration**: 6 hours

**Priority**: High

**Tasks:**

- [ ] Implement route-based code splitting
- [ ] Add component-level lazy loading
- [ ] Optimize bundle sizes with tree shaking
- [ ] Implement service worker for caching
- [ ] Add image optimization and lazy loading

**Acceptance Criteria:**

- Initial page load under 2 seconds on 3G connection
- Bundle size reduced by 60% through code splitting
- Images load progressively without layout shift
- Service worker caches resources for offline access
- Lazy loading reduces initial JavaScript payload

**Implementation Details:**

```typescript
// frontend/src/utils/lazyImport.ts
import { lazy } from 'react';

export const lazyImport = <
  T extends React.ComponentType<any>,
  I extends { [K2 in K]: T },
  K extends keyof I
>(
  factory: () => Promise<I>,
  name: K
): React.LazyExoticComponent<T> =>
  lazy(() => factory().then(module => ({ default: module[name] })));

// frontend/src/pages/index.ts
import { lazyImport } from '../utils/lazyImport';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy load major page components
export const HomePage = lazyImport(() => import('./HomePage'), 'HomePage');
export const JobsPage = lazyImport(() => import('./JobsPage'), 'JobsPage');
export const ProfilePage = lazyImport(() => import('./ProfilePage'), 'ProfilePage');
export const DashboardPage = lazyImport(() => import('./DashboardPage'), 'DashboardPage');
export const ApplicationsPage = lazyImport(() => import('./ApplicationsPage'), 'ApplicationsPage');

// Default loading component
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

// frontend/src/components/ui/LazyImage.tsx
import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  className = '',
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <img
        ref={imgRef}
        src={placeholder}
        alt=""
        className={`
          absolute inset-0 w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-0' : 'opacity-100'}
        `}
        aria-hidden="true"
      />

      {/* Actual image */}
      {(isInView || loading === 'eager') && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          loading={loading}
          {...props}
        />
      )}
    </div>
  );
};

// frontend/src/utils/performanceOptimizations.ts
export const enablePerformanceOptimizations = () => {
  // Preload critical resources
  const preloadCriticalResources = () => {
    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/api/v1/user/profile',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('font') ? 'font' : 'fetch';
      if (resource.includes('font')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  };

  // Optimize third-party scripts
  const optimizeThirdPartyScripts = () => {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      script.setAttribute('defer', '');
    });
  };

  // Enable resource hints
  const enableResourceHints = () => {
    // DNS prefetch for external domains
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://api.safe-job.nl',
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  };

  preloadCriticalResources();
  optimizeThirdPartyScripts();
  enableResourceHints();
};

// Register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};
```

### 8.5 Error Handling and User Feedback

#### 8.5.1 Comprehensive Error Handling System

**Duration**: 4 hours

**Priority**: High

**Tasks:**

- [ ] Implement global error boundary with user-friendly messages
- [ ] Add contextual error handling for API calls
- [ ] Create offline detection and handling
- [ ] Implement retry mechanisms for failed operations
- [ ] Add comprehensive loading states and feedback

**Acceptance Criteria:**

- All errors caught and displayed with helpful messages
- API errors provide actionable feedback to users
- Offline state detected with appropriate fallbacks
- Failed operations can be retried automatically or manually
- Loading states prevent user confusion during operations

## Risk Assessment & Mitigation

### High Risk Areas

1. **Performance on Low-End Devices**
   - **Risk**: Poor performance on older mobile devices
   - **Mitigation**: Aggressive code splitting, performance budgets, testing on low-end devices
   - **Monitoring**: Core Web Vitals, device performance metrics

2. **Translation Quality**
   - **Risk**: Poor or inaccurate translations affecting user experience
   - **Mitigation**: Professional translation services, native speaker review, context documentation
   - **Monitoring**: User feedback, translation accuracy reports

### Medium Risk Areas

1. **Accessibility Compliance**
   - **Risk**: Missing accessibility features affecting disabled users
   - **Mitigation**: WCAG 2.1 guidelines, automated testing, manual audits
   - **Monitoring**: Accessibility audit reports, user feedback

2. **Cross-Browser Compatibility**
   - **Risk**: Features not working consistently across browsers
   - **Mitigation**: Progressive enhancement, polyfills, comprehensive testing
   - **Monitoring**: Browser analytics, error tracking by browser

## Testing Requirements

### Unit Tests

- [ ] Component rendering and behavior
- [ ] Accessibility features and ARIA support
- [ ] Internationalization functions
- [ ] Performance optimization utilities

### Integration Tests

- [ ] Complete user workflows across devices
- [ ] Language switching functionality
- [ ] Responsive design on various screen sizes
- [ ] Offline behavior and service worker

### Performance Tests

- [ ] Bundle size analysis
- [ ] Core Web Vitals measurement
- [ ] Network throttling tests
- [ ] Memory usage profiling

### Accessibility Tests

- [ ] Automated accessibility scanning
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast validation

## Documentation Requirements

- [ ] User interface style guide
- [ ] Accessibility implementation guide
- [ ] Performance optimization guide
- [ ] Translation workflow documentation
- [ ] Component library documentation

## Deliverables Checklist

### Code Deliverables

- [ ] Fully responsive React components
- [ ] Complete internationalization system
- [ ] Accessibility features (WCAG 2.1 AA)
- [ ] Performance optimizations
- [ ] Error handling and user feedback systems

### Design Deliverables

- [ ] Mobile-responsive design system
- [ ] Accessibility compliant UI components
- [ ] Multi-language interface designs
- [ ] Loading states and error pages
- [ ] User feedback and notification systems

### Documentation Deliverables

- [ ] UI/UX style guide
- [ ] Accessibility compliance report
- [ ] Performance optimization guide
- [ ] Translation management workflow

## Success Metrics

- **Performance**: Core Web Vitals scores in the "Good" range (LCP <2.5s, FID <100ms, CLS <0.1)
- **Accessibility**: 100% WCAG 2.1 AA compliance
- **Mobile Experience**: >95% user satisfaction on mobile devices
- **Internationalization**: All 6 languages fully supported with cultural appropriate formatting
- **User Engagement**: <5% bounce rate, >3 minutes average session duration

This comprehensive frontend polish phase ensures the Safe Job platform delivers an exceptional user experience across all devices, languages, and accessibility needs, positioning it as a professional, inclusive platform in the competitive job market.
