// declare module 'select-paginated' {
//     import { ComponentType } from 'react';
//     const SelectPaginated: ComponentType<any>;
//     export default SelectPaginated;
// }

declare module 'SelectPaginated' {
    import * as React from 'react';
    interface ApiConfig {
        resourceUrl: string;
        pageParamKey?: string;
        limitParamKey?: string;
    }
    interface SelectPaginatedProps {
        api: ApiConfig;
        pageSize?: number;
        isLinearArray?: boolean;
        onSelect?: (items: any) => void;
        onRemove?: (items: any) => void;
        multiSelect?: boolean;
        searchPlaceholder?: string;
        displayKey?: string;
        localStorageKey?: string;
        options?: any[] | null;
    }
    const SelectPaginated: React.FC<SelectPaginatedProps>;
    export default SelectPaginated;
}
