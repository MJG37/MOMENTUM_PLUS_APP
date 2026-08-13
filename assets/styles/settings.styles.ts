// Contains theme-aware styles shared by settings cards and controls.
import { ColorScheme } from "@/hooks/useTheme";
import { StyleSheet } from "react-native";

export const createSettingsStyles = (colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      paddingBottom: 24,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      letterSpacing: -1,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      gap: 20,
      paddingBottom: 120,
    },
    section: {
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8, // elevation is used to create a shadow on the section, in android
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
      letterSpacing: -0.5,
      color: colors.text,
    },
    sectionTitleDanger: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
      letterSpacing: -0.5,
      color: colors.danger,
    },
    statsContainer: {
      gap: 16,
    },
    statCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 20,
      borderRadius: 16,
      borderLeftWidth: 4,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "800",
      letterSpacing: -1,
      color: colors.text,
    },
    statLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 2,
      color: colors.textMuted,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    settingText: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    actionLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    actionIcon: {
      width: 36,
      height: 36,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    actionText: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },
    actionTextDanger: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.danger,
    },
    pomodoroHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    pomodoroTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
    pomodoroLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800" },
    pomodoroTime: { color: colors.text, fontSize: 50, fontWeight: "900", textAlign: "center", marginVertical: 16, fontVariant: ["tabular-nums"] },
    presetRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    presetButton: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
    presetText: { fontWeight: "800", fontSize: 13 },
    pomodoroActions: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 18 },
    pomodoroStart: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    pomodoroStartText: { color: "#fff", fontWeight: "800" },
    pomodoroReset: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
    pomodoroResetText: { fontWeight: "800" },
    pomodoroHint: { color: colors.textMuted, fontSize: 12, textAlign: "center", lineHeight: 17, marginTop: 14 },
  });

  return styles;
};
