import { createRewardsStyles } from "@/assets/styles/rewards.styles";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Alert, Animated, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REWARDS = [
  { id: "stationery", name: "Stationery Pack", description: "Choose a new pen or notebook.", cost: 40, icon: "create", color: "#f97316" },
  { id: "homework-pass", name: "Homework Pass", description: "Redeem one homework-free evening.", cost: 100, icon: "trophy", color: "#f59e0b" },
  { id: "game-time", name: "Game Time", description: "30 minutes of bonus game time.", cost: 80, icon: "game-controller", color: "#6366f1" },
  { id: "movie", name: "Movie Pick", description: "You choose the next movie night.", cost: 140, icon: "film", color: "#ec4899" },
] as const;

type Reward = { id: string; name: string; description: string; cost: number; icon: keyof typeof Ionicons.glyphMap; color: string; isCustom?: boolean };

const formatWorkTime = (points: number) => {
  if (points < 60) return `${points} minute${points === 1 ? "" : "s"}`;
  const hours = Math.floor(points / 60);
  const minutes = points % 60;
  const hoursText = `${hours} hour${hours === 1 ? "" : "s"}`;
  return minutes ? `${hoursText} and ${minutes} minute${minutes === 1 ? "" : "s"}` : hoursText;
};

export default function RewardsScreen() {
  const { colors } = useTheme();
  const { username } = useAuth();
  const styles = createRewardsStyles(colors);
  const summary = useQuery(api.rewards.getSummary, { owner: username ?? "" });
  const customRewards = useQuery(api.rewards.listCustomRewards, { owner: username ?? "" });
  const preferences = useQuery(api.rewards.getPreferences, { owner: username ?? "" });
  const redeem = useMutation(api.rewards.redeem);
  const addCustomReward = useMutation(api.rewards.addCustomReward);
  const updateCustomReward = useMutation(api.rewards.updateCustomReward);
  const deleteCustomReward = useMutation(api.rewards.deleteCustomReward);
  const hideBuiltInReward = useMutation(api.rewards.hideBuiltInReward);
  const restoreBuiltInRewards = useMutation(api.rewards.restoreBuiltInRewards);
  const clearRedemptions = useMutation(api.rewards.clearRedemptions);
  const [deductedPoints, setDeductedPoints] = useState<number | null>(null);
  const [purchasingRewardId, setPurchasingRewardId] = useState<string | null>(null);
  const deductionOpacity = useRef(new Animated.Value(0)).current;
  const deductionOffset = useRef(new Animated.Value(0)).current;
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [isSavingReward, setIsSavingReward] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<Id<"customRewards"> | null>(null);
  const numericRewardCost = Number(rewardCost);
  const hasValidCost = Number.isInteger(numericRewardCost) && numericRewardCost > 0;
  const isHighCost = hasValidCost && numericRewardCost >= 500;
  const workTimeMessage = hasValidCost
    ? isHighCost
      ? `This will take over ${Math.floor(numericRewardCost / 60)} hours of work to earn.`
      : `Equal to about ${formatWorkTime(numericRewardCost)} of task time.`
    : "Enter points to see the task-time equivalent.";

  const showDeduction = (cost: number) => {
    setDeductedPoints(cost);
    deductionOpacity.setValue(1);
    deductionOffset.setValue(0);
    Animated.parallel([
      Animated.timing(deductionOpacity, { toValue: 0, duration: 1100, delay: 500, useNativeDriver: true }),
      Animated.timing(deductionOffset, { toValue: -28, duration: 1600, useNativeDriver: true }),
    ]).start(() => setDeductedPoints(null));
  };

  const buyReward = async (reward: Reward) => {
    if (purchasingRewardId || (summary?.available ?? 0) < reward.cost) {
      Alert.alert("Not enough points", "Complete more tasks before redeeming this reward.");
      return;
    }
    setPurchasingRewardId(reward.id);
    try {
      const result = await redeem({ owner: username ?? "", rewardId: reward.id, rewardName: reward.name, cost: reward.cost });
      if (result.status !== "redeemed") {
        Alert.alert("Not enough points", "Complete more tasks before redeeming this reward.");
        return;
      }
      showDeduction(reward.cost);
      Alert.alert("Reward redeemed!", `${reward.name} is ready for you to enjoy.`);
    } catch {
      Alert.alert("Could not redeem reward", "Please check your connection and try again.");
    } finally {
      setPurchasingRewardId(null);
    }
  };

  const saveCustomReward = async () => {
    const cost = Number(rewardCost);
    if (!rewardName.trim() || !rewardDescription.trim() || !Number.isInteger(cost) || cost < 1) {
      Alert.alert("Check your reward", "Add a name, a short description, and a whole-number point cost.");
      return;
    }
    setIsSavingReward(true);
    try {
      if (editingRewardId) await updateCustomReward({ id: editingRewardId, owner: username ?? "", name: rewardName, description: rewardDescription, cost });
      else await addCustomReward({ owner: username ?? "", name: rewardName, description: rewardDescription, cost });
      setRewardName(""); setRewardDescription(""); setRewardCost(""); setEditingRewardId(null); setIsAddingReward(false);
    } catch {
      Alert.alert("Could not save reward", "Please check your connection and try again.");
    } finally { setIsSavingReward(false); }
  };

  const rewards: Reward[] = [...REWARDS.filter((reward) => !preferences?.hiddenRewardIds.includes(reward.id)), ...(customRewards ?? []).map((reward) => ({ id: reward._id, name: reward.name, description: reward.description, cost: reward.cost, icon: "sparkles" as const, color: "#14b8a6", isCustom: true }))];
  const openEditReward = (reward: NonNullable<typeof customRewards>[number]) => { setEditingRewardId(reward._id); setRewardName(reward.name); setRewardDescription(reward.description); setRewardCost(String(reward.cost)); setIsAddingReward(true); };
  const removeReward = (reward: Reward) => Alert.alert("Delete reward", `Remove ${reward.name}?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => reward.isCustom ? deleteCustomReward({ id: reward.id as Id<"customRewards">, owner: username ?? "" }) : hideBuiltInReward({ owner: username ?? "", rewardId: reward.id }) }]);
  const clearHistory = () => Alert.alert("Clear redeemed rewards?", "This deletes the redeemed-reward history and returns those points to your available balance.", [{ text: "Cancel", style: "cancel" }, { text: "Clear history", style: "destructive", onPress: () => clearRedemptions({ owner: username ?? "" }) }]);

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
        <View style={styles.rewardsHeading}><Text style={styles.sectionTitle}>Rewards</Text><TouchableOpacity style={[styles.addRewardButton, { borderColor: colors.primary }]} onPress={() => { setEditingRewardId(null); setRewardName(""); setRewardDescription(""); setRewardCost(""); setIsAddingReward(true); }}><Ionicons name="add" size={18} color={colors.primary} /><Text style={[styles.addRewardText, { color: colors.primary }]}>Add your own</Text></TouchableOpacity></View>
        <View style={styles.rewardsGrid}>{rewards.map((reward) => <View key={reward.id} style={styles.rewardCard}>
          <View style={[styles.rewardIcon, { backgroundColor: `${reward.color}20` }]}><Ionicons name={reward.icon} size={26} color={reward.color} /></View>
          <Text style={styles.rewardName}>{reward.name}</Text><Text style={styles.rewardDescription}>{reward.description}</Text>
          <View style={styles.rewardManage}>{reward.isCustom && <TouchableOpacity onPress={() => openEditReward((customRewards ?? []).find((item) => item._id === reward.id)!)}><Ionicons name="pencil-outline" size={17} color={colors.textMuted} /></TouchableOpacity>}<TouchableOpacity onPress={() => removeReward(reward)}><Ionicons name="trash-outline" size={17} color={colors.danger} /></TouchableOpacity></View>
          <View style={styles.rewardFooter}><Text style={styles.cost}>{reward.cost} pts</Text><TouchableOpacity disabled={purchasingRewardId !== null || (summary?.available ?? 0) < reward.cost} onPress={() => buyReward(reward)}><LinearGradient colors={purchasingRewardId !== null || (summary?.available ?? 0) < reward.cost ? colors.gradients.muted : colors.gradients.primary} style={styles.buyButton}><Text style={styles.buyText}>{purchasingRewardId === reward.id ? "Buying…" : (summary?.available ?? 0) < reward.cost ? "Need points" : "Buy"}</Text></LinearGradient></TouchableOpacity></View>
        </View>)}</View>
        <View style={styles.history}><View style={styles.historyHeading}><Text style={styles.sectionTitle}>Redeemed Rewards</Text>{summary?.redemptions.length ? <TouchableOpacity style={[styles.clearHistoryButton, { backgroundColor: colors.danger }]} onPress={clearHistory}><Ionicons name="trash-outline" size={16} color="#fff" /><Text style={styles.clearHistoryText}>Clear</Text></TouchableOpacity> : null}</View>
          {preferences?.hiddenRewardIds.length ? <TouchableOpacity onPress={() => restoreBuiltInRewards({ owner: username ?? "" })} style={[styles.restoreButton, { borderColor: colors.primary }]}><Ionicons name="refresh" size={16} color={colors.primary} /><Text style={[styles.restoreText, { color: colors.primary }]}>Restore featured rewards</Text></TouchableOpacity> : null}
          {summary?.redemptions.length ? summary.redemptions.map((item) => <View key={item._id} style={styles.historyCard}><Text style={styles.historyName}>{item.rewardName}</Text><Text style={styles.historyCost}>−{item.cost} pts</Text></View>) : <Text style={styles.emptyHistory}>No rewards redeemed yet.</Text>}
        </View>
      </ScrollView>
      <Modal visible={isAddingReward} transparent animationType="slide" onRequestClose={() => setIsAddingReward(false)}>
        <View style={styles.modalBackdrop}><View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}><View><Text style={[styles.modalTitle, { color: colors.text }]}>{editingRewardId ? "Edit reward" : "Create a reward"}</Text><Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Make something motivating to work toward.</Text></View><TouchableOpacity accessibilityLabel="Close reward form" onPress={() => setIsAddingReward(false)}><Ionicons name="close" size={25} color={colors.text} /></TouchableOpacity></View>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Reward name</Text><TextInput value={rewardName} onChangeText={setRewardName} maxLength={40} placeholder="e.g. Choose dinner" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} />
          <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text><TextInput value={rewardDescription} onChangeText={setRewardDescription} maxLength={90} multiline placeholder="What does this reward include?" placeholderTextColor={colors.textMuted} style={[styles.input, styles.descriptionInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} />
          <Text style={[styles.inputLabel, { color: colors.text }]}>Point cost</Text><TextInput value={rewardCost} onChangeText={setRewardCost} keyboardType="number-pad" maxLength={5} placeholder="e.g. 100" placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgrounds.input }]} />
          <View style={styles.workTimeHelper}><Ionicons name={isHighCost ? "warning-outline" : "bulb-outline"} size={16} color={isHighCost ? colors.warning : colors.textMuted} /><Text style={[styles.workTimeText, { color: isHighCost ? colors.warning : colors.textMuted }]}>{workTimeMessage}</Text></View>
          <View style={styles.quickCostRow}>{[{ label: "15m", points: 15 }, { label: "30m", points: 30 }, { label: "1h", points: 60 }].map((option) => <TouchableOpacity key={option.points} onPress={() => setRewardCost(String(option.points))} style={[styles.quickCostBadge, { backgroundColor: colors.backgrounds.input, borderColor: colors.border }]}><Text style={[styles.quickCostText, { color: colors.text }]}>{option.label} ({option.points} pts)</Text></TouchableOpacity>)}</View>
          <TouchableOpacity disabled={isSavingReward} onPress={saveCustomReward}><LinearGradient colors={colors.gradients.primary} style={styles.saveButton}><Text style={styles.saveButtonText}>{isSavingReward ? "Saving…" : "Save reward"}</Text></LinearGradient></TouchableOpacity>
        </View></View>
      </Modal>
    </SafeAreaView>
  </LinearGradient>;
}
