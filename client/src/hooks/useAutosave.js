import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import api from '../api/axios';

export const useAutosave = (attemptId, socket) => {
  const pendingChanges = useRef({});

  const syncToServer = useCallback(
    debounce(async () => {
      const changes = { ...pendingChanges.current };
      pendingChanges.current = {};

      console.log('📝 Syncing answers to server...', Object.keys(changes).length, 'answers');
      console.log('🔌 Socket status:', socket ? (socket.connected ? 'CONNECTED' : 'DISCONNECTED') : 'NULL');

      for (const [questionId, answerData] of Object.entries(changes)) {
        try {
          if (socket && socket.connected) {
            console.log('✓ Sending via socket:', questionId, answerData);
            socket.emit('autosave_request', {
              attemptId,
              questionId,
              answerData,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log('⚠️ Socket not available, using HTTP fallback:', questionId);
            await api.post(`/attempts/${attemptId}/answers`, {
              questionId,
              answerData,
              timestamp: new Date().toISOString()
            });
            console.log('✓ HTTP save successful:', questionId);
          }
        } catch (err) {
          console.error('❌ Autosave failed:', err);
          pendingChanges.current[questionId] = answerData;
        }
      }
    }, 1000),
    [attemptId, socket]
  );

  const saveAnswer = (questionId, answerData) => {
    console.log('💾 saveAnswer called:', questionId, answerData);

    const storageKey = `attempt_${attemptId}_answers`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
    existing[questionId] = { answerData, timestamp: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(existing));
    console.log('✓ Saved to localStorage');

    pendingChanges.current[questionId] = answerData;
    console.log('✓ Added to pending changes, calling syncToServer...');
    syncToServer();
  };

  return { saveAnswer };
};
