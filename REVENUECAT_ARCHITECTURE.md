# RevenueCat Integration Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Readly App                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App Root (_layout.tsx)                  │  │
│  │                                                            │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │           RevenueCatProvider Context             │   │  │
│  │  │                                                  │   │  │
│  │  │  • SDK Initialization                           │   │  │
│  │  │  • Customer Info Management                     │   │  │
│  │  │  • Entitlement Checking                         │   │  │
│  │  │  • Purchase Handling                            │   │  │
│  │  │  • Restore Purchases                            │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                           ↓                              │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              Application Screens                 │   │  │
│  │  │                                                  │   │  │
│  │  │  • Focus Session    • Library                   │   │  │
│  │  │  • Stats            • Profile                   │   │  │
│  │  │  • Share Cards      • Book Details              │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │         Premium-Protected Features          │
        │                                             │
        │  ┌───────────────────────────────────────┐ │
        │  │       Share Card Themes               │ │
        │  │                                       │ │
        │  │  FREE:                                │ │
        │  │  • Minimal Light                      │ │
        │  │  • Minimal Dark                       │ │
        │  │  • Fancy Gradient                     │ │
        │  │                                       │ │
        │  │  PREMIUM (10 themes): 💎              │ │
        │  │  • Tech Green    • Space Galaxy       │ │
        │  │  • Vintage       • Retro Pixel        │ │
        │  │  • Golden        • Anime/Manga        │ │
        │  │  • Cyberpunk     • Sunset Mood        │ │
        │  │  • Nature Calm   • Watercolor         │ │
        │  └───────────────────────────────────────┘ │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │           RevenueCat Backend                │
        │                                             │
        │  • Entitlement: "Readly Premium"           │
        │  • Offering: "default"                     │
        │  • Products: monthly, yearly               │
        │                                             │
        │  ↓ syncs with ↓                            │
        │                                             │
        │  • App Store Connect (iOS)                 │
        │  • Google Play Console (Android)           │
        └─────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────┐
        │        Supabase Backend (Optional)          │
        │                                             │
        │  user_profiles table:                       │
        │  • is_premium: boolean                      │
        │  • premium_expires_at: timestamp            │
        │                                             │
        │  Synced automatically via hook              │
        └─────────────────────────────────────────────┘
```

## 🔄 Purchase Flow

```
┌──────────────┐
│  Free User   │
└──────┬───────┘
       │
       │ Taps Premium Theme
       ↓
┌──────────────────────┐
│  Premium Check       │
│  (usePremium hook)   │
└──────┬───────────────┘
       │
       │ Not Premium
       ↓
┌──────────────────────┐
│  Show Alert          │
│  "Upgrade Required"  │
└──────┬───────────────┘
       │
       │ User taps "Upgrade"
       ↓
┌──────────────────────┐
│  Navigate to         │
│  /paywall            │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Paywall Screen      │
│                      │
│  • Select Plan       │
│  • Monthly / Yearly  │
│  • View Features     │
└──────┬───────────────┘
       │
       │ Tap "Subscribe"
       ↓
┌──────────────────────┐
│  RevenueCat SDK      │
│  Purchase Flow       │
└──────┬───────────────┘
       │
       │ ✓ Success
       ↓
┌──────────────────────┐
│  Customer Info       │
│  Updated             │
│                      │
│  isPremium = true ✨ │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Premium User! 💎    │
│                      │
│  • All themes        │
│  • All features      │
│  • Premium badge     │
└──────────────────────┘
```

## 🎯 Component Hierarchy

```
App Root
├── RevenueCatProvider ⭐
│   ├── Initializes SDK
│   ├── Manages customer info
│   ├── Provides hooks
│   └── Syncs with backend
│
├── Screens
│   ├── /paywall 💎
│   │   ├── Plan selection
│   │   ├── Purchase buttons
│   │   └── Restore purchases
│   │
│   ├── /premium-feature 🔒
│   │   ├── PremiumGuard wrapper
│   │   ├── Locked state
│   │   └── Premium content
│   │
│   ├── /subscription-management ⚙️
│   │   ├── Current plan info
│   │   ├── Manage subscription
│   │   └── Customer center
│   │
│   └── /share-card 🎨
│       ├── Theme selector
│       ├── Premium check
│       └── Lock overlay
│
└── Components
    ├── PremiumGuard 🛡️
    │   ├── Checks isPremium
    │   ├── Shows locked state
    │   └── Upgrade button
    │
    └── PremiumBadge 💎
        └── Shows "PREMIUM" badge
```

## 🪝 Hook Usage

```typescript
// 1. Check Premium Status
const { isPremium, isLoading } = usePremium();

// 2. Full RevenueCat Access
const {
  isPremium,
  customerInfo,
  offerings,
  purchaseProduct,
  restorePurchases,
} = useRevenueCat();

// 3. Navigation Guard
usePremiumRequired(); // Auto-redirects if not premium

// 4. Feature-Specific Check
const { requirePremium } = usePremiumFeature('Themes');
requirePremium(() => {
  // Runs only for premium
});

// 5. Backend Sync (Optional)
useSyncPremiumWithBackend(); // Auto-syncs to Supabase
```

## 📱 Screen Flow

```
Login
  ↓
Home (Tabs)
  ├── Focus
  ├── Library
  ├── Stats
  └── Profile
      └── Settings
          ├── Manage Subscription (if premium)
          └── Upgrade to Premium (if free)
              ↓
          ┌───────────┐
          │  Paywall  │ ← Can be opened from anywhere
          └───────────┘
              ↓
          Purchase Complete
              ↓
          Premium Features Unlocked! 🎉
```

## 🎨 Premium Theme Integration

```
Share Card Screen
├── Theme Selector
│   ├── Free Themes (3)
│   │   ├── Minimal Light ✓
│   │   ├── Minimal Dark ✓
│   │   └── Fancy Gradient ✓
│   │
│   └── Premium Themes (10) 💎
│       ├── If isPremium:
│       │   └── All selectable ✓
│       │
│       └── If !isPremium:
│           ├── Show lock icon 🔒
│           ├── Show premium badge 💎
│           └── Tap → Upgrade alert
│               └── Navigate to /paywall
│
└── Made with Readly 📚
```

## 🔐 Premium Check Logic

```
┌─────────────────────┐
│  Feature Accessed   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Is Premium Theme?  │
└──────┬──────────────┘
       │
  ┌────┴────┐
  │         │
  NO       YES
  │         │
  │    ┌────┴─────────────┐
  │    │  Check isPremium │
  │    └────┬─────────────┘
  │         │
  │    ┌────┴────┐
  │    │         │
  │   YES       NO
  │    │         │
  │    │    ┌────┴───────────┐
  │    │    │  Show Alert    │
  │    │    │  "Upgrade"     │
  │    │    └────┬───────────┘
  │    │         │
  │    │         ↓
  │    │    Navigate
  │    │    to /paywall
  │    │
  └────┴────┐
       │
       ↓
┌─────────────────────┐
│  Allow Access ✓     │
└─────────────────────┘
```

## 🗄️ Data Flow

```
RevenueCat SDK (Client)
       ↓
Customer Info
       ↓
RevenueCatContext
       ↓
usePremium() Hook
       ↓
React Components
       ↓
UI Updates
       ↓
Optional: Sync to Supabase
       ↓
Backend Database
```

## 📊 State Management

```
┌─────────────────────────────────────────┐
│      RevenueCat Context State           │
├─────────────────────────────────────────┤
│  • customerInfo: CustomerInfo | null    │
│  • offerings: Offerings | null          │
│  • isPremium: boolean                   │
│  • isLoading: boolean                   │
│  • isInitialized: boolean               │
└─────────────────────────────────────────┘
                   ↓
         Consumed by Hooks
                   ↓
    ┌──────────────────────────┐
    │  usePremium()            │
    │  useRevenueCat()         │
    │  usePremiumRequired()    │
    │  usePremiumFeature()     │
    └──────────────────────────┘
                   ↓
            Used in Components
```

## 🔄 Subscription Lifecycle

```
1. App Launch
   ↓
2. SDK Initialize
   ↓
3. Load Customer Info
   ↓
4. Check Entitlements
   ↓
5. Set isPremium State
   ↓
6. Optional: Sync to Backend
   ↓
7. UI Updates
   ↓
8. User Interacts
   ↓
   ├─→ Purchase → Update State → Unlock Features
   ├─→ Restore → Check Backend → Update State
   └─→ Expire → Backend Notifies → Update State
```

## 🛠️ File Organization

```
project/
├── contexts/
│   └── revenuecat-context.tsx ⭐ (Main provider)
│
├── hooks/
│   ├── usePremiumCheck.ts (Navigation & feature guards)
│   └── useSyncPremiumWithBackend.ts (Supabase sync)
│
├── components/
│   └── PremiumGuard.tsx (Guard + Badge components)
│
├── app/
│   ├── paywall.tsx 💳 (Purchase screen)
│   ├── premium-feature.tsx 🔒 (Example locked screen)
│   ├── subscription-management.tsx ⚙️ (Manage subs)
│   └── _layout.tsx (Root with provider)
│
├── types/
│   └── premium.ts (TypeScript types)
│
├── constants/
│   └── share-themes.ts (Theme configs with isPremium flags)
│
└── examples/
    └── ShareThemeSelector.example.tsx (Complete example)
```

## 📈 Metrics to Track

```
┌──────────────────────────────────────────┐
│       RevenueCat Dashboard Metrics       │
├──────────────────────────────────────────┤
│  • Active Subscribers                    │
│  • Monthly Recurring Revenue (MRR)       │
│  • Conversion Rate                       │
│  • Churn Rate                            │
│  • Average Revenue Per User (ARPU)       │
│  • Lifetime Value (LTV)                  │
└──────────────────────────────────────────┘
```

## 🎯 Success Criteria

```
✅ SDK Initialized Successfully
✅ Products Load from Stores
✅ Purchase Flow Works
✅ Restore Works
✅ Entitlements Check Correctly
✅ Premium Features Locked for Free Users
✅ Premium Features Unlocked for Paid Users
✅ UI Shows Premium Status
✅ Backend Synced (if using)
✅ All Tests Pass
```

---

**This architecture ensures a robust, scalable subscription system for your Readly app! 🚀**
