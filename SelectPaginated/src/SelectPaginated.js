import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './stylesheet.css';

const SelectPaginated = ({ 

    options            = null,
    isLinearArray      = false ,
    pageSize           = 50,  
    
    api : { 
        resourceUrl   = null, 
        pageParamKey  = "_page", 
        limitParamKey = "_limit", 
    },
    
    onSelect, 
    onRemove ,
    multiSelect        = false,
    searchPlaceholder  = "Search...",
    displayKey         = "name",
    localStorageKey    = "dropdownData"
    
    }) => {

    var [items, setItems]                 = useState([]);
    var [searchTerm, setSearchTerm]       = useState('');
    var [currentPage, setCurrentPage]     = useState(1);
    var [loading, setLoading]             = useState(false);
    var [pagesFetched, setPagesFetched]   = useState(new Set());
    var [isOpen, setIsOpen]               = useState(false);
    var [selectedItems, setSelectedItems] = useState([]);
    var SelectPaginatedRef                = useRef(null);
    var FetchedInitialFlag                = useRef(false);
    var [isEndReached, setIsEndReached]   = useState(false); // Track if end of data is reached
    var [totalPage,setTotalPage]          = useState(Infinity);

    useEffect(() => {
        if (!resourceUrl && !options) {
          alert('select-paginated :: Resource URL or data prop is required');
          return;
        }
        try {
            const locStore = JSON.parse(localStorage.getItem(localStorageKey)) || {};
            if (Object.keys(locStore).length > 0) {
              const allItems = Object.values(locStore).flat();
              setItems(allItems);
              setPagesFetched(new Set(Object.keys(locStore).map(Number)));
              const totalItems = allItems.length;
              const totalPages = Math.ceil(totalItems / pageSize);
              setTotalPage(totalPages);
              
            } 
            else if (!FetchedInitialFlag.current) {
              if (options) {
                  initializeWithData(options);
              } else {
                  fetchPage(1);
              }
              FetchedInitialFlag.current = true;
            }
        } catch (error) {
            console.error('Error fetching items from localStorage:', error);
        } finally {
            setLoading(false);
        }
    }, [resourceUrl, options]);

    
    const CheckIfDataIsAsExpected = (data, isLinearArray) => {
      if (data.length === 0) return true; 
      const isArrayLinear = data.every(item => typeof item !== 'object');
      const isArrayObjects = data.every(item => typeof item === 'object');
      return isLinearArray ? isArrayLinear : isArrayObjects;
  };
  
   const initializeWithData = (data) => {

        if (!CheckIfDataIsAsExpected(data, isLinearArray)) {
          const expectedType = isLinearArray ? 'linear array' : 'array of objects';
          alert(`Provided data format does not match the value of isLinearArray. Expected ${expectedType}.`);
          setIsEndReached(true);
          return;
        }
  

        const paginatedData = {};
        let pageIndex = 1;
        for (let i = 0; i < data.length; i += pageSize) {
            paginatedData[pageIndex] = data.slice(i, i + pageSize);
            pageIndex++;
        }
        const totalPage = Math.ceil(data.length / pageSize);
        setTotalPage(totalPage);
        setItems(data);
        setPagesFetched(new Set(Object.keys(paginatedData).map(Number)));
        localStorage.setItem(localStorageKey, JSON.stringify(paginatedData));
    };

    useEffect(() => {
      if(totalPage!=null){
        if(currentPage == totalPage){
            setIsEndReached(true);        
        }
      }
    }, [currentPage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (SelectPaginatedRef.current && !SelectPaginatedRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [SelectPaginatedRef]);

    const fetchApiCall = async (pageIndex, pageSize) => {

        const url = new URL(resourceUrl);
        url.searchParams.set(pageParamKey, pageIndex);
        url.searchParams.set(limitParamKey, pageSize);
        // const response = await fetch(url.toString(),{credentials: "include"});
        // const data     = await response.json();
        // return data;
        try {
          const response = await fetch(url.toString(),{credentials: "include"});
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Fetch error:", error.message);
          alert(`select-paginated(check devtools) :: ${error.message}`);
          return;
        }
    };

    const fetchPage = async (pageIndex) => {
        setLoading(true);
        try {
            var locStore = {};
            if((localStorage.getItem(localStorageKey))){
                var locStore = JSON.parse(localStorage.getItem(localStorageKey)); 
            }
            if (locStore[pageIndex]) {
                setItems((prevItems) => [...prevItems, ...locStore[pageIndex]]);
                setPagesFetched((prevPages) => new Set([...prevPages, pageIndex]));
            } else {

                const ApiResponseData       = await fetchApiCall(pageIndex, pageSize);
                
                if (!CheckIfDataIsAsExpected(ApiResponseData, isLinearArray)) {
                  const expectedType = isLinearArray ? 'Linear-array' : 'Array of objects';
                  alert(`API response data format does not match the value of Component prop 'isLinearArray'. Expected ${expectedType}.`);
                  setIsEndReached(true);
                  return;
                }
                
                if(ApiResponseData){
                  
                  if (ApiResponseData.length === 0) {
                      setTotalPage(pageIndex-1);
                      setCurrentPage(currentPage--);
                      setIsEndReached(true);
                  } else {
                      var newItems = isLinearArray ? ApiResponseData.filter(item => !items.includes(item)) : ApiResponseData.filter(item => !items.some(existingItem => existingItem[displayKey] === item[displayKey]));
                      console.log(newItems.length);
                      if (newItems.length > 0) {
                          setItems((prevItems) => [...prevItems, ...newItems]);
                          setPagesFetched((prevPages) => new Set([...prevPages, pageIndex]));
                          locStore[pageIndex] = newItems;
                          localStorage.setItem(localStorageKey, JSON.stringify(locStore));
                      }else if(newItems.length < 1){
                          setTotalPage(pageIndex-1);
                          setCurrentPage(currentPage--);
                          setIsEndReached(true);
                      }
                  }
                }else{
                  setTotalPage(pageIndex-1);
                  setCurrentPage(currentPage--);
                  setIsEndReached(true);
                }
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleNextPage = () => {
      const nextPage = currentPage + 1;
      if (options == null && resourceUrl != null ) {
          if (!pagesFetched.has(nextPage) && !isEndReached) {
              fetchPage(nextPage);
          }
      } 
      //else {
          if (nextPage > totalPage) {
              setIsEndReached(true);
          }
      //}
      //console.log(nextPage);
      //console.log(totalPage);
      setCurrentPage(nextPage);
    };

    const handlePrevPage = () => {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        setIsEndReached(false);
    };

    var handleItemClick = (clickedItem) => {
        if (multiSelect) {
            
            setSelectedItems((prevItems) => {
                const isPreviouslySelected = isLinearArray
                    ? prevItems.includes(clickedItem)
                    : prevItems.some(selectedItem => selectedItem[displayKey] === clickedItem[displayKey]);
                const finalItems = isPreviouslySelected
                    ? isLinearArray ? prevItems.filter(selectedItem => selectedItem !== clickedItem)
                        : prevItems.filter(selectedItem => selectedItem[displayKey] !== clickedItem[displayKey])
                    : [...prevItems, clickedItem];
                
                return finalItems;
            });

            const isPreviouslySelected = isLinearArray
            ? selectedItems.includes(clickedItem)
            : selectedItems.some(selectedItem => selectedItem[displayKey] === clickedItem[displayKey]);
            if (isPreviouslySelected && onRemove) {
                onRemove(clickedItem);
            }
            
        } else {
            const finalItems = [clickedItem];
            setSelectedItems(finalItems);
            setIsOpen(false);
        }
    };

    var DeSelectSingleItem = (item) => {
        const newSelectedItems = isLinearArray
            ? selectedItems.filter(i => i !== item)
            : selectedItems.filter(i => i[displayKey] !== item[displayKey]);
        setSelectedItems(newSelectedItems);
        
        if (onRemove) {
            onRemove(item);
        }
    };
    
    var DeSelectAllItem = () => {
        setSelectedItems([]);
        setSearchTerm('');
        if (onSelect) {
            onSelect(null);
        }
    };

    useEffect(() => {
        if (onSelect) {
            onSelect(selectedItems);
        }
    }, [selectedItems, onSelect]);

    const filteredItems = searchTerm ? 
                          items.filter((item) => isLinearArray ? item.toLowerCase().includes(searchTerm.toLowerCase()) : item[displayKey] && item[displayKey].toString().toLowerCase().includes(searchTerm.toLowerCase()))
                        : items;

    var paginatedItems =!searchTerm ? 
                        filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
                        : filteredItems;
    var uniqueKey  = 1;
    var uniqueKey1 = 1;


    var error = null;
    const validateItems = (items) => {
      const result = items.map((item) => {
        if (isLinearArray) {
          if (typeof item === "object") {
            error = ("isLinearArray is true, but item is an object");
            return error; 
          }
          return item;
        } else {
          if (typeof item !== "object") {
            error = ("isLinearArray is false, but item is not an object");
            return error; 
          }
          if (!item.hasOwnProperty(displayKey)) {
            error = (`fetched Item does not have property '${displayKey}'`);
            return error; 
          }
          return item;
        }
      });
      return result;
    };
    const validatedItems = validateItems(paginatedItems);

    // var errorCount = 0;
    // const CountInvalidOptions = (items) => {
    //   items.forEach(item => {
    //     if (isLinearArray) {
    //       if (typeof item === "object") {
    //         errorCount++;
    //       }
    //     } else {
    //       if (typeof item !== "object") {
    //         errorCount++;
    //       }
    //       if (!item.hasOwnProperty(displayKey)) {
    //         errorCount++;
    //       }
    //     }  
    //   });
    // };
    // CountInvalidOptions(items);
   
    var placeholderText = `${searchPlaceholder} (${items.length} options)`;
    
    return (
        
        <div className="dropdown" ref={SelectPaginatedRef}>
           
            <div className="selected-item-list">
                {selectedItems.map(item => (
                    <>
                      <span key={uniqueKey1++} className="selected-item">
                          <button style={{cursor: "pointer" }} onClick={() => DeSelectSingleItem(item)}>&#x2715;</button> &nbsp;
                          {isLinearArray ? item : item[displayKey]}
                      </span> 
                      &nbsp;&nbsp;
                    </>
                ))}
            </div>
            
            
            <div style={{ display: 'flex' }}>
                <input className="searchField" type="text" value={searchTerm}
                  onChange={handleSearch} 
                  placeholder={placeholderText}  
                  onClick={() => setIsOpen(true)}
                />
                <span style={{color: selectedItems.length > 0 ? "red" : '',padding: "8px 0px 0px 0px"}}>[{selectedItems.length}]</span>
                <button className="deselectAllButton" style={{color: selectedItems.length > 0 ? "red" : ''  }} 
                    onClick={DeSelectAllItem} disabled={selectedItems.length === 0}>
                    &#x2715;
                </button>
            </div>

            { isOpen  && (
              <ul className="dropdown-list">
                <div key={uniqueKey++} className="paginationBar">
                    <button className="PrevPageButton" onClick={handlePrevPage} disabled={currentPage === 1}>◀</button>
                    <span> {currentPage}/{pagesFetched.size} </span>
                    {loading && <p style={{ height: "28px", width: "30px" }}>Loading...</p>}
                    <button className='NextPageButton' onClick={handleNextPage} disabled={isEndReached}>◀</button>
                </div>
                { validatedItems && validatedItems.length > 0 && validatedItems.map((item, index) => (
                  item !== null ? 
                  (
                    <li className="listItem" key={uniqueKey++} onClick={() => handleItemClick(validatedItems[index])}
                      style={{ background: selectedItems.includes(validatedItems[index]) ? 'lightgray' : 'white'}} >
                      :: { isLinearArray ?  item : typeof item === "object" ? item[displayKey] : <span style={{color:'red'}}> {item} </span> }
                    </li>
                  ) 
                  : 
                  <> <li  className="listItem"> <strong> error :: Null or  Data format miss-match, Check devtools</strong> </li> </>
                ))}
              </ul>
            )}
            
        </div>

    );
};

SelectPaginated.propTypes = {
    localStorageKey: PropTypes.string,
    onSelect: PropTypes.func,
    onRemove: PropTypes.func,
    multiSelect: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    api: PropTypes.shape({
        resourceUrl: PropTypes.string.isRequired,
        pageParamKey: PropTypes.string,
        limitParamKey: PropTypes.string,
    }).isRequired,
    isLinearArray: PropTypes.bool,
    displayKey: PropTypes.string,
    pageSize: PropTypes.number,
    options: PropTypes.array
};

// SelectPaginated.defaultProps = {
//     callbacks: {},
//     multiSelect: false,
//     searchPlaceholder: 'Search...',
//     localStorageKey : '',
//     api: PropTypes.shape({
//         resourceUrl: '',
//         pageParamKey : '_page',
//         limitParamKey : '_limit',
//         isLinearArray : false,
//         displayKey:'',
//         pageSize: 100,
//     }),
// };

export default SelectPaginated;
