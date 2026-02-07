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
import { useLocalization } from "@/hooks/useLocalization";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { PACKS, DictionaryPackMeta, getPackWords } from "@/data/packs";
import {
  getAcceptedPacks,
  getDismissedPacks,
  acceptPack,
  dismissPack,
  getWordOverrides,
  getDeletedWordIds,
  upgradePack,
  PackUpgradeMode,
} from "@/lib/storage";
import type { Word } from "@/data/dictionary";
import { formatWordCount } from "@/lib/i18n";

type PackStatus = "pending" | "accepted" | "dismissed" | "upgrade_available";

interface PackWithStatus {
  pack: DictionaryPackMeta;
  status: PackStatus;
  acceptedVersion?: number;
  hasUserChanges?: boolean;
}

export default function DictionaryUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { t, locale } = useLocalization();

  const [packsWithStatus, setPacksWithStatus] = useState<PackWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPack, setPreviewPack] = useState<DictionaryPackMeta | null>(null);
  const [previewWords, setPreviewWords] = useState<Word[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ text: string } | null>(null);

  const loadPacks = useCallback(async () => {
    try {
      const [acceptedPacks, dismissedPacks, overrides, deletedIds] = await Promise.all([
        getAcceptedPacks(),
        getDismissedPacks(),
        getWordOverrides(),
        getDeletedWordIds(),
      ]);

      const withStatus: PackWithStatus[] = PACKS.map((pack) => {
        const accepted = acceptedPacks.find((a) => a.id === pack.id);
        const dismissed = dismissedPacks.find((d) => d.id === pack.id);

        let status: PackStatus = "pending";
        let acceptedVersion: number | undefined;

        if (accepted) {
          acceptedVersion = accepted.version;
          if (accepted.version < pack.version) {
            status = "upgrade_available";
          } else {
            status = "accepted";
          }
        } else if (dismissed && dismissed.version === pack.version) {
          status = "dismissed";
        }

        let hasUserChanges = false;
        if (status === "upgrade_available" && acceptedVersion !== undefined) {
          const ids = getPackWords(pack.id, acceptedVersion).map(w => w.id);
          const overrideIds = new Set(Object.keys(overrides).map(id => parseInt(id, 10)));
          hasUserChanges =
            ids.some(id => overrideIds.has(id)) ||
            ids.some(id => deletedIds.includes(id));
        }

        return { pack, status, acceptedVersion, hasUserChanges };
      });

      setPacksWithStatus(withStatus);
    } catch (error) {
      console.error("Failed to load packs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  const handleAccept = async (pack: DictionaryPackMeta) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplyingId(pack.id);
    try {
      await acceptPack(pack.id, pack.version);
      setLastResult({
        text: t("dictionaryUpdates.resultAdded", {
          packTitle: pack.title,
          wordCount: formatWordCount(locale, pack.wordCount),
        }),
      });
      await loadPacks();
      setTimeout(() => setLastResult(null), 3000);
    } catch (error) {
      console.error("Failed to accept pack:", error);
    } finally {
      setApplyingId(null);
    }
  };

  const handleUpgrade = async (pack: DictionaryPackMeta, mode: PackUpgradeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setApplyingId(pack.id);
    try {
      await upgradePack(pack.id, pack.version, mode);
      setLastResult({
        text: t("dictionaryUpdates.resultUpdated", { packTitle: pack.title }),
      });
      await loadPacks();
      setTimeout(() => setLastResult(null), 3000);
    } catch (error) {
      console.error("Failed to upgrade pack:", error);
    } finally {
      setApplyingId(null);
    }
  };

  const handleDismiss = async (pack: DictionaryPackMeta) => {
    Haptics.selectionAsync();
    try {
      await dismissPack(pack.id, pack.version);
      await loadPacks();
    } catch (error) {
      console.error("Failed to dismiss pack:", error);
    }
  };

  const handlePreview = (pack: DictionaryPackMeta) => {
    Haptics.selectionAsync();
    const words = getPackWords(pack.id, pack.version);
    setPreviewWords(words);
    setPreviewPack(pack);
  };

  const pendingPacks = packsWithStatus.filter((p) => p.status === "pending");
  const upgradePacks = packsWithStatus.filter((p) => p.status === "upgrade_available");
  const acceptedPacks = packsWithStatus.filter((p) => p.status === "accepted");
  const dismissedPacks = packsWithStatus.filter((p) => p.status === "dismissed");
  const previewStatus = previewPack
    ? packsWithStatus.find((p) => p.pack.id === previewPack.id)
    : null;

  const renderPackItem = ({ item }: { item: PackWithStatus }) => {
    const { pack, status, acceptedVersion, hasUserChanges } = item;
    const isApplying = applyingId === pack.id;

    return (
      <View
        style={[styles.packCard, { backgroundColor: colors.backgroundDefault }]}
        testID={`pack-card-${pack.id}`}
      >
        <View style={styles.packHeader}>
          <View style={styles.packInfo}>
            <View style={styles.titleRow}>
              <ThemedText style={[styles.packTitle, { color: colors.text }]}>
                {pack.title}
              </ThemedText>
              <ThemedText style={[styles.versionBadge, { color: colors.textSecondary }]}>
                v{pack.version}
              </ThemedText>
            </View>
            <ThemedText style={[styles.packWordCount, { color: colors.textSecondary }]}>
              {formatWordCount(locale, pack.wordCount)}
            </ThemedText>
          </View>
          {status === "accepted" ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <ThemedText style={[styles.statusText, { color: colors.success }]}>
                {t("dictionaryUpdates.added")}
              </ThemedText>
            </View>
          ) : null}
          {status === "upgrade_available" ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.warning + "20" }]}>
              <Feather name="arrow-up-circle" size={14} color={colors.warning} />
              <ThemedText style={[styles.statusText, { color: colors.warning }]}>
                {t("dictionaryUpdates.updateVersion", { from: acceptedVersion ?? "", to: pack.version })}
              </ThemedText>
            </View>
          ) : null}
          {status === "dismissed" ? (
            <View style={[styles.statusBadge, { backgroundColor: colors.textSecondary + "20" }]}>
              <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
                {t("dictionaryUpdates.dismissed")}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {pack.description ? (
          <ThemedText
            style={[styles.packDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {pack.description}
          </ThemedText>
        ) : null}

        {status === "pending" ? (
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.previewButton, { borderColor: colors.primary }]}
              onPress={() => handlePreview(pack)}
              testID={`preview-button-${pack.id}`}
            >
              <Feather name="eye" size={16} color={colors.primary} />
              <ThemedText style={[styles.previewButtonText, { color: colors.primary }]}>
                {t("dictionaryUpdates.preview")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => handleAccept(pack)}
              disabled={isApplying}
              testID={`add-button-${pack.id}`}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="plus" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.addButtonText}>
                    {t("dictionaryUpdates.add")}
                  </ThemedText>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.dismissButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => handleDismiss(pack)}
              testID={`dismiss-button-${pack.id}`}
            >
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}

        {status === "upgrade_available" && hasUserChanges ? (
          <View style={styles.buttonColumn}>
            <View style={[styles.buttonRow, styles.buttonRowCompact]}>
              <Pressable
                style={[styles.previewButton, { borderColor: colors.primary }]}
                onPress={() => handlePreview(pack)}
                testID={`preview-button-${pack.id}`}
              >
                <Feather name="eye" size={16} color={colors.primary} />
                <ThemedText style={[styles.previewButtonText, { color: colors.primary }]}>
                  {t("dictionaryUpdates.preview")}
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.dismissButton, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => handleDismiss(pack)}
                testID={`dismiss-button-${pack.id}`}
              >
                <Feather name="x" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => handleUpgrade(pack, "new_words")}
                disabled={isApplying}
                testID={`update-new-words-button-${pack.id}`}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.addButtonText}>
                    {t("dictionaryUpdates.newWordsOnly")}
                  </ThemedText>
                )}
              </Pressable>
              <Pressable
                style={[styles.previewButton, { borderColor: colors.primary }]}
                onPress={() => handleUpgrade(pack, "reset")}
                disabled={isApplying}
                testID={`reset-pack-button-${pack.id}`}
              >
                <ThemedText style={[styles.previewButtonText, { color: colors.primary }]}>
                  {t("dictionaryUpdates.resetPack")}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {status === "upgrade_available" && !hasUserChanges ? (
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.previewButton, { borderColor: colors.primary }]}
              onPress={() => handlePreview(pack)}
              testID={`preview-button-${pack.id}`}
            >
              <Feather name="eye" size={16} color={colors.primary} />
              <ThemedText style={[styles.previewButtonText, { color: colors.primary }]}>
                {t("dictionaryUpdates.preview")}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => handleUpgrade(pack, "reset")}
              disabled={isApplying}
              testID={`update-button-${pack.id}`}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="arrow-up" size={16} color="#FFFFFF" />
                  <ThemedText style={styles.addButtonText}>
                    {t("dictionaryUpdates.update")}
                  </ThemedText>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.dismissButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => handleDismiss(pack)}
              testID={`dismiss-button-${pack.id}`}
            >
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  };

  const renderSection = (title: string, packs: PackWithStatus[]) => {
    if (packs.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title}
        </ThemedText>
        {packs.map((item) => (
          <View key={item.pack.id}>{renderPackItem({ item })}</View>
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
                  {lastResult.text}
                </ThemedText>
              </View>
            ) : null}

            {pendingPacks.length === 0 &&
            upgradePacks.length === 0 &&
            acceptedPacks.length === 0 &&
            dismissedPacks.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  {t("dictionaryUpdates.emptyTitle")}
                </ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {t("dictionaryUpdates.emptySubtitle")}
                </ThemedText>
              </View>
            ) : (
              <>
                {renderSection(t("dictionaryUpdates.updatesAvailable"), upgradePacks)}
                {renderSection(t("dictionaryUpdates.availablePacks"), pendingPacks)}
                {renderSection(t("dictionaryUpdates.addedToDictionary"), acceptedPacks)}
                {renderSection(t("dictionaryUpdates.dismissedSection"), dismissedPacks)}
              </>
            )}
          </View>
        }
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      />

      <Modal
        visible={previewPack !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPreviewPack(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.backgroundSecondary }]}>
            <View>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                {previewPack?.title}
              </ThemedText>
              <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {t("dictionaryUpdates.versionLabel", { version: previewPack?.version ?? "" })}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setPreviewPack(null)}
              style={styles.closeButton}
              testID="close-preview-button"
            >
              <Feather name="x" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FlatList
            data={previewWords}
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

          {previewPack ? (
            <View
              style={[
                styles.modalFooter,
                {
                  backgroundColor: colors.backgroundRoot,
                  paddingBottom: insets.bottom + Spacing.md,
                },
              ]}
            >
              {previewStatus?.status === "upgrade_available" && previewStatus.hasUserChanges ? (
                <View style={styles.modalButtonColumn}>
                  <Pressable
                    style={[styles.modalAddButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      handleUpgrade(previewPack, "new_words");
                      setPreviewPack(null);
                    }}
                    testID="modal-update-new-words-button"
                  >
                    <ThemedText style={styles.modalAddButtonText}>
                      {t("dictionaryUpdates.newWordsOnly")}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.modalSecondaryButton, { borderColor: colors.primary }]}
                    onPress={() => {
                      handleUpgrade(previewPack, "reset");
                      setPreviewPack(null);
                    }}
                    testID="modal-reset-pack-button"
                  >
                    <ThemedText style={[styles.modalSecondaryButtonText, { color: colors.primary }]}>
                      {t("dictionaryUpdates.resetPack")}
                    </ThemedText>
                  </Pressable>
                </View>
              ) : previewStatus?.status === "upgrade_available" ? (
                <Pressable
                  style={[styles.modalAddButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    handleUpgrade(previewPack, "reset");
                    setPreviewPack(null);
                  }}
                  testID="modal-update-button"
                >
                  <Feather name="arrow-up" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.modalAddButtonText}>
                    {t("dictionaryUpdates.update")}
                  </ThemedText>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.modalAddButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    handleAccept(previewPack);
                    setPreviewPack(null);
                  }}
                  testID="modal-add-button"
                >
                  <Feather name="plus" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.modalAddButtonText}>
                    {t("dictionaryUpdates.addWordsToDictionary", {
                      wordCount: formatWordCount(locale, previewPack.wordCount),
                    })}
                  </ThemedText>
                </Pressable>
              )}
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
  packCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  packHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  packInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  versionBadge: {
    fontSize: 12,
    fontWeight: "500",
  },
  packWordCount: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  packDescription: {
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
  buttonRowCompact: {
    marginTop: 0,
  },
  buttonColumn: {
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
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
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
  modalButtonColumn: {
    gap: Spacing.sm,
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
  modalSecondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
