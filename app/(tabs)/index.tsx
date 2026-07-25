import { api } from "@/convex/_generated/api";
import useTheme, { ColorScheme } from "@/hooks/useTheme";
import { useMutation, useQuery } from "convex/react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const {toggleDarkMode, colors} = useTheme(); // Get the toggleDarkMode function from the useTheme hook

  const styles = createStyles(colors); // Get createStyles function based on the current color scheme

  return (
    <View style={styles.container}>
      <Text style={styles.content}>Edit app/index.tsx to edit this screen.</Text>
      <Text>hi</Text>
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text>toggle the mode</Text>
      </TouchableOpacity>
    </View>
  );
}

// Function to create dynamic styles based on the current color scheme (light/dark mode)
const createStyles = (colors:ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      backgroundColor:colors.bg,
    },
    content: {
      fontSize: 22,
    },
  });
  return styles;
  };