# SelectPaginated : Handle Millions of Options Quickly and Efficiently

`SelectPaginated` is a React component that provides a dropdown with features like pagination, search, and both single and multi-select options. It can source data from both the client-side and an API. By fetching data in small chunks and using local storage to remember the fetched data, it efficiently handles large datasets. This approach keeps the dropdown fast and responsive, ensuring a smooth user experience.

## Usage
Import SelectPaginated in your React application and use it as follows:
```
import React from 'react'
import SelectPaginated from 'select-paginated';

function Test() {
    const options = [
        { id: 1, name: 'Option 1', description: 'This is the first option' },
        { id: 2, name: 'Option 2', description: 'This is the second option' }
    ];
   
  return (
    <>
        <SelectPaginated 
            // Provide `options` prop when `api` prop is not being used
            options={options} 

            // Provide `api` prop when `options` prop is not being used
            api={{
                resourceUrl: "https://jsonplaceholder.typicode.com/comments",
                pageParamKey: "_page", 
                limitParamKey: "_limit",
                // Final endpoint: "https://jsonplaceholder.typicode.com/comments?_page=1&_limit=50"
            }}
            displayKey="name"
            pageSize={50}
            isLinearArray={false}
            onSelect={(selectedItems) => {
                console.log('selected items :: ', JSON.stringify(selectedItems));
            }}
            onRemove={(removedItem) => {
                console.log('Removed items :: ', JSON.stringify(removedItem));
            }}
            multiSelect={true}
            searchPlaceholder="Search..."
            localStorageKey="SelectFetchedData"
        />
    </>
  )
}

export default Test
```

## Props

### `options`(array,required when `api` prop is not provided )
+ Description: An array of pre-defined options to be used instead of fetching data from an API.<br/>
  This can be particularly useful for small dataset, static datasets or for data that is already available on the client side.
+   Example : 
    -   Simple linear array - [ "Item 1", "Item 2",  "Item 3", // ...more items],
    -   Array of objects - [ { id: 1, name: "Item 1" },  { id: 2, name: "Item 2" }, // ...more items ]

###   `pageSize`(number,default:50) :
+   The number of items to show and fetch(in-case of fetching data) per page.


###   `isLinearArray`(boolean,default:false) : 
- Set {true} when :
    - The fetched data or value of `options` prop is a simple linear array of primitive values (e.g., strings, numbers).
    - No `displayKey` is needed.
    - Example: ["item1", "item2", "item3"]
- Set {false} when:
    - The fetched data or value of `options` prop is an array of objects.
    - A `displayKey` must be specified to indicate which property to display.
    - Example:
    ```json
    [
        {"name": "id labore ex et quam laborum","email": "Eliseo@gardner.biz",},
        {"name": "quo vero reiciendis velit similique earum","email": "Jayne_Kuhic@sydney.com"},
    ]
    ```
- In this case, set `displayKey` to the property you want to display, e.g., "email".

### `displayKey`(string,default:'name',required only when `isLinearArray` is false) :
+   Description : Specifies the property of the objects in the array to be displayed.
    For instance, consider the following response from an API:
    ```json
    [
        {"name": "id labore ex et quam laborum","email": "Eliseo@gardner.biz",},
        {"name": "quo vero reiciendis velit similique earum","email": "Jayne_Kuhic@sydney.com"},
    ]
    ```
   - To display the "email" field, set `displayKey` to "email".


### `api`(object,required when `options` prop is not provided) :

- Properties : 
    -   **resourceUrl** (string, required):
        - The URL from which data will be fetched.

    -   **pageParamKey** (string, optional, default: "_page") :
        - This is the query parameter key used by your backend API to specify the page number. It should match what your backend expects for pagination. 
            <br/>Common defaults include "page", "pageNumber", "p".
        - Example : If pageParamKey is set to "page", the API request URL might include ?page=1, ?page=2, etc.

    -   **limitParamKey** (string, optional, default: "_limit") :
        - This is the query parameter key used by your backend API to specify the number of items per page. Similar to pageParamKey, 
            <br/>it should align with your backend's pagination configuration. Common defaults include "limit", "pageSize", "size".
        - Example: If limitParamKey is set to "size", the API request URL might include ?size=10, ?size=20, etc.

### `onSelect` (function, optional) :
+   A callback function invoked when items are selected.


### `onRemove` (function, optional) :
+   A callback function invoked when items are removed.


### `multiSelect` (boolean, optional, default: true) :
+   Enables or disables multi-selection mode.


### `searchPlaceholder` (string, optional, default: "Search...") :
+   Placeholder text for the search input field.


### `localStorageKey` (string, optional, default: "SelectFetchedData") :
+ The unique key used to store data in local storage for persistence.



