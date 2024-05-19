import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { searchBooks } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import BookCard from '../../components/BookCard';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {
  const { query } = useLocalSearchParams()
  const { data: books, refetch } = useAppwrite(() => searchBooks(query))

  useEffect(() => {
    refetch()
  }, [query])

  return (
    <SafeAreaView className='bg-primary h-full'>
      <FlatList
        data={books ?? []}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <BookCard book={item} />
        )}
        ListHeaderComponent={() => (
          <View className='my-6 px-4'>
            <Text className='font-pmedium text-sm text-gray-100'>
              Résultat de la recherche :
            </Text>
            <Text className='text-2xl font-psemibold text-white'>
              {query}
            </Text>
            <View className='mt-6 mb-8'>
              <SearchInput initialQuery={query} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="C'est bien vide ici"
            subtitle="Aucun livre trouvé pour cette recherche"
          />
        )}
      />
    </SafeAreaView>
  )
}

export default Search