import { createSettingsStyles } from '@/assets/styles/settings.styles';
import useTheme from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Switch, Text, View } from 'react-native';

const Preferences = () => {
  const [isAutoSync, setisAutoSync] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  
  const { colors, isDarkMode, toggleDarkMode } = useTheme();

  const settingsStyles = createSettingsStyles(colors);

  return (
    <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Preferences</Text>
    
      {/* DARK MODE */}
      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
            <LinearGradient colors={colors.gradients.primary} style={settingsStyles.settingIcon}>
            <Ionicons name="moon" size={18} color="#fff" />
            </LinearGradient>
            <Text style={settingsStyles.settingText}>Dark Mode</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.primary }}
          ios_backgroundColor={colors.border} /* for IOS functionality (line 32) */
        />
      </View>

    {/* NOTFICATIONS */}
    <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
            <LinearGradient colors={colors.gradients.warning} style={settingsStyles.settingIcon}>
            <Ionicons name="notifications" size={18} color="#fff" />
            </LinearGradient>
            <Text style={settingsStyles.settingText}>Notifications</Text>
        </View>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.warning }}
          ios_backgroundColor={colors.border} /* for IOS functionality (see line above) */
        />
      </View>

     {/* AUTO SYNC (cloud syncing support) */}
    <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingLeft}>
            <LinearGradient colors={colors.gradients.success} style={settingsStyles.settingIcon}>
            <Ionicons name="notifications" size={18} color="#fff" />
            </LinearGradient>
            <Text style={settingsStyles.settingText}>{"Auto Sync to Cloud?"}</Text>

        </View>
        <Switch
          value={isAutoSync}
          onValueChange={() => setisAutoSync(!isAutoSync)}
          thumbColor={"#fff"}
          trackColor={{ false: colors.border, true: colors.success }}
          ios_backgroundColor={colors.border} /* for IOS functionality (see line above) */
        />
      </View>

    </LinearGradient>
  );
};

export default Preferences