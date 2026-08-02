import { createSettingsStyles } from '@/assets/styles/settings.styles';
import { api } from '@/convex/_generated/api';
import useTheme from '@/hooks/useTheme';
import { useMutation } from 'convex/react';
import { Alert, Text, View } from 'react-native';

const DangerZone = () => {

  const { colors } = useTheme();

  // Create the settings styles using the current color scheme
  const settingsStyles = createSettingsStyles(colors);

  // Prepare a Convex mutation function that calls the server-side
  // `clearAllTodos` mutation. Calling `clearAllTodos()` will run the
  // server code to remove all todo documents and return a result object.
  const clearAllTodos = useMutation(api.todos.clearAllTodos);

  // Handler invoked when the user chooses to reset the app.
  // This shows a confirmation Alert with destructive action.
  const handleResetApp = async () => {
    // Show a native confirmation dialog to ensure the user wants to proceed
    Alert.alert(
      // Title of the dialog
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
              // Execute server-side mutation to remove all todos
              const result = await clearAllTodos();

              // Inform the user how many todos were removed. The server
              // is expected to return an object with `deletedCount`.
              Alert.alert(
                'App Reset',
                `Successfully deleted ${result.deletedCount} todo${
                  result.deletedCount === 1 ? '' : 's'
                }. Your app has been reset.`
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
    <View>
      {/* Visible label for this section — replace or expand with buttons as needed */}
      <Text>DangerZone</Text>
    </View>
  );
};

export default DangerZone;