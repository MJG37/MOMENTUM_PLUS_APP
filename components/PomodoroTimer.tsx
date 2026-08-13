import { createSettingsStyles } from "@/assets/styles/settings.styles";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

const PRESETS = [{ label: "5 sec", seconds: 5 }, { label: "5m", seconds: 5 * 60 }, { label: "15m", seconds: 15 * 60 }, { label: "25m", seconds: 25 * 60 }, { label: "45m", seconds: 45 * 60 }];
const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const isExpoGo = Constants.appOwnership === "expo";

export default function PomodoroTimer() {
  const { colors } = useTheme();
  const styles = createSettingsStyles(colors);
  const [selectedSeconds, setSelectedSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const completionHandledRef = useRef(false);

  useEffect(() => { if (!isRunning || remainingSeconds === 0) return; const timer = setInterval(() => setRemainingSeconds((seconds) => seconds - 1), 1000); return () => clearInterval(timer); }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds !== 0 || completionHandledRef.current) return;
    completionHandledRef.current = true;
    setIsRunning(false);

    const notify = async () => {
      if (isExpoGo) {
        Alert.alert("Focus session complete!", "Great work — your timer has finished.");
        return;
      }

      try {
        const Notifications = await import("expo-notifications");
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("focus-timer", {
            name: "Focus timer",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
          });
        }

        const permission = await Notifications.getPermissionsAsync();
        if (permission.status !== "granted") {
          const requested = await Notifications.requestPermissionsAsync();
          if (requested.status !== "granted") return;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Focus session complete!",
            body: "Great work — your timer has finished.",
            sound: "default",
          },
          trigger: null,
        });
      } catch {
        // Ignore Android driver and Expo Go environment issues so the timer still completes normally.
      }

      Alert.alert("Focus session complete!", "Great work — your timer has finished.");
    };

    void notify();
  }, [remainingSeconds]);

  const choosePreset = (seconds: number) => {
    completionHandledRef.current = false;
    setIsRunning(false);
    setSelectedSeconds(seconds);
    setRemainingSeconds(seconds);
  };

  const reset = () => {
    completionHandledRef.current = false;
    setIsRunning(false);
    setRemainingSeconds(selectedSeconds);
  };

  return <LinearGradient colors={colors.gradients.surface} style={styles.section}><View style={styles.pomodoroHeading}><View style={styles.settingLeft}><LinearGradient colors={colors.gradients.danger} style={styles.settingIcon}><Ionicons name="timer-outline" size={18} color="#fff" /></LinearGradient><Text style={styles.pomodoroTitle}>Focus timer</Text></View><Text style={styles.pomodoroLabel}>{remainingSeconds === 0 ? "Session complete" : isRunning ? "Focusing" : "Ready"}</Text></View><Text style={styles.pomodoroTime}>{formatTime(remainingSeconds)}</Text><View style={styles.presetRow}>{PRESETS.map((preset) => <TouchableOpacity key={preset.label} onPress={() => choosePreset(preset.seconds)} style={[styles.presetButton, { borderColor: selectedSeconds === preset.seconds ? colors.primary : colors.border, backgroundColor: selectedSeconds === preset.seconds ? `${colors.primary}18` : colors.backgrounds.input }]}><Text style={[styles.presetText, { color: selectedSeconds === preset.seconds ? colors.primary : colors.text }]}>{preset.label}</Text></TouchableOpacity>)}</View><View style={styles.pomodoroActions}><TouchableOpacity disabled={remainingSeconds === 0} onPress={() => setIsRunning((running) => !running)}><LinearGradient colors={colors.gradients.primary} style={[styles.pomodoroStart, remainingSeconds === 0 && { opacity: 0.55 }]}><Ionicons name={isRunning ? "pause" : "play"} size={17} color="#fff" /><Text style={styles.pomodoroStartText}>{isRunning ? "Pause" : "Start"}</Text></LinearGradient></TouchableOpacity><TouchableOpacity onPress={reset} style={[styles.pomodoroReset, { borderColor: colors.border }]}><Ionicons name="refresh" size={17} color={colors.text} /><Text style={[styles.pomodoroResetText, { color: colors.text }]}>Reset</Text></TouchableOpacity></View><Text style={styles.pomodoroHint}>Choose a focus length, or use 5 seconds to test the completion alert.</Text></LinearGradient>;
}
