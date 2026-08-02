import { createSettingsStyles } from '@/assets/styles/settings.styles';
import { api } from '@/convex/_generated/api';
import useTheme from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const DangerZone = () => {

  const { colors } = useTheme();

  // Create the settings styles using the current color scheme
  const settingsStyles = createSettingsStyles(colors);

  // Prepare a Convex mutation function that calls the server-side `clearAllTodos` mutation. Calling `clearAllTodos()` will run the server code to remove all todo documents and return a result object.
  const clearAllTodos = useMutation(api.todos.clearAllTodos);
  const todos = useQuery(api.todos.getTodos);

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
              await clearAllTodos();

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

  return (
    <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
      <Text style={settingsStyles.sectionTitle}>Danger Zone</Text>
      
      {/* Button to call handler function*/}
      <TouchableOpacity
        style={[settingsStyles.actionButton, {borderBottomWidth: 0}]}
        onPress={handleResetApp}
        activeOpacity={0.7}
      >
        <View style={settingsStyles.actionLeft}>
          <LinearGradient colors={colors.gradients.danger} style={settingsStyles.actionIcon}>
            <Ionicons name="trash" size={18} color="#ffffff" />
          </LinearGradient>
          <Text style={settingsStyles.actionTextDanger}>Reset App</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default DangerZone;