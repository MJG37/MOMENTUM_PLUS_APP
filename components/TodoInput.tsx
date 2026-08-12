import { createHomeStyles } from '@/assets/styles/home.styles';
import { api } from '@/convex/_generated/api';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TodoInput = () => {
  const { colors } = useTheme();
  const homeStyles = createHomeStyles(colors);
  const { username } = useAuth();

  const [newTodo, setNewTodo] = useState("");
  const [minutes, setMinutes] = useState("15");
  const [isCreating, setIsCreating] = useState(false);
  const addTodo = useMutation(api.todos.addTodo);

  const handleAddTodo = async() => {
    if(newTodo.trim()) {
      try {
        const points = Math.max(1, Number.parseInt(minutes, 10) || 1);
        await addTodo({text:newTodo.trim(), points, owner: username ?? ""})
        setNewTodo("") // Repeats loop by adding new task using an empty string
        setMinutes("15");
        setIsCreating(false);
      } catch (error) { // Finds any errors
        console.log("Error adding a todo", error); // adds error to console for debugging purposes
        Alert.alert("Error", "Failed to add todo"); // When error found, message ALERT when there is an error when addTodo has failed
        
      }
    }
  };

  return (
    <View style={homeStyles.inputSection}>
    <View style={homeStyles.inputWrapper}>
      <TextInput
          style={homeStyles.input}
          placeholder="What needs to be done?"
          value={newTodo}
          onChangeText={(value) => {
            setNewTodo(value);
            if (value) setIsCreating(true);
          }}
          onFocus={() => setIsCreating(true)}
          onSubmitEditing={handleAddTodo}
          placeholderTextColor={colors.textMuted}
        />
        <TouchableOpacity onPress={handleAddTodo} activeOpacity={0.8} disabled={!newTodo.trim()}>
          <LinearGradient
            colors={newTodo.trim() ? colors.gradients.primary : colors.gradients.muted}
            style={[homeStyles.addButton, !newTodo.trim() && homeStyles.addButtonDisabled]}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
    </View>
    {isCreating && <View style={homeStyles.durationSection}>
      <Text style={homeStyles.durationPrompt}>How long will this task take?</Text>
      <View style={homeStyles.durationRow}>
        <TextInput
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="number-pad"
          maxLength={3}
          style={homeStyles.durationInput}
          placeholder="Minutes"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={homeStyles.durationUnit}>minutes</Text>
        <View style={homeStyles.durationPoints}><Ionicons name="trophy" size={16} color={colors.success} /><Text style={homeStyles.durationPointsText}>{Math.max(1, Number.parseInt(minutes, 10) || 1)} pts</Text></View>
      </View>
      <Text style={homeStyles.durationHint}>1 minute = 1 point</Text>
    </View>}
    </View>
  );
};

export default TodoInput;
