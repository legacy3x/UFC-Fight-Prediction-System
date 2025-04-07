import { supabase } from '../api/client';

export async function createAdminUser() {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'info@legacy3x.com',
      password: 'Primavera11d!',
    });

    if (authError) throw authError;

    // Then add admin metadata
    const { error: userError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user?.id,
        email: 'info@legacy3x.com',
        role: 'admin',
        updated_at: new Date().toISOString(),
      });

    if (userError) throw userError;

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run this once to create the admin user
// createAdminUser();
