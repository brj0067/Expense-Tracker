interface Achievements {
  allergensAvoided: number;
  safePurchases: number;
  monthsSafe: number;
}

export function generateSocialPost(achievements: Achievements): string {
  const templates = [
    `🛡️ Successfully avoided ${achievements.allergensAvoided} allergens this month with AllergyTracker! Managing allergies has never been easier. #AllergyAwareness #SafeLiving`,
    `🎯 ${achievements.safePurchases} allergy-safe purchases and counting! Thanks to AllergyTracker for keeping me on track. #AllergyFree #HealthyLiving`,
    `💪 ${achievements.monthsSafe} months of smart allergy management! AllergyTracker helps me make informed choices every day. #AllergyManagement #Wellness`,
    `🌟 Proud to share: ${achievements.allergensAvoided} allergens avoided this month! AllergyTracker makes safe shopping simple. #AllergySafe #HealthFirst`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

export function shareToTwitter(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://twitter.com/intent/tweet?text=${encoded}`;
}

export function shareToFacebook(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://www.facebook.com/sharer/sharer.php?quote=${encoded}`;
}

export function shareToInstagram(): string {
  // Instagram doesn't support direct text sharing via URL
  // In a real app, this would integrate with Instagram's API
  return "https://instagram.com";
}
