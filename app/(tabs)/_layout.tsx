import { Tabs } from 'expo-router'
import {Ionicons} from "@expo/vector-icons"
import { useTheme } from '@/hooks/useTheme'

// Responsible for bottom tab navigation layout
const TabsLayout = () => {
    const {colors} = useTheme();
    return (
    <Tabs
     screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { 
            backgroundColor: colors.surface, 
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
        },

        tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: "600",
        },
        
        headerShown: false,

     }}
    >
        <Tabs.Screen
            name='index'
            options={{
            title:"Todos",
            tabBarIcon: ({color,size}) => (
                <Ionicons name="flash-outline" size={size} color={color} />
            )
            }}
        />

        <Tabs.Screen
            name='rewards'
            options={{
            title:"Rewards",
            tabBarIcon: ({color,size}) => (
                <Ionicons name="gift" size={size} color={color} />
            )
            }}
        />

        <Tabs.Screen
            name='settings'
            options={{
            title:"Settings",
            tabBarIcon: ({color,size}) => (
                <Ionicons name="settings" size={size} color={color} />
            )
            }}
        />


    </Tabs>
  )
}

export default TabsLayout
