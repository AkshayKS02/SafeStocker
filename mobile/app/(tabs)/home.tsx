import { ScrollView } from "react-native";
import FeaturesList from "../../components/FeaturesList";
import HeroCarousel from "../../components/HeroCarousel";
import HowItWorks from "../../components/HowItWorks";

export default function Home() {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <HeroCarousel />
      <HowItWorks />
      <FeaturesList />
    </ScrollView>
  );
}
