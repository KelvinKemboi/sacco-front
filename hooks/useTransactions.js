import {useState, useCallback} from 'react'
import {Alert} from 'react-native'
import {API_URL} from "../constants/api.js"


export const useTransactions= (userId) =>{
const [transactions, setTransactions] = useState ([]);
const [summary, setSummary] = useState ({
    balance: 0,
    income: 0,
    expenses: 0
});
const [isLoading, setIsLoading] = useState(true);

const fetchTransactions = useCallback (async() =>{
    try{
     const response = await fetch(`${API_URL}/transactions/${userId}`);
     const data = await response.json();
     console.log("Fetched transactions", data)
     setTransactions(data)
    }
    catch (error){
     console.error("Error fetching transactions", error)
    }
}, [userId]);

const fetchSummary = useCallback (async () =>{
    try{
     const response = await fetch(`${API_URL}/transactions/summary/${userId}`);
     const data = await response.json();
     console.log("Fetched summary", data)
     setSummary(data)
    }
    catch (error){
     console.error("Error fetching summary", error)
    }
}, [userId]);

const loadData = useCallback ( async () => {
    if (!userId) return; 

    setIsLoading(true)
    
    try{
          //can be run in parallel
        await Promise.all([fetchTransactions(), fetchSummary()]);
    }
    catch(error){
        console.error("Error loading data", error);
    }
    finally{
        console.log("Success...")
        setIsLoading(false);
    }
}, [fetchTransactions,fetchSummary, userId]);

const deleteTransaction = async (id) =>{
    try{
     const response = await fetch(`${API_URL}/transactions/${id}`, {method: "DELETE"});
     if(!response.ok) throw new Error("Failed to delete transaction");

     //refresh data after deletion
     loadData();
     Alert.alert("Success", "Transaction deleted successfully")
    }
    catch (error){
     console.error("Error deleting Transactions", error);
     Alert.alert("Error", error.message);
    }
};

return {transactions, summary, isLoading, loadData, deleteTransaction};
}; 