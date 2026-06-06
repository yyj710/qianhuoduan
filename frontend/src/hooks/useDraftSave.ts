import { useEffect, useCallback } from 'react';
import { FormInstance, message } from 'antd';

const DRAFT_PREFIX = 'draft_';

export function useDraftSave(key: string, form: FormInstance, enabled: boolean = true) {
  const storageKey = DRAFT_PREFIX + key;

  // Restore draft on mount
  useEffect(() => {
    if (!enabled) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && Object.keys(data).length > 0) {
          form.setFieldsValue(data);
          message.info('已恢复未完成的草稿');
        }
      }
    } catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save on form changes
  const save = useCallback(() => {
    if (!enabled) return;
    try {
      const values = form.getFieldsValue();
      const hasContent = Object.values(values).some(v => v !== undefined && v !== '' && v !== null);
      if (hasContent) {
        localStorage.setItem(storageKey, JSON.stringify(values));
      }
    } catch { /* ignore */ }
  }, [form, storageKey, enabled]);

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return { save, clear };
}
