import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/src/core/theme';

export default function BenefitsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>สิทธิประโยชน์</Text>
        <Text style={styles.subtitle}>หน้าจอนี้กำลังอยู่ระหว่างพัฒนา</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.size.body,
  },
});
