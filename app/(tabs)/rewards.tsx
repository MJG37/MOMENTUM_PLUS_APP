import { createRewardsStyles } from "@/assets/styles/rewards.styles";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Alert, Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REWARDS = [
  { id: "stationery", name: "Stationery Pack", description: "Choose a new pen or notebook.", cost: 40, icon: "create", color: "#f97316" },
  { id: "homework-pass", name: "Homework Pass", description: "Redeem one homework-free evening.", cost: 100, icon: "trophy", color: "#f59e0b" },
  { id: "game-time", name: "Game Time", description: "30 minutes of bonus game time.", cost: 80, icon: "game-controller", color: "#6366f1" },
  { id: "movie", name: "Movie Pick", description: "You choose the next movie night.", cost: 140, icon: "film", color: "#ec4899" },
] as const;

export default function RewardsScreen() {
  const { colors } = useTheme();
  const { username } = useAuth();
  const styles = createRewardsStyles(colors);
  const summary = useQuery(api.rewards.getSummary, { owner: username ?? "" });
  const redeem = useMutation(api.rewards.redeem);
  const [deductedPoints, setDeductedPoints] = useState<number | null>(null);
  const deductionOpacity = useRef(new Animated.Value(0)).current;
  const deductionOffset = useRef(new Animated.Value(0)).current;

  const showDeduction = (cost: number) => {
    setDeductedPoints(cost);
    deductionOpacity.setValue(1);
    deductionOffset.setValue(0);
    Animated.parallel([
      Animated.timing(deductionOpacity, { toValue: 0, duration: 1100, delay: 500, useNativeDriver: true }),
      Animated.timing(deductionOffset, { toValue: -28, duration: 1600, useNativeDriver: true }),
    ]).start(() => setDeductedPoints(null));
  };

  const buyReward = async (reward: (typeof REWARDS)[number]) => {
    try {
      await redeem({ owner: username ?? "", rewardId: reward.id, rewardName: reward.name, cost: reward.cost });
      showDeduction(reward.cost);
      Alert.alert("Reward redeemed!", `${reward.name} is ready for you to enjoy.`);
    } catch {
      Alert.alert("Not enough points", "Complete more tasks before redeeming this reward.");
    }
  };

  return <LinearGradient colors={colors.gradients.background} style={styles.container}>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={colors.gradients.primary} style={styles.headerIcon}><Ionicons name="gift" size={29} color="#fff" /></LinearGradient>
          <View><Text style={styles.title}>Rewards</Text><Text style={styles.subtitle}>Spend points you earn from tasks.</Text></View>
        </View>
        <LinearGradient colors={["#dcfce7", "#bbf7d0"]} style={styles.balanceCard}>
          <View><Text style={styles.balanceLabel}>YOUR AVAILABLE POINTS</Text><Text style={styles.balanceValue}>{summary?.available ?? 0} Points</Text></View>
          <Ionicons name="trophy" size={38} color="#eab308" />
          {deductedPoints !== null && <Animated.Text style={[styles.deductionText, { opacity: deductionOpacity, transform: [{ translateY: deductionOffset }] }]}>−{deductedPoints} pts</Animated.Text>}
        </LinearGradient>
        <Text style={styles.sectionTitle}>Featured Rewards</Text>
        <View style={styles.rewardsGrid}>{REWARDS.map((reward) => <View key={reward.id} style={styles.rewardCard}>
          <View style={[styles.rewardIcon, { backgroundColor: `${reward.color}20` }]}><Ionicons name={reward.icon} size={26} color={reward.color} /></View>
          <Text style={styles.rewardName}>{reward.name}</Text><Text style={styles.rewardDescription}>{reward.description}</Text>
          <View style={styles.rewardFooter}><Text style={styles.cost}>{reward.cost} pts</Text><TouchableOpacity onPress={() => buyReward(reward)}><LinearGradient colors={colors.gradients.primary} style={styles.buyButton}><Text style={styles.buyText}>Buy</Text></LinearGradient></TouchableOpacity></View>
        </View>)}</View>
        <View style={styles.history}><Text style={styles.sectionTitle}>Redeemed Rewards</Text>
          {summary?.redemptions.length ? summary.redemptions.map((item) => <View key={item._id} style={styles.historyCard}><Text style={styles.historyName}>{item.rewardName}</Text><Text style={styles.historyCost}>−{item.cost} pts</Text></View>) : <Text style={styles.emptyHistory}>No rewards redeemed yet.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>;
}
