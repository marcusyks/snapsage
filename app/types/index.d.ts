/**
 * Contains all Typescript interfaces used in the application
 */

declare interface Asset {
    id: string;
    uri: string;
    mediaType?: MediaTypeValue;
    mediaSubtypes?: MediaSubtype[];
    width?: number;
    height?: number;
    creationTime?: number;
    modificationTime?: number;
    duration?: number;
    albumId?: string;
}

declare interface GalleryDisplayProps {
    assets: Asset[] | undefined;
    onImagePress?: () => void;
}

declare type TypeOfContent = 'all' | 'month' | 'year';

declare interface MonthDisplayProps {
    assets: MonthList[] | undefined;
}

declare interface CustomSearchProps {
    assets: Asset[];
    onSearchResultsChange: (searchedAssets: Asset[], search: string) => void; // Callback to update the parent component
}

declare interface MonthList {
    month: string,
    year: number,
    assets: Asset[];
}

declare interface YearList {
    year: number,
    assets: Asset[];
}

interface YearDisplayProps {
    assets: YearList[] | undefined;
}

declare interface getAssetsProps {
    type: TypeOfContent;
}

declare interface Row {
    embeddings: string;
    filepath: string;
    keywords: string;
}

declare interface IndexRow {
    embeddings: string;
    filepath: string;
    hash: string;
}

declare interface KeywordList {
    title: string;
    keywords: string[] | undefined;
}

