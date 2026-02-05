import React from "react";
import { StyleSheet, View, Modal, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLocalization } from "@/hooks/useLocalization";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { t } = useLocalization();
  const resolvedConfirmText = confirmText ?? t("common.confirm");
  const resolvedCancelText = cancelText ?? t("common.cancel");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.backgroundDefault }]}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            {title}
          </ThemedText>
          <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </ThemedText>
          <View style={styles.buttons}>
            {resolvedCancelText ? (
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={onCancel}
                testID="confirm-modal-cancel"
              >
                <ThemedText style={[styles.buttonText, { color: colors.text }]}>
                  {resolvedCancelText}
                </ThemedText>
              </Pressable>
            ) : null}
            <Pressable
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: isDestructive ? "#E57373" : colors.primary },
              ]}
              onPress={onConfirm}
              testID="confirm-modal-confirm"
            >
              <ThemedText style={[styles.buttonText, { color: "#FFFFFF" }]}>
                {resolvedConfirmText}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    maxWidth: 320,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {},
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
