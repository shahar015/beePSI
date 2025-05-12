import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { useSnackbar } from "../context/SnackbarContext";
import { getBeeperModels as apiGetBeeperModels } from "../services/api";
import {
  beeperModelsAtom,
  shopErrorAtom,
  shopLoadingAtom,
} from "../store/atoms";

export const useBeeperShop = () => {
  const [beeperModels, setBeeperModels] = useAtom(beeperModelsAtom);
  const [isLoading, setIsLoading] = useAtom(shopLoadingAtom);
  const [error, setError] = useAtom(shopErrorAtom);
  const { openSnackbar } = useSnackbar();

  const fetchBeeperModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const models = await apiGetBeeperModels();
      setBeeperModels(models || []);
    } catch (err) {
      const apiError = err as Error;
      const errorMessage = apiError.message || "Failed to load beeper models.";
      setError(errorMessage);
      openSnackbar(errorMessage, "error");
      setBeeperModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [setBeeperModels, setIsLoading, setError, openSnackbar]);

  useEffect(() => {
    if (beeperModels.length === 0 && !isLoading && !error) {
      fetchBeeperModels();
    }
  }, [fetchBeeperModels, beeperModels.length, isLoading, error]);

  return {
    beeperModels,
    isLoading,
    error,
    refreshBeeperModels: fetchBeeperModels,
  };
};
