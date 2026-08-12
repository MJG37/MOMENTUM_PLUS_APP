import { createSettingsStyles } from '@/assets/styles/settings.styles';
import { api } from '@/convex/_generated/api';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

const ProgressStats = () => {
    const {colors} = useTheme();
  const settingsStyles = createSettingsStyles(colors);
  const { username } = useAuth();

  const todos= useQuery(api.todos.getTodos, { owner: username ?? "" })
  const totalTodos= todos? todos.length : 0;
  const completedTodos = todos ? todos.filter((todo) => todo.isCompleted).length : 0;
  const activeTodos = totalTodos - completedTodos;
  
  return (
       <LinearGradient colors={colors.gradients.surface} style={settingsStyles.section}>
         <Text style={settingsStyles.sectionTitle}>Progress Stats</Text>

<View style={settingsStyles.statsContainer}>


         {/* TOTAL TODOS*/}  
         <LinearGradient
         colors={colors.gradients.background}
         style={[settingsStyles.statCard, {borderLeftColor: colors.primary}]}
         >
          <View style={[settingsStyles.statsContainer, {flexDirection: 'row', alignItems: 'center'}]}>
            <LinearGradient colors={colors.gradients.primary} style={settingsStyles.statIconContainer}>
                <Ionicons name="list" size={20} color="#fff" />
            </LinearGradient>
           </View>

            <View style={{flexDirection: 'column', marginLeft: 8}}>
              <Text style={settingsStyles.statNumber}>{totalTodos}</Text>
              <Text style={settingsStyles.statLabel}>Total Todos</Text>
            </View>
        </LinearGradient>
         {/* COMPLETED TODOS*/} 
        <LinearGradient
         colors={colors.gradients.background}
         style={[settingsStyles.statCard, {borderLeftColor: colors.success}]}
         >
          <View style={[settingsStyles.statsContainer, {flexDirection: 'row', alignItems: 'center'}]}>
            <LinearGradient colors={colors.gradients.success} style={settingsStyles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </LinearGradient>
           </View>

            <View style={{flexDirection: 'column', marginLeft: 8}}>
              <Text style={settingsStyles.statNumber}>{completedTodos}</Text>
              <Text style={settingsStyles.statLabel}>Completed</Text>
            </View>
        </LinearGradient>
         {/* ACTIVE TODOS*/} 
        <LinearGradient
         colors={colors.gradients.background}
         style={[settingsStyles.statCard, {borderLeftColor: colors.warning}]}
         >
          <View style={[settingsStyles.statsContainer, {flexDirection: 'row', alignItems: 'center'}]}>
            <LinearGradient colors={colors.gradients.warning} style={settingsStyles.statIconContainer}>
                <Ionicons name="time" size={20} color="#fff" />
            </LinearGradient>
           </View>

            <View style={{flexDirection: 'column', marginLeft: 8}}>
              <Text style={settingsStyles.statNumber}>{activeTodos}</Text>
              <Text style={settingsStyles.statLabel}>Active</Text>
            </View>
        </LinearGradient>



      </View>
    </LinearGradient>
  );
};

export default ProgressStats;
