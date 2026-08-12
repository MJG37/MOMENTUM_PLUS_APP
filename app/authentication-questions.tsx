import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COUNTRIES = ["New Zealand", "Australia", "Canada", "United Kingdom", "United States", "India", "Japan", "Philippines", "South Korea", "Other"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const YEARS = Array.from({ length: 100 }, (_, index) => String(new Date().getFullYear() - 5 - index));

export default function AuthenticationQuestionsScreen() {
  const { colors } = useTheme();
  const { username: signedInUsername, saveSecurityAnswers, verifyAndResetPassword } = useAuth();
  const { mode, username: recoveryUsername } = useLocalSearchParams<{ mode?: string; username?: string }>();
  const router = useRouter();
  const isRecovery = mode === "recover";
  const accountName = isRecovery ? recoveryUsername ?? "" : signedInUsername ?? "";
  const [month, setMonth] = useState("January");
  const [day, setDay] = useState("1");
  const [year, setYear] = useState(YEARS[15]);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [favouriteColor, setFavouriteColor] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [state, setState] = useState<"form" | "processing" | "success" | "failed">("form");
  const birthday = `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!favouriteColor.trim()) {
      Alert.alert("Missing answer", "Please enter your favourite color.");
      return;
    }
    if (isRecovery && !newPassword.trim()) {
      Alert.alert("New password required", "Enter the new password you would like to use.");
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
      setState(result.success ? "success" : "failed");
    }, 1200);
  };

  if (state === "processing") return <StatusPage icon="shield-checkmark" title="Processing Authentication" message="Please wait" colors={colors} loading />;
  if (state === "success") return <StatusPage icon="checkmark" title={isRecovery ? "Authentication Successful!" : "Questions Saved!"} message={isRecovery ? "Your password has been reset successfully." : "Your security questions have been saved successfully."} colors={colors} success onPress={() => router.replace(isRecovery ? "/login" : "/(tabs)")} buttonText={isRecovery ? "Return to Login" : "Continue to App"} />;
  if (state === "failed") return <StatusPage icon="close" title="Authentication Failed" message="Authentication Failed. Please try again." colors={colors} failed onPress={() => setState("form")} buttonText="Try Again" />;

  return <View style={[styles.container, { backgroundColor: colors.bg }]}><StatusBar barStyle={colors.statusBarStyle} /><SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <TouchableOpacity onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
    <View style={[styles.icon, { backgroundColor: "#dbeafe" }]}><Ionicons name={isRecovery ? "lock-closed" : "shield-checkmark"} size={30} color={colors.primary} /></View>
    <Text style={[styles.title, { color: colors.text }]}>{isRecovery ? "Answer Your Security Questions" : "Set Up Your Security Questions"}</Text>
    <Text style={[styles.subtitle, { color: colors.textMuted }]}>{isRecovery ? "Please answer the questions you set up during registration." : "Please think about your answers CAREFULLY:"}</Text>
    <Question label="1) When is your birthday?" colors={colors}><View style={styles.wheels}><Picker style={[styles.wheel, { color: colors.text }]} selectedValue={month} onValueChange={setMonth}>{MONTHS.map(value => <Picker.Item key={value} label={value} value={value} />)}</Picker><Picker style={[styles.smallWheel, { color: colors.text }]} selectedValue={day} onValueChange={setDay}>{DAYS.map(value => <Picker.Item key={value} label={value} value={value} />)}</Picker><Picker style={[styles.smallWheel, { color: colors.text }]} selectedValue={year} onValueChange={setYear}>{YEARS.map(value => <Picker.Item key={value} label={value} value={value} />)}</Picker></View></Question>
    <Question label="2) What country were you born in?" colors={colors}><Picker style={[styles.countryPicker, { color: colors.text, backgroundColor: colors.backgrounds.input }]} selectedValue={country} onValueChange={setCountry}>{COUNTRIES.map(value => <Picker.Item key={value} label={value} value={value} />)}</Picker></Question>
    <Question label="3) What is your favourite color?" colors={colors}><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} placeholder="Type your favourite color" placeholderTextColor={colors.textMuted} value={favouriteColor} onChangeText={setFavouriteColor} /></Question>
    {isRecovery && <Question label="Choose a new password" colors={colors}><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} placeholder="New password" placeholderTextColor={colors.textMuted} secureTextEntry value={newPassword} onChangeText={setNewPassword} /></Question>}
    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}><Text style={styles.buttonText}>{isRecovery ? "Authenticate" : "Save Changes"}</Text></TouchableOpacity>
  </ScrollView></SafeAreaView></View>;
}

function Question({ label, children, colors }: { label: string; children: React.ReactNode; colors: ReturnType<typeof useTheme>["colors"] }) { return <View style={styles.question}><Text style={[styles.questionLabel, { color: colors.text }]}>{label}</Text>{children}</View>; }

function StatusPage({ icon, title, message, colors, loading, success, failed, onPress, buttonText }: { icon: keyof typeof Ionicons.glyphMap; title: string; message: string; colors: ReturnType<typeof useTheme>["colors"]; loading?: boolean; success?: boolean; failed?: boolean; onPress?: () => void; buttonText?: string }) { const color = success ? colors.success : failed ? colors.danger : colors.primary; return <View style={[styles.container, { backgroundColor: colors.bg }]}><SafeAreaView style={styles.status}><View style={[styles.statusIcon, { backgroundColor: `${color}22` }]}>{loading ? <ActivityIndicator size="large" color={color} /> : <Ionicons name={icon} size={44} color={color} />}</View><Text style={[styles.statusTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.statusMessage, { color: colors.textMuted }]}>{message}</Text>{loading && <Text style={[styles.processingText, { color: colors.textMuted }]}>Processing Authentication. Please wait</Text>}{onPress && <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, alignSelf: "stretch", marginTop: 34 }]} onPress={onPress}><Text style={styles.buttonText}>{buttonText}</Text></TouchableOpacity>}</SafeAreaView></View>; }

const styles = StyleSheet.create({ container: { flex: 1 }, safeArea: { flex: 1 }, content: { padding: 24, paddingBottom: 44 }, back: { width: 42, height: 42, justifyContent: "center" }, icon: { width: 62, height: 62, borderRadius: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 6, marginBottom: 18 }, title: { fontSize: 25, fontWeight: "900", textAlign: "center" }, subtitle: { fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 8, marginBottom: 22 }, question: { marginBottom: 20 }, questionLabel: { fontSize: 14, fontWeight: "800", marginBottom: 8 }, wheels: { height: 135, flexDirection: "row", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 14, overflow: "hidden" }, wheel: { flex: 1.6 }, smallWheel: { flex: 0.8 }, countryPicker: { height: 135, borderRadius: 14 }, input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15 }, button: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" }, status: { flex: 1, padding: 32, alignItems: "center", justifyContent: "center" }, statusIcon: { width: 94, height: 94, borderRadius: 47, alignItems: "center", justifyContent: "center", marginBottom: 24 }, statusTitle: { fontSize: 25, fontWeight: "900", textAlign: "center" }, statusMessage: { fontSize: 15, textAlign: "center", lineHeight: 22, marginTop: 10 }, processingText: { marginTop: 22, fontSize: 14, fontWeight: "600" } });
