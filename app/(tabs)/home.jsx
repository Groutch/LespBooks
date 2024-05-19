import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from '../../constants';
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { getAllBooks, getLatestBooks } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import BookCard from '../../components/BookCard';
import { useGlobalContext } from '../../context/GlobalProvider'

const Home = () => {

  const { user } = useGlobalContext();
  const { data: books, refetch } = useAppwrite(getAllBooks)
  const { data: latestBooks } = useAppwrite(getLatestBooks);

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className='bg-primary'>
      <FlatList
        data={books ?? []}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <BookCard book={item} />
        )}
        ListHeaderComponent={() => (
          <View className='flex my-6 px-4 space-y-6'>
            <View className='flex justify-between items-start flex-row mb-6'>
              <View>
                <Text className='font-pmedium text-sm text-gray-100'>
                  Salut
                </Text>
                <Text className='text-2xl font-psemibold text-white'>
                  {user.username}
                </Text>
              </View>
              <View className='mt-1.5'>
                <Image
                  source={images.logoSmall}
                  className='w-9 h-10'
                  resizeMode='contain'
                />
              </View>
            </View>
            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Derniers Livres
              </Text>
              <Trending
                posts={latestBooks ?? []}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="C'est bien vide ici"
            subtitle="Aucun livre créé"
          />
        )}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />}
      />
    </SafeAreaView>
  )
}

export default Home