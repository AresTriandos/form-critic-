# Form Critic Design System

## Aesthetic Direction

**Modern, Athletic, Energetic**

Form Critic is a fitness/form analysis app. The design reflects:
- **Professional** — trustworthy, credible AI analysis
- **Athletic** — energetic, performance-focused
- **Approachable** — inviting, not intimidating

Color palette and component design reflect this athletic brand energy while maintaining clarity and usability.

---

## Color Palette

### Light Mode

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#0F7EA8` | Main actions, navigation, CTAs |
| **Primary Light** | `#1B9BC8` | Hover states, accents |
| **Accent** | `#FF6B35` | Energy, urgency, highlights |
| **Success** | `#00D084` | Positive feedback, achievements |
| **Warning** | `#FFA500` | Alerts, caution |
| **Text** | `#1a1a1a` | Primary text |
| **Text Secondary** | `#6B7280` | Supporting text |
| **Text Tertiary** | `#9CA3AF` | Tertiary text, disabled |
| **Background** | `#FAFAFA` | App background |
| **Surface** | `#FFFFFF` | Cards, elevated surfaces |
| **Surface Alt** | `#F3F4F6` | Secondary surfaces |
| **Border** | `#E5E7EB` | Card borders, dividers |

### Dark Mode

| Name | Hex | Usage |
|------|-----|-------|
| **Primary** | `#2EBBDD` | Main actions (brighter for dark) |
| **Primary Light** | `#4CC9E8` | Hover states |
| **Background** | `#0F172A` | Deep navy background |
| **Surface** | `#1E293B` | Cards on dark |
| **Text** | `#F3F4F6` | Primary text on dark |

---

## Typography

All typography styles defined in `src/constants/theme.ts`:

### Display
- **Display Large**: 40px, 700 weight, 48px line height
- **Display Small**: 32px, 700 weight, 40px line height

### Headings
- **Heading Large**: 28px, 600 weight
- **Heading Small**: 20px, 600 weight

### Body
- **Body Large**: 16px, 400 weight (main content)
- **Body Medium**: 14px, 400 weight (supporting)
- **Body Small**: 12px, 400 weight (tertiary)

### Labels
- **Label Large**: 14px, 600 weight (buttons, badges)
- **Label Small**: 12px, 600 weight (small labels)

---

## Spacing System

Consistent spacing scale (in pixels):
- `xs`: 4px (micro)
- `sm`: 8px (small)
- `md`: 12px (medium)
- `lg`: 16px (standard)
- `xl`: 24px (large)
- `2xl`: 32px (extra large)
- `3xl`: 48px (jumbo)
- `4xl`: 64px (massive)

Use these consistently throughout for visual rhythm.

---

## Components

### Button

**Variants:**
1. **Primary** — Main action, deep blue background
2. **Secondary** — Alternative action, outlined with blue border
3. **Tertiary** — Low-priority action, text only

**Sizes:**
- Small: 8px vertical, 16px horizontal padding
- Medium: 12px vertical, 24px horizontal padding
- Large: 16px vertical, 32px horizontal padding

**Usage:**
```tsx
<Button
  label="Start Recording"
  onPress={() => {}}
  variant="primary"
  size="lg"
  icon={<Ionicons name="camera" size={20} />}
/>
```

### Card

**Variants:**
1. **Default** — Light background (surfaceAlt)
2. **Elevated** — White/surface background with shadow
3. **Outlined** — White/surface background with border

**Padding options:** sm, md, lg

**Usage:**
```tsx
<Card variant="outlined" padding="md">
  <Text>Content here</Text>
</Card>
```

### Badge

**Variants:**
- Primary (blue)
- Success (green)
- Warning (amber)
- Accent (orange)

**Usage:**
```tsx
<Badge label="✨ Smart Analysis" variant="primary" />
```

---

## Shadow System

Three levels of elevation:

- **Small**: Subtle shadow for slight depth
- **Medium**: Card shadow for clear elevation
- **Large**: Deep shadow for prominent surfaces

Applied via `Shadows` object in theme.

---

## Border Radius

Consistent rounding for visual cohesion:
- `sm`: 6px (input fields, small elements)
- `md`: 12px (cards, standard)
- `lg`: 16px (buttons, rounded elements)
- `xl`: 24px (hero icons, large elements)
- `full`: 999px (perfect circles, badges)

---

## Implementation Guidelines

### When Adding New Components

1. Use colors from `Colors` object (not hardcoded hex values)
2. Use spacing from `Spacing` object
3. Use typography from `Typography` object
4. Check `useColorScheme()` for dark/light mode
5. Apply `Shadows` for elevation

### Example: Creating a New Component

```tsx
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function MyComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
      }}
    >
      <Text style={Typography.headingSmall}>
        Hello
      </Text>
    </View>
  );
}
```

---

## Design Principles

1. **Consistency** — Use design tokens, never hardcode values
2. **Clarity** — Bold typography hierarchy, clear CTAs
3. **Athletic Energy** — Bright accents, confident primary color
4. **Dark Mode Support** — All components support light and dark
5. **Accessibility** — Sufficient contrast, readable text sizes
6. **Performance** — Minimal animations, fast interactions

---

## Future Enhancements

- [ ] Add gesture-based animations (swipe feedback, transitions)
- [ ] Create specialized screens (results, history, settings)
- [ ] Add micro-interactions (button press, form validation)
- [ ] Custom icon set aligned with athletic brand
- [ ] Gradient accents for key moments (achievements, milestones)

