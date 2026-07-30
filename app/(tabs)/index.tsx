import { createHomeStyles } from "@/assets/styles/home.styles";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Alert, FlatList, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">

export default function Index() {
  const { colors } = useTheme(); // Get the toggleDarkMode function from the useTheme hook

    const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editText, setEditText] = useState("");

  const homeStyles = createHomeStyles(colors); // Get createHomeStyles function based on the current color scheme

    const todos = useQuery(api.todos.getTodos); // Get the useQuery function to fetch any new todos
    const toggleTodo = useMutation(api.todos.toggleTodo);
    const deleteTodo = useMutation(api.todos.deleteTodo);
    const updateTodo = useMutation(api.todos.updateTodo);

    const isLoading = todos === undefined

    if(isLoading) return <LoadingSpinner />;

    // Responsible for the "check" function when a task is completed
    const handleToggleTodo = async (id:Id<"todos">) => {
      try {
        await toggleTodo({id})
      } catch (error) {
        console.log("Error toggling todo", error);
        Alert.alert("Error", "Failed to toggle todo");
      }
    };

    // Responsible for "delete" todo function
    const handleDeleteTodo = async (id: Id<"todos">) => {
      Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
        { text:"Cancel", style:"cancel" },
        { text: "Delete", style:"destructive", onPress: () => deleteTodo({id}) },
      ]);
    };

    //Responsible for "edit" todo function
    const handleEditTodo = (todo:Todo) => {
      setEditText(todo.text)
      setEditingId(todo._id)
    }
    
    //Responsible for "saving edit(s)" of todo function
    const handleSaveEdit = async () => {
        if (editingId) {
          try {
            await updateTodo({ id: editingId, text: editText.trim() });
            setEditingId(null);
            setEditText("");
          } catch (error) {
            console.log("Error updating todo", error);
            Alert.alert("Error", "Failed to update todo");
          }
        }
    }
    
    //Responsible for "cancelling edit(s)" of todo function
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText("");
    }

    // RETURN STATEMENT: Responsible for the todo "boxes" and buttons
    const renderTodoItem =  ({item}: {item:Todo}) => {
      const isEditing = editingId == item._id;
      return (
        <View style={homeStyles.todoItemWrapper}>
          <LinearGradient colors={colors.gradients.surface}
            style={homeStyles.todoItem}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1}} 
          >
            <TouchableOpacity
            style={homeStyles.checkbox}
            activeOpacity={0.7}
            onPress={() => handleToggleTodo(item._id)}>
              <LinearGradient
                colors={item.isCompleted ? colors.gradients.success : colors.gradients.muted}
                style={[homeStyles.checkboxInner, { borderColor: item.isCompleted ? "transparent" : colors.border},]}>
                {item.isCompleted && <Ionicons name="checkmark" size={18} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>

              {isEditing ? (
                <View style={homeStyles.editContainer}>
                <TextInput
                  style={homeStyles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  autoFocus
                  multiline
                  placeholder="Edit your todo..."
                  placeholderTextColor={colors.textMuted}
                />
                <View style={homeStyles.editButtons}> 
                  <TouchableOpacity onPress={handleSaveEdit} activeOpacity={0.8}>
                    <LinearGradient colors={colors.gradients.success} style={homeStyles.editButton}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={homeStyles.editButtonText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleCancelEdit} activeOpacity={0.8}>
                    <LinearGradient colors={colors.gradients.muted} style= {homeStyles.editButton}>
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={homeStyles.editButtonText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              ) :(
                <View style={homeStyles.todoTextContainer}>
                <Text
                  style={[
                    homeStyles.todoText,
                    item.isCompleted && {
                      textDecorationLine: "line-through",
                      color: colors.textMuted,
                      opacity: 0.6,
                    },
                  ]}
                >
                  {item.text}
                </Text>
                </View>
              )}

                {/* Added conditional rendering here to hide actions while editing */}
                {!isEditing && (
                  <View style={homeStyles.todoActions}>
                    <TouchableOpacity onPress={() => handleEditTodo(item)} activeOpacity={0.8}>
                      <LinearGradient colors={colors.gradients.warning} style={homeStyles.actionButton}>
                        <Ionicons name="pencil" size={14} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTodo(item._id)} activeOpacity={0.8}>
                      <LinearGradient colors={colors.gradients.danger} style={homeStyles.actionButton}>
                        <Ionicons name="trash" size={14} color="#fff" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
                
              </LinearGradient>
          </View>
        );
      };

  return (
    <LinearGradient colors={colors.gradients.background} style={homeStyles.container}>

      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        <Header />

        <TodoInput/>

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent }
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}