import { createSettingsStyles } from '@/assets/styles/settings.styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const DangerZone = () => {

  const { colors } = useTheme();
  const { logout, username, deleteCurrentAccount } = useAuth();
  const router = useRouter();

  // Create the settings styles using the current color scheme
  const settingsStyles = createSettingsStyles(colors);

  // Prepare a Convex mutation function that calls the server-side `clearAllTodos` mutation. Calling `clearAllTodos()` will run the server code to remove all todo documents and return a result object.
  const clearAllTodos = useMutation(api.todos.clearAllTodos);
  const todos = useQuery(api.todos.getTodos, { owner: username ?? "" });

  // Handler invoked when the user chooses to reset the app.
  // This shows a confirmation Alert with destructive action.
  const handleResetApp = async () => {
    Alert.alert(
      'Reset App',
      // Message clearly communicating the destructive nature of the action
      '⚠️ This will delete ALL your todos permanently. This action cannot be undone.',
      [
        // Cancel button keeps the app unchanged
        { text: 'Cancel', style: 'cancel' },
        {
          // Destructive action: call the mutation and report the result
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Keep a local count of todos before clearing them, since Convex
              // mutations may not preserve returned payloads on the client.
              const deletedCount = todos?.length ?? 0;
              await clearAllTodos({ owner: username ?? "" });

              // Inform the user how many todos were removed. The server
              // is expected to return an object with deletedCount
              Alert.alert(
                'App Reset',
                `Successfully deleted ${deletedCount} todo${deletedCount === 1 ? "" : "s"}. Your app has been reset.`
              );
            } catch (error) {
              // Log error to console for debugging and show a friendly alert
              console.log('Error deleting all todos', error);
              Alert.alert('Error', 'Failed to reset app');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.dismissAll();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your account, tasks, rewards, and points across all devices.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCurrentAccount();
              router.dismissAll();
            } catch {
              Alert.alert("Error", "Your account could not be deleted. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Danger Zone</Text>
      
      {/* Button to call handler function*/}
      <TouchableOpacity
        style={[settingsStyles.actionButton, {borderBottomWidth: 0}]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient colors={colors.gradients.warning} style={settingsStyles.actionIcon}>
            <Ionicons name="log-out-outline" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Log Out</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[settingsStyles.actionButton, { marginTop: 16 }]}
        onPress={handleResetApp}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient colors={colors.gradients.danger} style={settingsStyles.actionIcon}>
            <Ionicons name="warning" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Reset App</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[settingsStyles.actionButton, { marginTop: 16, borderBottomWidth: 0 }]}
        onPress={handleDeleteAccount}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient colors={colors.gradients.danger} style={settingsStyles.actionIcon}>
            <Ionicons name="person-remove" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Delete Account</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default DangerZone;
