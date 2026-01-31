import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { bundledWordBundles, WordBundle } from "@/data/bundles";
import {
  getBundleAppliedMap,
  getBundleDismissedMap,
  applyWordBundle,
  markBundleDismissed,
  BundleStateMap,
} from "@/lib/storage";

type BundleStatus = "pending" | "applied" | "dismissed";

interface BundleWithStatus {
  bundle: WordBundle;
  status: BundleStatus;
}

export default function DictionaryUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const [bundlesWithStatus, setBundlesWithStatus] = useState<BundleWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewBundle, setPreviewBundle] = useState<WordBundle | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ added: number; skipped: number } | null>(null);

  const loadBundles = useCallback(async () => {
    try {
      const [appliedMap, dismissedMap] = await Promise.all([
        getBundleAppliedMap(),
        getBundleDismissedMap(),
      ]);

      const withStatus: BundleWithStatus[] = bundledWordBundles.map((bundle) => {
        let status: BundleStatus = "pending";
        if (appliedMap[bundle.bundleId]) {
          status = "applied";
        } else if (dismissedMap[bundle.bundleId]) {
          status = "dismissed";
        }
        return { bundle, status };
      });

      setBundlesWithStatus(withStatus);
    } catch (error) {
      console.error("Failed to load bundles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBundles();
  }, [loadBundles]);

  const handleApply = async (bundle: WordBundle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplyingId(bundle.bundleId);
    try {
      const result = await applyWordBundle(bundle);
      setLastResult(result);
      await loadBundles();
      setTimeout(() => setLastResult(null), 3000);
    } catch (error) {
      console.error("Failed to apply bundle:", error);
    } finally {
      setApplyingId(null);
    }
  };

  const handleDismiss = async (bundle: WordBundle) => {
    Haptics.selectionAsync();
    try {
      await markBundleDismissed(bundle.bundleId);
      await loadBundles();
    } catch (error) {
      console.error("Failed to dismiss bundle:", error);
    }
  };

  const handlePreview = (bundle: WordBundle) => {
    Haptics.selectionAsync();
    setPreviewBundle(bundle);
  };

  const pendingBundles = bundlesWithStatus.filter((b) => b.status === "pending");
  const appliedBundles = bundlesWithStatus.filter((b) => b.status === "applied");
  const dismissedBundles = bundlesWithStatus.filter((b) => b.status === "dismissed");

  const renderBundleItem = ({ item }: { item: BundleWithStatus }) => {
    const { bundle, status } = item;
    const isApplying = applyingId === bundle.bundleId;

    return (
      <View
        style={[styles.bundleCard, { backgroundColor: colors.backgroundDefault }]}
        testID={`bundle-card-${bundle.bundleId}`}
      >
        <View style={styles.bundleHeader}>
          <View style={styles.bundleInfo}>
            <ThemedText style={[styles.bundleTitle, { color: colors.text }]}>
              {bundle.title}
            </ThemedText>
            <ThemedText style={[styles.bundleWordCount, { color: colors.textSecondary }]}>
              {bundle.words.length} words
            </ThemedText>
          </View>
          {status === "applied" && (
            <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <ThemedText style={[styles.statusText, { color: colors.success }]}>
                Added
              </ThemedText>
            </View>
          )}
          {status === "dismissed" && (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary + "20" }]}>
              <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
                Dismissed
              </ThemedText>
            </View>
          )}
        </View>

        {bundle.description ? (
          <ThemedText
            style={[styles.bundleDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {bundle.description}
          </ThemedText>
        ) : null}

        {status === "pending" ? (
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.previewButton, { borderColor: colors.primary }]}
              onPress={() => handlePreview(bundle)}
              testID={`preview-button-${bundle.bundleId}`}
            >
              <Feather name="eye" size={16} color={colors.primary} />
              <ThemedText style={[styles.previewButtonText, { color: colors.primary }]}>
                Preview
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => handleApply(bundle)}
              disabled={isApplying}
              testID={`add-button-${bundle.bundleId}`}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.addButtonText}>Add</ThemedText>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.dismissButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => handleDismiss(bundle)}
              testID={`dismiss-button-${bundle.bundleId}`}
            >
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  const renderSection = (title: string, bundles: BundleWithStatus[]) => {
    if (bundles.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </ThemedText>
        {bundles.map((item) => (
          <View key={item.bundle.bundleId}>{renderBundleItem({ item })}</View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View
            style={{
              paddingTop: headerHeight + Spacing.lg,
              paddingHorizontal: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            }}
          >
            {lastResult ? (
              <View
                style={[styles.resultBanner, { backgroundColor: colors.success + "20" }]}
              >
                <Feather name="check-circle" size={18} color={colors.success} />
                <ThemedText style={[styles.resultText, { color: colors.success }]}>
                  Added {lastResult.added} words
                  {lastResult.skipped > 0 ? ` (${lastResult.skipped} already existed)` : ""}
                </ThemedText>
              </View>
            ) : null}

            {pendingBundles.length === 0 && appliedBundles.length === 0 && dismissedBundles.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  No Dictionary Packs
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  New vocabulary packs will appear here when available
                </ThemedText>
              </View>
            ) : (
              <>
                {renderSection("Available Packs", pendingBundles)}
                {renderSection("Added to Dictionary", appliedBundles)}
                {renderSection("Dismissed", dismissedBundles)}
              </>
            )}
          </View>
        }
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      />

      <Modal
        visible={previewBundle !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPreviewBundle(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              {previewBundle?.title}
            </ThemedText>
            <Pressable
              onPress={() => setPreviewBundle(null)}
              style={styles.closeButton}
              testID="close-preview-button"
            >
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FlatList
            data={previewBundle?.words ?? []}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + 100 }}
            renderItem={({ item }) => (
              <View
                style={[styles.wordCard, { backgroundColor: colors.backgroundDefault }]}
              >
                <ThemedText style={[styles.wordEnglish, { color: colors.text }]}>
                  {item.english}
                </ThemedText>
                <ThemedText style={[styles.wordMongolian, { color: colors.primary }]}>
                  {item.mongolian}
                </ThemedText>
                <ThemedText style={[styles.wordPronunciation, { color: colors.textSecondary }]}>
                  {item.pronunciation}
                </ThemedText>
              </View>
            )}
          />

          {previewBundle ? (
            <View
              style={[
                styles.modalFooter,
                {
                  backgroundColor: colors.backgroundRoot,
                  paddingBottom: insets.bottom + Spacing.md,
                },
              ]}
            >
              <Pressable
                style={[styles.modalAddButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  handleApply(previewBundle);
                  setPreviewBundle(null);
                }}
                testID="modal-add-button"
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
                <ThemedText style={styles.modalAddButtonText}>
                  Add {previewBundle.words.length} Words to Dictionary
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  bundleCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bundleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bundleInfo: {
    flex: 1,
  },
  bundleTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  bundleWordCount: {
    fontSize: 14,
  },
  bundleDescription: {
    fontSize: 14,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 6,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  dismissButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  resultText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  wordCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  wordEnglish: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  wordMongolian: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  wordPronunciation: {
    fontSize: 14,
    fontStyle: "italic",
  },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalAddButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  modalAddButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
