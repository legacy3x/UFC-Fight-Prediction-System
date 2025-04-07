// Add to FightModel class:
static async getAvailableVersions() {
  const { data } = await supabase
    .from('model_storage')
    .select('version, created_at')
    .order('created_at', { descending: true });

  return data || [];
}

static async loadVersion(version: string) {
  const { data } = await supabase
    .from('model_storage')
    .select('model_json, weights')
    .eq('version', version)
    .single();

  if (!data) throw new Error('Model version not found');
  
  this.model = await tf.models.modelFromJSON(JSON.parse(data.model_json));
  const weightValues = data.weights.map((w: any) => tf.tensor(w.data, w.shape));
  this.model.setWeights(weightValues);
  this.version = version;
}
