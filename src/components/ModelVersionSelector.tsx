import React, { useEffect, useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import FightModel from '../api/model';

export const ModelVersionSelector = ({ onSelect }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      const versions = await FightModel.getAvailableVersions();
      setVersions(versions);
      setLoading(false);
    };
    loadVersions();
  }, []);

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Model Version</InputLabel>
      <Select
        label="Model Version"
        disabled={loading}
        onChange={(e) => onSelect(e.target.value)}
      >
        {versions.map(v => (
          <MenuItem key={v.version} value={v.version}>
            v{v.version} ({new Date(v.created_at).toLocaleDateString()})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
