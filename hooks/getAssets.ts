import { TypeOfContent } from '@/components/ImagesScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { getAllMonths, getAllYears } from '@/functions/imageFilters';
import { Asset } from 'expo-media-library';


export interface MonthList {
  month: string,
  year: number,
  assets: Asset[];
}

export interface YearList {
  year: number,
  assets: Asset[];
}

interface getAssetsProps {
  type: TypeOfContent;
}

const ASSETS_CACHE_KEY = process.env.EXPO_PUBLIC_ASSETS_CACHE_KEY as string;

export const getAssets = (type: TypeOfContent) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [monthAssets, setMonthAssets] = useState<MonthList[]>([]);
  const [yearAssets, setYearAssets] = useState<YearList[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state


  useEffect(() => {
    const fetchCachedAssets = async () => {
      try {
        const cachedAssets = await AsyncStorage.getItem(ASSETS_CACHE_KEY);
        if (cachedAssets) {
          const parsedAssets = JSON.parse(cachedAssets);
          setAssets(parsedAssets); // Set all assets

          if (type == 'month') {
            const months = getAllMonths({ assets: parsedAssets });
            setMonthAssets(months);
          } else if (type == 'year') {
            const years = getAllYears({ assets: parsedAssets });
            setYearAssets(years);
          }
        }
      } catch (err) {
        setError('Failed to load assets'); // Handle error
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchCachedAssets();
  }, [type]);

  return { assets, monthAssets, yearAssets, loading, error };
};
