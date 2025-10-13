import { useEffect, useRef, useMemo, useCallback } from "react";
import { FieldValues, Path, UseFormReturn, useWatch } from "react-hook-form";
import { debounce, isEqual } from "lodash";

interface UseAutoSaveFormOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSave: (values: Partial<T>) => void;
  delay?: number;
  names?: Path<T>[]; // Fields to observe (optional)
  skipInitial?: boolean;
  validateBeforeSave?: boolean;
}

export function useAutoSaveForm<T extends FieldValues>({
  form,
  onSave,
  delay = 800,
  names,
  skipInitial = true,
  validateBeforeSave = true,
}: UseAutoSaveFormOptions<T>) {
  // --- Watch values ---
  const rawWatched = useWatch({
    control: form.control,
    ...(names ? { name: names } : {}),
  } as any);

  // --- Stabiliser la structure pour éviter le re-render infini ---
  const watchedValues = useMemo(() => {
    if (!names) return rawWatched;
    if (!Array.isArray(rawWatched)) return rawWatched;
    // Transformer le tableau [val1, val2] => { name1: val1, name2: val2 }
    return names.reduce((acc, name, i) => {
      acc[name] = rawWatched[i];
      return acc;
    }, {} as Record<string, any>);
  }, [rawWatched, names]);

  const prevValuesRef = useRef<any>(watchedValues);
  const isFirstRender = useRef(true);

  // --- Stabiliser onSave ---
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  
  // Stabilize onSave function reference for hot reload
  const stableOnSave = useCallback(
    (vals: any) => onSaveRef.current(vals),
    []
  );

  const debouncedSave = useMemo(
    () =>
      debounce(async (vals: any) => {
        if (skipInitial && isFirstRender.current) {
          isFirstRender.current = false;
          return;
        }

        if (isEqual(prevValuesRef.current, vals)) return; // évite la boucle
        prevValuesRef.current = vals;

        if (validateBeforeSave) {
          const isValid = names
            ? await form.trigger(names)
            : await form.trigger();
          if (!isValid) return;
        }

        const valuesToSave: Partial<T> =
          names && names.length > 0
            ? names.reduce((acc, name) => {
                acc[name] = form.getValues(name);
                return acc;
              }, {} as Partial<T>)
            : form.getValues();

        stableOnSave(valuesToSave);
      }, delay),
    [form, names, delay, skipInitial, validateBeforeSave]
  );

  useEffect(() => {
    debouncedSave(watchedValues);
    return () => debouncedSave.cancel();
  }, [watchedValues, debouncedSave]);
}
