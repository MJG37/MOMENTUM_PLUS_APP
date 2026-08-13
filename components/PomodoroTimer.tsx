import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const PRESETS = [5, 15, 25, 45];
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function PomodoroTimer() {
  const { colors } = useTheme();
  const styles = createSettingsStyles(colors);
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => { if (!isRunning || remainingSeconds === 0) return; const timer = setInterval(() => setRemainingSeconds((seconds) => seconds - 1), 1000); return () => clearInterval(timer); }, [isRunning, remainingSeconds]);
  useEffect(() => { if (remainingSeconds === 0) setIsRunning(false); }, [remainingSeconds]);
  const choosePreset = (minutes: number) => { setIsRunning(false); setSelectedMinutes(minutes); setRemainingSeconds(minutes * 60); };
  const reset = () => { setIsRunning(false); setRemainingSeconds(selectedMinutes * 60); };
  return <LinearGradient colors={colors.gradients.surface} style={styles.section}><View style={styles.pomodoroHeading}><View style={styles.settingLeft}><LinearGradient colors={colors.gradients.danger} style={styles.settingIcon}><Ionicons name="timer-outline" size={18} color="#fff" /></LinearGradient><Text style={styles.pomodoroTitle}>Focus timer</Text></View><Text style={styles.pomodoroLabel}>{remainingSeconds === 0 ? "Session complete" : isRunning ? "Focusing" : "Ready"}</Text></View><Text style={styles.pomodoroTime}>{formatTime(remainingSeconds)}</Text><View style={styles.presetRow}>{PRESETS.map((minutes) => <TouchableOpacity key={minutes} onPress={() => choosePreset(minutes)} style={[styles.presetButton, { borderColor: selectedMinutes === minutes ? colors.primary : colors.border, backgroundColor: selectedMinutes === minutes ? `${colors.primary}18` : colors.backgrounds.input }]}><Text style={[styles.presetText, { color: selectedMinutes === minutes ? colors.primary : colors.text }]}>{minutes}m</Text></TouchableOpacity>)}</View><View style={styles.pomodoroActions}><TouchableOpacity onPress={() => setIsRunning((running) => !running)}><LinearGradient colors={colors.gradients.primary} style={styles.pomodoroStart}><Ionicons name={isRunning ? "pause" : "play"} size={17} color="#fff" /><Text style={styles.pomodoroStartText}>{isRunning ? "Pause" : "Start"}</Text></LinearGradient></TouchableOpacity><TouchableOpacity onPress={reset} style={[styles.pomodoroReset, { borderColor: colors.border }]}><Ionicons name="refresh" size={17} color={colors.text} /><Text style={[styles.pomodoroResetText, { color: colors.text }]}>Reset</Text></TouchableOpacity></View><Text style={styles.pomodoroHint}>Choose a 5–45 minute focus session. The timer stops safely at 00:00.</Text></LinearGradient>;
}
