import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SearchBarIOS } from "@rneui/base/dist/SearchBar/SearchBar-ios";
import { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { loadAssetsByKeyword } from '@/controllers/keywordManager';

/**
 * React Component that represents a search bar
 * @param assets - Array of images to search through
 * @param onSearchResultsChange - Function to call when search results change to update parent component
 * @returns CustomSearchBar
 */
export const CustomSearchBar: React.FC<CustomSearchProps> = ({ assets, onSearchResultsChange }) => {
    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchAssets = async () => {
            if (searchKeyword) {
                setLoading(true);
                try {
                    const fileURIs = await loadAssetsByKeyword(searchKeyword);
                    const filteredAssets = assets.filter(asset => fileURIs.includes(asset.uri));
                    onSearchResultsChange(filteredAssets, searchKeyword);
                } catch (error) {
                    console.error("Error fetching assets:", error);
                    onSearchResultsChange([], searchKeyword);
                } finally {
                    setLoading(false);
                }
            } else {
                onSearchResultsChange([], searchKeyword);
            }
        };

        // Debounce search input
        const handler = setTimeout(() => {
            fetchAssets();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchKeyword]);

    return (
        <View style={styles.container}>
            <SearchBarIOS
                accessibilityLabel="Search assets"
                searchIcon={<FontAwesome name="search" size={24} color={'gray'} />}
                clearIcon={<></>}
                containerStyle={styles.searchBarContainer}
                inputContainerStyle={styles.inputContainer}
                placeholder="Search"
                onChangeText={setSearchKeyword}
                cancelButtonTitle='Clear'
                value={searchKeyword}
            />
            {loading && <ActivityIndicator size="small" color="gray"/>}
        </View>
    );
};

/**
 * Styles for CustomSearchBar
 */
const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    searchBarContainer: {
        backgroundColor: 'transparent',
        height: 50,
    },
    inputContainer: {
        height: 50,
    },
});
