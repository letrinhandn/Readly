# RevenueCat Integration Guide

This project includes a complete RevenueCat integration for subscription management.

## Important Note

⚠️ **RevenueCat SDK requires custom native code and will NOT work in Expo Go.** You must build a development client or production build to test subscriptions.

## Installation

### 1. Install RevenueCat SDK

```bash
npx expo install react-native-purchases
```

### 2. Configure App Store Connect / Google Play Console

You need to set up your products in the respective app stores:

#### iOS (App Store Connect):
1. Create a subscription group
2. Create two subscription products:
   - **Monthly**: Product ID `monthly`
   - **Yearly**: Product ID `yearly`

#### Android (Google Play Console):
1. Go to Subscriptions section
2. Create two subscription products:
   - **Monthly**: Product ID `monthly`
   - **Yearly**: Product ID `yearly`

### 3. Configure RevenueCat Dashboard

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create a project
3. Add your API keys from App Store Connect and Google Play Console
4. Create an entitlement named: `Readly Premium`
5. Create an offering with ID: `default`
6. Add your two products (monthly and yearly) to the offering

### 4. Update API Key

Update the API key in `contexts/revenuecat-context.tsx`:

```typescript
const REVENUECAT_API_KEY = 'YOUR_REVENUECAT_PUBLIC_SDK_KEY';
```

Current test key: `test_EBCTTKAYreuszKiTMMyAjaLkcnF`

## Features Implemented

### ✅ Core Features
- [x] RevenueCat SDK initialization
- [x] Customer info retrieval
- [x] Entitlement checking ("Readly Premium")
- [x] Subscription purchase flow
- [x] Restore purchases
- [x] Error handling
- [x] Web compatibility (graceful fallback)

### ✅ UI Components
- [x] Paywall screen with beautiful design
- [x] Subscription management screen
- [x] Premium feature screen (example)
- [x] Premium guard component
- [x] Premium badge component

### ✅ Hooks & Utilities
- [x] `usePremium()` - Check premium status
- [x] `useRevenueCat()` - Full RevenueCat context
- [x] `usePremiumRequired()` - Navigation guard
- [x] `usePremiumFeature()` - Feature-specific check

## Usage Examples

### 1. Check Premium Status

```typescript
import { usePremium } from '@/contexts/revenuecat-context';

function MyComponent() {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) return <Text>Loading...</Text>;
  
  return <Text>{isPremium ? 'Premium User' : 'Free User'}</Text>;
}
```

### 2. Premium Guard Component

```typescript
import { PremiumGuard } from '@/components/PremiumGuard';

function PremiumOnlyFeature() {
  return (
    <PremiumGuard>
      <Text>This content is only for premium users!</Text>
    </PremiumGuard>
  );
}
```

### 3. Navigation Guard Hook

```typescript
import { usePremiumRequired } from '@/hooks/usePremiumCheck';

function PremiumScreen() {
  const { isPremium, isLoading } = usePremiumRequired();
  
  if (isLoading) return <LoadingView />;
  if (!isPremium) return null; // Will auto-redirect
  
  return <PremiumContent />;
}
```

### 4. Feature-Specific Check

```typescript
import { usePremiumFeature } from '@/hooks/usePremiumCheck';

function MyComponent() {
  const { requirePremium } = usePremiumFeature('Advanced Analytics');

  const handleAnalytics = () => {
    requirePremium(() => {
      // This only runs if user is premium
      // Otherwise shows upgrade alert
      showAdvancedAnalytics();
    });
  };

  return <Button onPress={handleAnalytics}>View Analytics</Button>;
}
```

### 5. Manual Purchase

```typescript
import { useRevenueCat } from '@/contexts/revenuecat-context';

function ManualPurchaseButton() {
  const { purchaseProduct } = useRevenueCat();

  const handlePurchase = async () => {
    try {
      await purchaseProduct('monthly');
      Alert.alert('Success', 'You are now premium!');
    } catch (error) {
      Alert.alert('Error', 'Purchase failed');
    }
  };

  return <Button onPress={handlePurchase}>Buy Monthly</Button>;
}
```

### 6. Show Premium Badge

```typescript
import { PremiumBadge } from '@/components/PremiumGuard';

function ProfileHeader() {
  const { isPremium } = usePremium();

  return (
    <View>
      <Text>John Doe</Text>
      {isPremium && <PremiumBadge size="medium" />}
    </View>
  );
}
```

## Available Screens

### Paywall Screen
Route: `/paywall`

Beautiful subscription paywall with:
- Premium features showcase
- Monthly and Yearly plan selection
- Pricing comparison
- Best value badge
- Purchase buttons
- Restore purchases

### Premium Feature Screen
Route: `/premium-feature`

Example screen that shows:
- Locked state for free users
- Upgrade prompt
- Unlocked content for premium users

### Subscription Management Screen
Route: `/subscription-management`

Manage subscriptions with:
- Current plan display
- Renewal/expiration date
- Manage subscription button (links to app store)
- Restore purchases
- Customer center access

## Navigation Integration

All screens are already added to the root navigator in `app/_layout.tsx`:

```typescript
<Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
<Stack.Screen name="premium-feature" options={{ title: 'Premium Feature' }} />
<Stack.Screen name="subscription-management" options={{ title: 'Subscription' }} />
```

## Testing Subscriptions

### Sandbox Testing (iOS)

1. Create a sandbox tester account in App Store Connect
2. Sign out of your Apple ID on the device
3. Run the app and make a purchase
4. Sign in with your sandbox account when prompted
5. Subscriptions will be accelerated (e.g., 1 month = 5 minutes)

### Google Play Testing (Android)

1. Add test accounts in Google Play Console
2. Join the testing track
3. Install the app from the Play Store testing track
4. Make purchases (will be free for test accounts)

### Test Cards

RevenueCat provides test mode that works without real payment:
- Use the test API key (starts with `test_`)
- All purchases will be simulated
- No real charges will occur

## Customer Center (Optional)

The Customer Center UI is mentioned in the code but requires additional setup:

1. Enable Customer Center in RevenueCat Dashboard
2. Configure the UI in RevenueCat
3. Update the `openCustomerCenter()` function in `subscription-management.tsx`

Documentation: https://www.revenuecat.com/docs/tools/customer-center

## Web Support

The integration includes graceful fallbacks for web:
- All RevenueCat calls check `Platform.OS !== 'web'`
- Web users see "not available" messages
- No crashes on web platform

## Troubleshooting

### "Package not found" error
- Verify your products are created in App Store Connect/Google Play
- Check product IDs match exactly: `monthly` and `yearly`
- Ensure products are approved and available

### "Invalid API key" error
- Verify you're using the correct API key
- Use test key for testing, production key for release
- Check RevenueCat dashboard configuration

### Purchases not restoring
- Ensure user is signed in with the same account
- Check the entitlement name matches exactly: `Readly Premium`
- Verify subscription is active in app store

### Can't test in Expo Go
- RevenueCat requires custom native code
- Build a development client: `npx expo run:ios` or `npx expo run:android`
- Or create a standalone build

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat React Native SDK](https://docs.revenuecat.com/docs/reactnative)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Next Steps

1. Install the package: `npx expo install react-native-purchases`
2. Set up your products in App Store Connect and Google Play Console
3. Configure RevenueCat dashboard
4. Update the API key in the code
5. Build a development client or production build
6. Test purchases with sandbox accounts
7. Integrate premium checks throughout your app

## Premium Features in Your App

You can now gate these features behind premium:
- **10 Premium Share Themes** - Lock premium themes in share card selection
- **Advanced Analytics** - Show detailed stats only for premium
- **Unlimited Books** - Limit free users to X books
- **Priority Support** - Offer faster support for premium users

Example implementation for share themes:

```typescript
import { usePremiumFeature } from '@/hooks/usePremiumCheck';

function ShareThemeSelector() {
  const { isPremium, requirePremium } = usePremiumFeature('Premium Share Themes');

  const themes = [
    { id: 'minimal-light', name: 'Minimal Light', premium: false },
    { id: 'minimal-dark', name: 'Minimal Dark', premium: false },
    { id: 'fancy-gradient', name: 'Fancy Gradient', premium: false },
    { id: 'tech-green', name: 'Tech Green', premium: true },
    { id: 'vintage', name: 'Vintage Paper', premium: true },
    // ... more premium themes
  ];

  const handleThemeSelect = (theme: Theme) => {
    if (theme.premium && !isPremium) {
      requirePremium(() => {
        selectTheme(theme);
      });
    } else {
      selectTheme(theme);
    }
  };

  return (
    <View>
      {themes.map(theme => (
        <TouchableOpacity key={theme.id} onPress={() => handleThemeSelect(theme)}>
          <Text>{theme.name}</Text>
          {theme.premium && !isPremium && <PremiumBadge />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
```
