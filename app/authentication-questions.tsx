import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COUNTRIES = ["New Zealand", "Australia", "Canada", "United Kingdom", "United States", "India", "Japan", "Philippines", "South Korea", "Other"];

export default function AuthenticationQuestionsScreen() {
  const { colors } = useTheme();
  const { username: signedInUsername, saveSecurityAnswers, verifyAndResetPassword, cancelSignup } = useAuth();
  const { mode, username: recoveryUsername } = useLocalSearchParams<{ mode?: string; username?: string }>();
  const router = useRouter();
  const isRecovery = mode === "recover";
  const accountName = isRecovery ? recoveryUsername ?? "" : signedInUsername ?? "";
  const isAdminRecovery = isRecovery && accountName.trim().toLowerCase() === "admin";
  const [birthDate, setBirthDate] = useState(() => new Date(new Date().getFullYear() - 20, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [favouriteColor, setFavouriteColor] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [state, setState] = useState<"form" | "processing" | "success" | "failed">("form");
  const birthday = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`;
  const birthDateLabel = birthDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  const updateBirthDate = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) setBirthDate(date);
  };
  const goBack = async () => {
    if (!isRecovery) await cancelSignup();
    router.replace(isRecovery ? "/login" : "/signup");
  };

  const handleSubmit = async () => {
    if (isAdminRecovery) {
      Alert.alert("Admin account protected", "This is the demo/fallback Admin account and its password cannot be changed.");
      return;
    }
    if (!favouriteColor.trim()) {
      Alert.alert("Missing answer", "Please enter your favourite color.");
      return;
    }
    if (isRecovery && !newPassword.trim()) {
      Alert.alert("New password required", "Enter the new password you would like to use.");
      return;
    }
    if (isRecovery && (newPassword.trim().length < 4 || !/[^A-Za-z0-9]/.test(newPassword))) {
      Alert.alert("Choose a stronger password", "Your password needs at least 4 characters and 1 symbol.");
      return;
    }
    const answers = { birthday, country, favouriteColor };
    if (!isRecovery) {
      await saveSecurityAnswers(answers);
      setState("success");
      return;
    }
    setState("processing");
    setTimeout(async () => {
      const result = await verifyAndResetPassword(accountName, answers, newPassword);
      if (!result.success && result.message) {
        Alert.alert(result.message.includes("Admin") ? "Admin account protected" : "Choose a stronger password", result.message);
        setState("form");
        return;
      }
      setState(result.success ? "success" : "failed");
    }, 1200);
  };

  if (state === "processing") return <StatusPage icon="shield-checkmark" title="Processing Authentication" message="Please wait" colors={colors} loading />;
  if (state === "success") return <StatusPage icon="checkmark" title={isRecovery ? "Authentication Successful!" : "Questions Saved!"} message={isRecovery ? "Your password has been reset successfully." : "Your security questions have been saved successfully."} colors={colors} success onPress={() => router.replace(isRecovery ? "/login" : "/(tabs)")} buttonText={isRecovery ? "Return to Login" : "Continue to App"} secondaryPress={!isRecovery ? () => setState("form") : undefined} />;
  if (state === "failed") return <StatusPage icon="close" title="Authentication Failed" message="Authentication Failed. Please try again." colors={colors} failed onPress={() => setState("form")} buttonText="Try Again" />;

  return <View style={[styles.container, { backgroundColor: colors.bg }]}><StatusBar barStyle={colors.statusBarStyle} /><SafeAreaView style={styles.safeArea}><KeyboardAvoidingView style={styles.safeArea} behavior={Platform.OS === "ios" ? "padding" : "height"}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <TouchableOpacity onPress={goBack} style={styles.back}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
    <View style={[styles.icon, { backgroundColor: "#dbeafe" }]}><Ionicons name={isRecovery ? "lock-closed" : "shield-checkmark"} size={30} color={colors.primary} /></View>
    <Text style={[styles.title, { color: colors.text }]}>{isRecovery ? "Answer Your Security Questions" : "Set Up Your Security Questions"}</Text>
    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{isRecovery ? "Please answer the questions you set up during registration." : "Please think about your answers CAREFULLY as this will be used when you forgot the password to your account!"}</Text>
    <Question label="1) When is your birthday?" colors={colors}><TouchableOpacity accessibilityRole="button" style={[styles.selectionField, { borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} onPress={() => setShowDatePicker(true)}><Ionicons name="calendar-outline" size={21} color={colors.primary} /><Text style={[styles.selectionText, { color: colors.text }]}>{birthDateLabel}</Text><Ionicons name="chevron-down" size={19} color={colors.textMuted} /></TouchableOpacity>{showDatePicker && (Platform.OS === "ios" ? <Modal transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}><View style={styles.pickerBackdrop}><View style={[styles.datePickerCard, { backgroundColor: colors.surface }]}><View style={styles.pickerHeader}><Text style={[styles.pickerTitle, { color: colors.text }]}>Select your birthday</Text><TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={[styles.doneText, { color: colors.primary }]}>Done</Text></TouchableOpacity></View><DateTimePicker value={birthDate} mode="date" display="spinner" maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)} onChange={updateBirthDate} themeVariant={colors.bg === "#0f172a" ? "dark" : "light"} /></View></View></Modal> : <DateTimePicker value={birthDate} mode="date" display="default" maximumDate={new Date()} minimumDate={new Date(1920, 0, 1)} onChange={updateBirthDate} />)}</Question>
    <Question label="2) What country were you born in?" colors={colors}><TouchableOpacity accessibilityRole="button" style={[styles.selectionField, { borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} onPress={() => setShowCountryPicker(true)}><Ionicons name="globe-outline" size={21} color={colors.primary} /><Text style={[styles.selectionText, { color: colors.text }]}>{country}</Text><Ionicons name="chevron-down" size={19} color={colors.textMuted} /></TouchableOpacity></Question>
    <Question label="3) What is your favourite color?" colors={colors}><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} placeholder="Type your favourite color" placeholderTextColor={colors.textMuted} value={favouriteColor} onChangeText={setFavouriteColor} /></Question>
    {isRecovery && <Question label="Choose a new password" colors={colors}><View style={[styles.passwordWrapper, { borderColor: colors.border, backgroundColor: colors.backgrounds.input }]}><TextInput style={[styles.passwordInput, { color: colors.text }]} placeholder="New password" placeholderTextColor={colors.textMuted} secureTextEntry={!showNewPassword} value={newPassword} onChangeText={setNewPassword} editable={!isAdminRecovery} /><TouchableOpacity accessibilityRole="button" accessibilityLabel={showNewPassword ? "Hide password" : "Show password"} onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeButton}><Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textMuted} /></TouchableOpacity></View>{isAdminRecovery && <Text style={[styles.protectedAccountNote, { color: colors.textMuted }]}>The Admin demo account password cannot be changed.</Text>}</Question>}
    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}><Text style={styles.buttonText}>{isRecovery ? "Authenticate" : "Save Changes"}</Text></TouchableOpacity>
  </ScrollView></KeyboardAvoidingView></SafeAreaView><Modal visible={showCountryPicker} transparent animationType="slide" onRequestClose={() => setShowCountryPicker(false)}><View style={styles.pickerBackdrop}><View style={[styles.countrySheet, { backgroundColor: colors.surface }]}><View style={styles.pickerHeader}><Text style={[styles.pickerTitle, { color: colors.text }]}>Country of birth</Text><TouchableOpacity onPress={() => setShowCountryPicker(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View><ScrollView>{COUNTRIES.map((option) => <TouchableOpacity key={option} style={[styles.countryOption, { borderBottomColor: colors.border }]} onPress={() => { setCountry(option); setShowCountryPicker(false); }}><Text style={[styles.countryOptionText, { color: colors.text }]}>{option}</Text>{country === option && <Ionicons name="checkmark" size={21} color={colors.primary} />}</TouchableOpacity>)}</ScrollView></View></View></Modal></View>;
}

function Question({ label, children, colors }: { label: string; children: React.ReactNode; colors: ReturnType<typeof useTheme>["colors"] }) { return <View style={styles.question}><Text style={[styles.questionLabel, { color: colors.text }]}>{label}</Text>{children}</View>; }

function StatusPage({ icon, title, message, colors, loading, success, failed, onPress, buttonText, secondaryPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; message: string; colors: ReturnType<typeof useTheme>["colors"]; loading?: boolean; success?: boolean; failed?: boolean; onPress?: () => void; buttonText?: string; secondaryPress?: () => void }) { const color = success ? colors.success : failed ? colors.danger : colors.primary; return <View style={[styles.container, { backgroundColor: colors.bg }]}><SafeAreaView style={styles.status}><View style={[styles.statusIcon, { backgroundColor: `${color}22` }]}>{loading ? <ActivityIndicator size="large" color={color} /> : <Ionicons name={icon} size={44} color={color} />}</View><Text style={[styles.statusTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.statusMessage, { color: colors.textMuted }]}>{message}</Text>{loading && <Text style={[styles.processingText, { color: colors.textMuted }]}>Processing Authentication. Please wait</Text>}{secondaryPress && <><TouchableOpacity style={[styles.editAnswersButton, { borderColor: colors.primary }]} onPress={secondaryPress}><Text style={[styles.editAnswersText, { color: colors.primary }]}>Edit your answers?</Text></TouchableOpacity><Text style={[styles.orText, { color: colors.textMuted }]}>OR</Text></>}{onPress && <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, alignSelf: "stretch", marginTop: secondaryPress ? 0 : 34 }]} onPress={onPress}><Text style={styles.buttonText}>{buttonText}</Text></TouchableOpacity>}</SafeAreaView></View>; }

const styles = StyleSheet.create({ container: { flex: 1 }, safeArea: { flex: 1 }, content: { padding: 24, paddingBottom: 44 }, back: { width: 42, height: 42, justifyContent: "center" }, icon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 6, marginBottom: 18 }, title: { fontSize: 25, fontWeight: "900", textAlign: "center" }, subtitle: { fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 8, marginBottom: 22 }, question: { marginBottom: 20 }, questionLabel: { fontSize: 14, fontWeight: "800", marginBottom: 8 }, selectionField: { minHeight: 54, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 11 }, selectionText: { fontSize: 15, flex: 1 }, input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15 }, passwordWrapper: { borderWidth: 1, borderRadius: 14, flexDirection: "row", alignItems: "center" }, passwordInput: { flex: 1, paddingLeft: 15, paddingVertical: 14, fontSize: 15 }, eyeButton: { padding: 14 }, protectedAccountNote: { marginTop: 8, fontSize: 13, lineHeight: 18 }, button: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" }, pickerBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.48)" }, datePickerCard: { borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 22, paddingBottom: 30 }, countrySheet: { maxHeight: "70%", borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 22, paddingBottom: 28 }, pickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }, pickerTitle: { fontSize: 18, fontWeight: "900" }, doneText: { fontSize: 16, fontWeight: "800" }, countryOption: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, countryOptionText: { fontSize: 16 }, status: { flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }, statusIcon: { width: 94, height: 94, borderRadius: 47, alignItems: "center", justifyContent: "center", marginBottom: 24 }, statusTitle: { fontSize: 25, fontWeight: "900", textAlign: "center" }, statusMessage: { fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 10 }, processingText: { marginTop: 22, fontSize: 14, fontWeight: "600" }, editAnswersButton: { marginTop: 42, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderRadius: 14, alignSelf: "stretch" }, editAnswersText: { fontSize: 16, fontWeight: "800" }, orText: { marginVertical: 22, fontSize: 12, fontWeight: "900", letterSpacing: 1 } });
