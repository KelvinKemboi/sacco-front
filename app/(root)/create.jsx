import {View, Text, Alert, TouchableOpacity, TextInput, ActivityIndicator} from "react-native"
import {useRouter} from "expo-router"
import {useUser} from '@clerk/clerk-expo';
import {useState} from "react"
import {API_URL} from "../../constants/api.js"
import {styles} from "../../assets/styles/create.styles.js"
import {Ionicons} from "@expo/vector-icons"
import {COLORS} from "../../constants/colors.js"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"

const CATEGORIES =[
    {id:"Food & Drinks", name:"Food & Drinks", icon: "fast-food"},
    {id:"shopping", name:"Shopping", icon: "cart"},
    {id:"transport", name:"Transport", icon: "car"},
    {id:"entertainment", name:"Entertainment", icon: "film"},
    {id:"bills", name:"Bills", icon: "receipt"},
    {id:"income", name:"Income", icon: "cash"},
    {id:"other", name:"Other", icon: "ellipsis-horizontal"},
]

const CreateScreen = () => {

const router = useRouter();
const {user} = useUser();


const [title, setTitle] = useState("");
const [amount, setAmount] = useState("");
const [selectedCategory, setSelectedCategory] = useState("");
const [isExpense, setIsExpense] = useState(true);
const [isLoading, setIsLoading] = useState(false);

const handleCreate= async()=>{
   //validations
   if(!title.trim()) return Alert.alert("Error", "Please Enter Transaction Title!")

   if(!amount || isNaN(parseFloat(amount)) || parseFloat(amount)<=0) 
   {return Alert.alert("Error", "Please Enter a Valid Amount!")}

   if(!selectedCategory) return Alert.alert("Error", "Please Select a Category!")

   setIsLoading(true)
   try{
   //frmatting- (-) for expenses, (+) for income

   const formattedAmount= isExpense
   ? -Math.abs(parseFloat(amount))
   : Math.abs(parseFloat(amount));

   const response = await fetch (`${API_URL}/transactions`, 
   {method: "POST",
   headers: {"Content-Type":"application/json"},
   body: JSON.stringify({
    user_id: user.id,
    title,
    amount: formattedAmount,
    category: selectedCategory
   })
},);

if (!response.ok) {
    const errorData = await response.json();
    console.error("Backend error response:", errorData); // Add this
    throw new Error(errorData.error || "Failed to Create New Transaction");
  }
Alert.alert("Success", "Transaction Created Successfully");
router.back();
   }
   catch(error){
    Alert.alert("Error", error.message || "Failed to Create New Transaction");
    console.error("Error Creating Transaction", error)
   }
   finally{
    setIsLoading(false)
   }

  }

    return(
        <KeyboardAwareScrollView 
        style={styles.container} 
        contentContainerStyle ={{flexGrow: 1}}
        enableOnAndroid = {true}
        enableAutomaticScroll = {true}
        extraScrollHeight = {20}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={()=> router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text}/>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>New Transaction</Text>
            
            <TouchableOpacity 
            style={[styles.saveButtonContainer, isLoading && styles.saveButtonDisabled]}
            onPress={handleCreate}
            disabled={isLoading}
            >
                <Text style={styles.saveButton}>{isLoading ? "Saving...": "Save"}</Text>
                {!isLoading && <Ionicons name="checkmark" size={20} color={COLORS.primary}/>}
            </TouchableOpacity>

          </View>

          <View style={styles.card}>

            {/* Income & expense containers */}
            <View style={styles.typeSelector}>
                {/*Expense conatiner */}

             <TouchableOpacity
             style={[styles.typeButton, isExpense && styles.typeButtonActive]}
             onPress={()=> setIsExpense(true)}
             >
             <Ionicons 
             name="arrow-down-circle" 
             size={22} 
             color={isExpense ? COLORS.white: COLORS.expense}
             style={styles.typeIcon}
             />
             <Text style={[styles.typeButtonText, isExpense && styles.typeButtonTextActive]}>Expense</Text>
             </TouchableOpacity>

              {/*Income conatiner */}

             <TouchableOpacity
             style={[styles.typeButton, !isExpense && styles.typeButtonActive]}
             onPress={()=> setIsExpense(false)}
             >
             <Ionicons 
             name="arrow-up-circle" 
             size={22} 
             color={!isExpense ? COLORS.white: COLORS.income}
             style={styles.typeIcon}
             />
             <Text style={[styles.typeButtonText, !isExpense && styles.typeButtonTextActive]}>Income</Text>
             </TouchableOpacity>
            </View>
            
            {/* Amount container */}
            <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.textLight}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                />
            </View>
            
            {/*Input container */}
            <View style={styles.inputContainer}>
            <Ionicons
            name="create-outline"
            size={22}
            color={COLORS.textLight}
            style={styles.inputIcon}
            />

            <TextInput
                style={styles.input}
                placeholder="Transaction Title"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
                />
            </View>

            <Text style={styles.sectionTitle}>
            <Ionicons name="pricetag-outline" size={16} color={COLORS.text}/> Category
            </Text>

            <View style={styles.categoryGrid}>
                {CATEGORIES.map(category =>(
                    <TouchableOpacity
                    key={category.id}
                    style={[
                    styles.categoryButton,
                    selectedCategory === category.name && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                    >
                        <Ionicons
                        name={category.icon}
                        size={20}
                        color={selectedCategory === category.name ? COLORS.white: COLORS.text}
                        style={styles.categoryIcon}
                        />
                        <Text
                        style={[
                        styles.categoryButtonText,
                        selectedCategory === category.name && styles.categoryButtonTextActive,
                        ]}                        
                        >
                        {category.name}
                        </Text>
                    </TouchableOpacity>

                ))}
            </View>

          </View>

        {isLoading && (
            <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary}/>
            </View>
        )}
        </KeyboardAwareScrollView>
    );
};

export default CreateScreen