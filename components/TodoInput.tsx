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
  const [points, setPoints] = useState(10);
  const addTodo = useMutation(api.todos.addTodo);

  const handleAddTodo = async() => {
    if(newTodo.trim()) {
      try {
        await addTodo({text:newTodo.trim(), points, owner: username ?? ""})
        setNewTodo("") // Repeats loop by adding new task using an empty string
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
          onChangeText={setNewTodo}
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
    <View style={homeStyles.pointPicker}>
      <Text style={homeStyles.pointPickerLabel}>Points when completed</Text>
      <View style={homeStyles.pointOptions}>
        {[10, 20, 40].map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => setPoints(value)}
            style={[homeStyles.pointOption, points === value && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[homeStyles.pointOptionText, points === value && { color: "#ffffff" }]}>{value} pts</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    </View>
  );
};

export default TodoInput;
