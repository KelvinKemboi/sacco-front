import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import {styles} from '../../assets/styles/auth.styles.js'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors.js'
import {Image} from 'expo-image'
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"


function isClerkAPIResponseError(err) {
    return err && Array.isArray(err.errors);
  }
  
export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  
  const [username, setUsername] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState()





  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    setError(undefined)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        username,
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
        if (err?.errors?.[0]?.code ==='form_password_incorrect') {
            setError("Wrong Email address or password");
          } else {
            console.error(err);
            setError("Something went wrong");
          }
      }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
        if (err?.errors?.[0]?.code ==='form_password_incorrect') {
            setError("Wrong Email address or password");
          } else {
            console.error(err);
            setError("Something went wrong");
          }
      }
  }
      


  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
       <View style={styles.errorBox}>
        <Ionicons name='alert-circle' size={20} color={COLORS.expense}/>
        <Text style={styles.errorText}>{"Wrong Email address or password"}</Text>
        <TouchableOpacity onPress= {() => setError("")}>
        <Ionicons name='close' size={20} color={COLORS.textlight}/>
        </TouchableOpacity>
       </View>

       ): null}
        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView 
    style={{flex:1}} 
    contentContainerStyle ={{flexGrow: 1}}
    enableOnAndroid = {true}
    enableAutomaticScroll = {true}
    extraScrollHeight = {20}
  >

      <View style={styles.container}> 
      <Image source={require ('../../assets/images/revenue-i2.png')} style={styles.illustration}/>

        <Text style={styles.title}>Create an account</Text>
        {error ? (
       <View style={styles.errorBox}>
        <Ionicons name='alert-circle' size={20} color={COLORS.expense}/>
        <Text style={styles.errorText}>{"Something went wrong"}</Text>
        <TouchableOpacity onPress= {() => setError("")}>
        <Ionicons name='close' size={20} color={COLORS.textlight}/>
        </TouchableOpacity>
       </View>

       ): null}
        
        <TextInput
        style ={[styles.input, error && styles.errorInput]}
        autoCapitalize="none"
        value={username}
        placeholder="Enter username"
        onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style ={[styles.input, error && styles.errorInput]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
          style ={[styles.input, error && styles.errorInput]}
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity onPress={onSignUpPress} style={styles.button}>
          <Text style= {styles.buttonText}>Sign up</Text>

        </TouchableOpacity>
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/sign-in">
            <Text style= {styles.linkText}>Sign in</Text>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}