import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CATEGORIES } from '../src/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seedDefaultData(userId: string) {
  try {
    // Seed categories
    const categoriesWithUserId = DEFAULT_CATEGORIES.map((cat) => ({
      user_id: userId,
      ...cat,
    }));

    const { error: catError } = await supabase
      .from('categories')
      .insert(categoriesWithUserId);

    if (catError) {
      console.error('Error seeding categories:', catError);
      return false;
    }

    // Seed settings
    const { error: settingsError } = await supabase
      .from('settings')
      .insert({
        user_id: userId,
        currency: 'USD',
        theme: 'light',
        date_format: 'MM/DD/YYYY',
        notifications_enabled: true,
        budget_alert_threshold: 80,
      });

    if (settingsError) {
      console.error('Error seeding settings:', settingsError);
      return false;
    }

    console.log(`✅ Seeded default data for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error during seeding:', error);
    return false;
  }
}

// Export for use in auth trigger
export { seedDefaultData };
