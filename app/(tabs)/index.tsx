import { api } from "@/convex/_generated/api";
import useTheme from "@/hooks/useTheme";
import { useMutation, useQuery } from "convex/react";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const {toggleDarkMode} = useTheme(); // Get the toggleDarkMode function from the useTheme hook

  // Fetch the todos from the database using the getTodos query
  const todos =useQuery(api.todos.getTodos)
   console.log(todos);

  const addTodo = useMutation(api.todos.addTodo); // Get the addTodo mutation from the Convex API
  const clearAllTodos = useMutation(api.todos.clearAllTodos); // Get the clearAllTodos mutation from the Convex API

  return (
    <View style={styles.container}>
      <Text style={styles.content}>Edit app/index.tsx to edit this screen.</Text>
      <Text>hi</Text>
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text>toggle the mode</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => addTodo({ text:"complete maths homework pages 23-25" })}>
        <Text>Add a new todo</Text>
      </TouchableOpacity>
       <TouchableOpacity onPress={() => clearAllTodos()}>
        <Text>Clear all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  content: {
    fontSize: 22,
  }
})