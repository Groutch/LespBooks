import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { createUser } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';

const SignUp = () => {

    const { setUser, setIsLoggedIn } = useGlobalContext();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const submit = async () => {
        if (!form.username || !form.email || !form.password) {
            Alert.alert("Attention!", "Veuillez remplir tous les champs !")
        }
        setIsSubmitting(true);

        try {
            const result = await createUser(form.email, form.password, form.username)
            setUser(result)
            setIsLoggedIn(true)
            router.replace('/home')
        } catch (error) {
            Alert.alert('Erreur', error.message)
        } finally {
            setIsSubmitting(false)
        }

    };
    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View className="w-full justify-center min-h-[85vh] px-4 my-6 items-center">
                    <Image
                        source={images.logo}
                        resizeMode='contain'
                        className="w-[115px] h-[35px]"
                    />
                    <Text className="text-2xl text-white mt-10 font-psemibold">S'enregistrer</Text>
                    <FormField
                        title="Nom d'utilisateur"
                        value={form.username}
                        handleChangeText={(e) => setForm({ ...form, username: e })}
                        otherStyles="mt-10"
                    />
                    <FormField
                        title='Email'
                        value={form.email}
                        handleChangeText={(e) => setForm({ ...form, email: e })}
                        otherStyles="mt-7"
                        keyboardType='email-address'
                    />
                    <FormField
                        title='Mot de passe'
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles="mt-7"
                    />
                    <CustomButton
                        title="S'enregistrer"
                        handlePress={submit}
                        containerStyles="mt-7 w-full"
                        isLoading={isSubmitting}
                    />
                    <View className="justify-center pt-5 flex-row gap-2">
                        <Link
                            href='/sign-in'
                            className="text-lg text-secondary font-pregular"
                        >
                            Déjà un compte ?
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp