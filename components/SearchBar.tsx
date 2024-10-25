import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SearchBarIOS } from "@rneui/base/dist/SearchBar/SearchBar-ios";
import { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-media-library';
import { loadAssetsByKeyword } from '@/hooks/loadAssetsByKeyword';

interface CustomSearchProps {
    assets: Asset[];
    onSearchResultsChange: (searchedAssets: Asset[], search: string) => void; // Callback to update the parent component
}

const DB_KEY = process.env.EXPO_PUBLIC_DB_KEY as string;

export const CustomSearchBar: React.FC<CustomSearchProps> = ({ assets, onSearchResultsChange }) => {
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const allAssets = useMemo(() => assets, [assets]);

    useEffect(() => {
        const fetchAssets = async () => {
            if (searchKeyword) {
                setLoading(true);
                try {
                    const fileURIs = await loadAssetsByKeyword(searchKeyword);
                    const filteredAssets = allAssets.filter(asset => fileURIs.includes(asset.uri));
                    onSearchResultsChange(filteredAssets, searchKeyword);
                } catch (error) {
                    console.error("Error fetching assets:", error);
                    onSearchResultsChange([], searchKeyword); // Handle error gracefully
                } finally {
                    setLoading(false);
                }
            } else {
                onSearchResultsChange([], searchKeyword); // Clear when there's no search keyword
            }
        };

        // Debounce search input
        const handler = setTimeout(() => {
            fetchAssets();
        }, 300); // Adjust the debounce time as necessary

        return () => {
            clearTimeout(handler); // Clear timeout on unmount or input change
        };
    }, [searchKeyword]);

    return (
        <View style={styles.container}>
            <SearchBarIOS
                accessibilityLabel="Search assets"
                searchIcon={<FontAwesome name="search" size={24} color={'gray'} />}
                clearIcon={<FontAwesome name='close' size={24} color={'gray'} />}
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainer}
                placeholder="Search"
                onChangeText={setSearchKeyword}
                value={searchKeyword}
            />
            {loading && <ActivityIndicator size="small" color="gray" style={styles.loadingIndicator} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10, // Give some vertical spacing to prevent shaking
    },
    searchBarContainer: {
        backgroundColor: 'transparent',
        height: 50, // Set a fixed height for the search bar container
    },
    inputContainer: {
        height: 50, // Set a fixed height for the input container
    },
    loadingIndicator: {
        marginTop: 10, // Keep the loading indicator aligned
        alignSelf: 'center', // Center the loading indicator
    },
});
