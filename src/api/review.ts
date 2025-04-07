import { createClient } from '@supabase/supabase-js';
import { PendingCorrection } from '../types/matchup';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export async function getPendingCorrections(
  limit = 50,
  minConfidence = 0.7
): Promise<PendingCorrection[]> {
  const { data } = await supabase
    .from('pending_corrections')
    .select('*')
    .eq('status', 'pending')
    .gte('confidence_score', minConfidence)
    .order('submitted_at', { ascending: true })
    .limit(limit);
  
  return data || [];
}

export async function approveCorrection(
  id: string,
  userId: string,
  notes?: string
): Promise<void> {
  const { data } = await supabase
    .from('pending_corrections')
    .select('proposed_data')
    .eq('id', id)
    .single();

  if (!data) throw new Error('Correction not found');

  await supabase
    .from('fighters')
    .update(data.proposed_data)
    .eq('name', data.proposed_data.name);

  await supabase
    .from('pending_corrections')
    .update({
      status: 'approved',
      reviewed_by: userId,
      reviewed_at: new Date(),
      notes
    })
    .eq('id', id);
}

export async function rejectCorrection(
  id: string,
  userId: string,
  notes: string
): Promise<void> {
  await supabase
    .from('pending_corrections')
    .update({
      status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date(),
      notes
    })
    .eq('id', id);
}
