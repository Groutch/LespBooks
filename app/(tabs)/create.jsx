import { CameraView, useCameraPermissions } from 'expo-camera'
import { View, Text, Button, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { icons } from '../../constants'
import { router } from 'expo-router'
import { createBook } from '../../lib/appwrite'
import { loadBook } from '../../lib/fetchGoogleBooks'
import { useGlobalContext } from '../../context/GlobalProvider'
import * as ImagePicker from 'expo-image-picker'

const Create = () => {
  const { user } = useGlobalContext();
  const [scanned, setScanned] = useState(true);
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    author: '',
    thumbnail: null,
    description: '',
    isbn: '',
    genre: '',
  })
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    // Camera pas permission
    return (
      <SafeAreaView className='bg-primary h-full'>
        <Text className='text-white'>Nous avons besoin de votre permission pour utiliser la caméra</Text>
        <Button onPress={requestPermission} title="Accorder permission" />
      </SafeAreaView >
    );
  }

  const scanHandler = ({ type, data: dataBarCode }) => {
    loadBook(dataBarCode).then((data) => {
      data[0] = data
      let i;
      let bookGoogle = { id: '', title: '', isbn_13: '', cover: '', authors: '', 'description': '', publisher: '', date: 0, numberOfPages: 0, 'id_worldcat': '', 'id_google': '' };
      let nb_livres = data[0].totalItems;
      let authors = '';
      let j = 0;
      let isbn_13 = 0;
      if (nb_livres > 0 && nb_livres < 100) {
        for (i = 0; i < nb_livres; i += 1) {
          let bookIdentifiers = data[0]['items'][i]['volumeInfo']['industryIdentifiers'] ?? [];
          let found = false;
          bookIdentifiers.forEach(bookIdentifier => {
            if (bookIdentifier["identifier"].indexOf(dataBarCode) != -1) {
              found = true
            }
          });

          //couverture
          if (data[0]['items'][i] && found) {
            if (data[0]['items'][i]['volumeInfo']['imageLinks']) {
              if (data[0]['items'][i]['volumeInfo']['imageLinks']['smallThumbnail']) {
                bookGoogle.cover = data[0]['items'][i]['volumeInfo']['imageLinks']['smallThumbnail'];
              }
            }
            //Titre
            if (data[0]['items'][i]['volumeInfo']['title']) {
              bookGoogle.title = data[0]['items'][i]['volumeInfo']['title'];
            }
            if (data[0]['items'][i]['volumeInfo']['subtitle']) {
              bookGoogle.title += ' ' + data[0]['items'][i]['volumeInfo']['subtitle'];
            }
            //Auteurs
            if (data[0]['items'][i]['volumeInfo']['authors']) {

              for (j = 0; j < data[0]['items'][i]['volumeInfo']['authors'].length; j += 1) {
                authors += data[0]['items'][i]['volumeInfo']['authors'][j] + ', ';
              }
              authors = authors.slice(0, -2);
              bookGoogle.authors = authors;
            }
            //Description
            if (data[0]['items'][i]['volumeInfo']['description']) {
              bookGoogle['description'] = data[0]['items'][i]['volumeInfo']['description'];
            }
            //éditeur
            if (data[0]['items'][i]['volumeInfo']['publisher']) {
              bookGoogle.publisher = data[0]['items'][i]['volumeInfo']['publisher'];
            }
            //date de parution
            if (data[0]['items'][i]['volumeInfo']['publishedDate']) {
              bookGoogle.date = data[0]['items'][i]['volumeInfo']['publishedDate'];
            }
            //nb de pages
            if (data[0]['items'][i]['volumeInfo']['pageCount']) {
              bookGoogle.numberOfPages = data[0]['items'][i]['volumeInfo']['pageCount'];
            }
            //ISBN
            if (data[0]['items'][i]['volumeInfo']['industryIdentifiers']) {
              for (j = 0; j < data[0]['items'][i]['volumeInfo']['industryIdentifiers'].length; j += 1) {
                if (data[0]['items'][i]['volumeInfo']['industryIdentifiers'][j]["type"] === 'ISBN_13') {
                  isbn_13 = data[0]['items'][i]['volumeInfo']['industryIdentifiers'][j]['identifier'];
                }
              }
              if (isbn_13 !== 0) {
                bookGoogle.isbn_13 = isbn_13;
              }
            }
          }
        }
      }
      // compilation resultat : 
      setForm({
        title: bookGoogle.title,
        author: bookGoogle.authors,
        thumbnail: (
          bookGoogle.cover !== ''
            ? {
              fileName: dataBarCode + '.jpeg',
              mimeType: 'image/jpeg',
              fileSize: 2000000,
              uri: bookGoogle.cover
            }
            : null
        ),
        description: bookGoogle.description,
        isbn: bookGoogle.isbn_13,
        genre: '',
      })
    });
    setScanned(true);

  }

  const openPicker = async (selectType) => {
    const result = await ImagePicker.launchImageLibraryAsync(
      {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      }
    )
    // TODO : voir si on peut avoir la galerie ET la camera en meme temps

    // const result = await ImagePicker.launchCameraAsync(
    //   {
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     quality: 1
    //   }
    // )
    if (selectType === "image" && !result.canceled) {
      setForm({ ...form, thumbnail: result.assets[0] })
    }
  }

  const submit = async () => {
    if (!form.title || !form.author || !form.description) {
      return Alert.alert('Veuillez remplir au moins le titre, l\'auteur et la description du livre');
    }
    setLoading(true)

    try {
      await createBook({
        ...form, userId: user.$id
      });
      Alert.alert('Succes', 'Livre uploadé avec succés')
      router.push('/home')
    } catch (error) {
      Alert.alert("Erreur", error.message)
    } finally {
      setForm({
        title: '',
        author: '',
        thumbnail: null,
        description: '',
        isbn: '',
        genre: '',
      });
      setLoading(false);
    }
  };

  return (scanned ?
    <SafeAreaView className='bg-primary h-full'>

      <ScrollView className="px-4 my-6">
        <Text className='text-2xl text-white font-psemibold'>
          Enregistrez un livre
        </Text>
        <FormField
          title='Titre du livre'
          value={form.title}
          placeholder={'Entrez le titre du livre'}
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-7"
        />
        <FormField
          title='Auteur'
          value={form.author}
          placeholder={'Entrez l\'auteur du livre'}
          handleChangeText={(e) => setForm({ ...form, author: e })}
          otherStyles="mt-7"
        />
        <FormField
          title='Genre'
          value={form.genre}
          placeholder={'Entrez le genre du livre'}
          handleChangeText={(e) => setForm({ ...form, genre: e })}
          otherStyles="mt-7"
        />
        <View className="mt-7 space-y-2">
          <Text className='text-base text-gray-100 font-pmedium'>
            Upload photo
          </Text>
          <TouchableOpacity onPress={() => openPicker('image')}>
            {form.thumbnail
              ? (
                <Image
                  source={{ uri: form.thumbnail.uri }}
                  className="w-full h-64 rounded-2xl"
                  resizeMode="contain"
                />
              )
              : (
                <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                  <Image
                    source={icons.upload}
                    resizeMode='contain'
                    className="w-5 h-5"
                  />
                  <Text
                    className="text-sm text-gray-100 font-pmedium"
                  >
                    Choisir un fichier
                  </Text>
                </View>
              )
            }
          </TouchableOpacity>
        </View>
        <FormField
          title='Description'
          value={form.description}
          placeholder={'Entrez la description du livre'}
          handleChangeText={(e) => setForm({ ...form, description: e })}
          otherStyles="mt-7"
          multiline={true}
        />
        <CustomButton
          title="Enregistrer le livre"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={loading}
        />

        <CustomButton
          title="Scanner"
          handlePress={() => { setScanned(false); }}
          containerStyles="mt-10"
        />

      </ScrollView>
    </SafeAreaView>
    :
    <SafeAreaView className='bg-primary h-full'>
      <CameraView
        className='flex-1' facing='back'
        barcodeScannerSettings={{
          barcodeTypes: ['ean13'],
        }}
        onBarcodeScanned={scanHandler}
      >
        <CustomButton
          title="Enregistrer manuellement"
          handlePress={() => { setScanned(true); }}
          containerStyles="mt-10"
        />
      </CameraView>
    </SafeAreaView>
  )
}

export default Create