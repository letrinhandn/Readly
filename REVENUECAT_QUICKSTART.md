# RevenueCat Quick Reference

## 🚀 Quick Start

```bash
# 1. Install package
npx expo install react-native-purchases

# 2. Build dev client (RevenueCat doesn't work in Expo Go)
npx expo run:ios
# or
npx expo run:android
```

## 📱 Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Paywall | `/paywall` | Subscription purchase screen |
| Premium Feature | `/premium-feature` | Example premium-only screen |
| Subscription Management | `/subscription-management` | Manage active subscription |

## 🪝 Hooks

### usePremium()
```typescript
const { isPremium, isLoading } = usePremium();
```

### useRevenueCat()
```typescript
const {
  isPremium,
  isLoading,
  customerInfo,
  offerings,
  purchaseProduct,
  restorePurchases,
  getMonthlyPackage,
  getYearlyPackage,
} = useRevenueCat();
```

### usePremiumRequired()
```typescript
// Automatically redirects non-premium users with alert
function MyPremiumScreen() {
  usePremiumRequired();
  return <PremiumContent />;
}
```

### usePremiumFeature()
```typescript
const { requirePremium } = usePremiumFeature('Feature Name');

requirePremium(() => {
  // Runs only if premium
  doSomething();
});
```

## 🛡️ Components

### PremiumGuard
```typescript
<PremiumGuard>
  <PremiumContent />
</PremiumGuard>
```

### PremiumBadge
```typescript
<PremiumBadge size="small" />   // small, medium, large
```

## 🔑 Configuration

File: `contexts/revenuecat-context.tsx`

```typescript
const REVENUECAT_API_KEY = 'YOUR_KEY_HERE';
const ENTITLEMENT_ID = 'Readly Premium';
```

## 💳 Products

- **Monthly**: `monthly`
- **Yearly**: `yearly`

## 📦 Manual Purchase

```typescript
const { purchaseProduct } = useRevenueCat();

// Purchase monthly
await purchaseProduct('monthly');

// Purchase yearly
await purchaseProduct('yearly');

// Restore purchases
await restorePurchases();
```

## 🎨 Lock Premium Features

```typescript
import { usePremiumFeature } from '@/hooks/usePremiumCheck';

const { isPremium, requirePremium } = usePremiumFeature('Premium Themes');

const handlePremiumAction = () => {
  if (!isPremium) {
    requirePremium(() => {
      // Only runs for premium users
    });
  } else {
    // Run action
  }
};
```

## 🔄 Sync with Backend (Optional)

```typescript
import useSyncPremiumWithBackend from '@/hooks/useSyncPremiumWithBackend';

function App() {
  useSyncPremiumWithBackend(); // Auto-syncs to Supabase
  return <YourApp />;
}
```

## ⚠️ Platform Support

- ✅ iOS (native)
- ✅ Android (native)
- ⚠️ Web (graceful fallback, no purchases)

## 🧪 Testing

### Test Mode
- Use test API key (starts with `test_`)
- No real charges
- Instant subscription changes

### Sandbox (iOS)
1. Create sandbox account in App Store Connect
2. Sign out of Apple ID
3. Test purchase with sandbox account

### Testing Track (Android)
1. Add testers in Play Console
2. Install from testing track
3. Purchases are free for testers

## 📚 Resources

- [Full Setup Guide](./REVENUECAT_SETUP.md)
- [RevenueCat Docs](https://docs.revenuecat.com/)
- [React Native SDK](https://docs.revenuecat.com/docs/reactnative)

## 🎯 Example: Lock Share Themes

```typescript
const THEMES = [
  { id: 'light', premium: false },
  { id: 'dark', premium: false },
  { id: 'gradient', premium: false },
  { id: 'tech-green', premium: true },
  { id: 'vintage', premium: true },
  // ... 7 more premium themes
];

function ThemeSelector() {
  const { isPremium } = usePremium();

  return themes.map(theme => (
    <ThemeCard
      theme={theme}
      locked={theme.premium && !isPremium}
      onSelect={() => handleSelect(theme)}
    />
  ));
}
```

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Package not found | Check product IDs in App Store/Play Store |
| Invalid API key | Verify key in RevenueCat dashboard |
| Can't test in Expo Go | Build dev client with `expo run:ios/android` |
| Purchases not restoring | Check entitlement name matches exactly |

## 📋 Checklist

- [ ] Install `react-native-purchases`
- [ ] Set up products in App Store Connect
- [ ] Set up products in Google Play Console
- [ ] Configure RevenueCat dashboard
- [ ] Update API key in code
- [ ] Build dev client or production build
- [ ] Test with sandbox accounts
- [ ] Gate premium features in your app
- [ ] Add premium badges to UI
- [ ] Test restore purchases
- [ ] Submit for review

---

Need help? Check [REVENUECAT_SETUP.md](./REVENUECAT_SETUP.md) for detailed instructions.
