import { create } from "zustand";
import { merge } from "ts-deepmerge";
import _ from "lodash";

interface PendingMutation {
  tempId: string;
  type: "update" | "delete" | "reorder";
  variables: any;
  execute: (realId: string) => void;
}

interface MutationQueueStore {
  tempIdMap: Record<string, string | null>; // tempId → realId
  deletedTempIds: Set<string>; // pour edge case suppression
  pendingQueue: PendingMutation[];

  registerTempId: (tempId: string) => void;
  markDeleted: (tempId: string) => void;
  resolveTempId: (tempId: string, realId: string) => void;
  enqueue: (mutation: PendingMutation) => void;
  getRealId: (id: string) => string | null;
  removePendingByTempId: (tempId: string) => void;
}

export const useMutationQueue = create<MutationQueueStore>((set, get) => ({
  tempIdMap: {},
  deletedTempIds: new Set(),
  pendingQueue: [],

  registerTempId: (tempId) =>
    set((state) => ({
      tempIdMap: { ...state.tempIdMap, [tempId]: null },
    })),

  markDeleted: (tempId) =>
    set((state) => {
      // marque tempId comme supprimé
      const newDeleted = new Set(state.deletedTempIds);
      newDeleted.add(tempId);
      return { deletedTempIds: newDeleted };
    }),

  removePendingByTempId: (tempId) =>
    set((state) => ({
      pendingQueue: state.pendingQueue.filter((p) => p.tempId !== tempId),
    })),

  resolveTempId: (tempId, realId) => {
    const { pendingQueue, deletedTempIds } = get();
    console.log("pendingQueue :>> ", pendingQueue);
    if (deletedTempIds.has(tempId)) {
      // tempId supprimé → nettoyer queue ET deletedTempIds
      set((state) => ({
        pendingQueue: state.pendingQueue.filter((p) => p.tempId !== tempId),
        deletedTempIds: new Set(
          [...state.deletedTempIds].filter((id) => id !== tempId)
        ),
      }));
      return;
    }

    // mutations à rejouer
    const toReplay = pendingQueue.filter((p) => p.tempId === tempId);
    console.log("toReplay :>> ", toReplay);
    toReplay.forEach((p) => p.execute(realId));

    set((state) => ({
      tempIdMap: { ...state.tempIdMap, [tempId]: realId },
      pendingQueue: state.pendingQueue.filter((p) => p.tempId !== tempId),
      deletedTempIds: new Set(
        [...state.deletedTempIds].filter((id) => id !== tempId)
      ), // nettoyage
    }));
  },
  enqueue: (mutation) =>
    set((state) => {
      // Copie du tableau pour ne jamais réutiliser la même référence
      const queue = [...state.pendingQueue];

      // On ne merge QUE si le type est identique (évite mélanges update <> reorder)
      const isMergeable =
        mutation.type === "update" || mutation.type === "reorder";

      if (isMergeable) {
        // On cherche une mutation existante pour le même tempId ET même type
        const idx = queue.findIndex(
          (p) => p.tempId === mutation.tempId && p.type === mutation.type
        );

        if (idx !== -1) {
          // Fusion immuable : deepMerge retourne un NOUVEL objet
          const mergedVariables = merge(
            queue[idx].variables,
            mutation.variables
          );

          // Remplacement immuable de l'élément dans le tableau
          const newItem = { ...mutation, variables: mergedVariables };
          const newQueue = _.clone(queue);
          newQueue[idx] = newItem;

          return { ...state, pendingQueue: newQueue };
        }

        // Si aucune existante trouvée -> on pousse la mutation (pas de fusion possible)
        return { ...state, pendingQueue: [...queue, mutation] };
      }

      // Cas non fusionnable (e.g. delete, create) -> ajout simple immuable
      return { ...state, pendingQueue: [...queue, mutation] };
    }),

  getRealId: (id) => get().tempIdMap[id] ?? null,
}));
