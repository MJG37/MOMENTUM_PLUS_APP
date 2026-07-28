import { createHomeStyles } from "@/assets/styles/home.styles";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, FlatList, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">

export default function Index() {
  const { toggleDarkMode, colors } = useTheme(); // Get the toggleDarkMode function from the useTheme hook

  const homeStyles = createHomeStyles(colors); // Get createHomeStyles function based on the current color scheme

    const todos = useQuery(api.todos.getTodos); // Get the useQuery function to fetch any new todos
    const toggleTodo = useMutation(api.todos.toggleTodo)

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

    // Responsible for the todo "boxes" and buttons
    const renderTodoItem =  ({item}: {item:Todo}) => {
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
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

