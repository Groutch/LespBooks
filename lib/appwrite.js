import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  plateform: process.env.EXPO_PUBLIC_APPWRITE_PLATEFORM,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
  bookCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOK_COLLECTION_ID,
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID,
}

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.plateform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )
    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password)

    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    )

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    await account.deleteSessions();
    throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;
    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )
    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log('Error getting user : ' + error)
  }
}

export const getAllBooks = async () => {
  try {
    const books = await databases.listDocuments(config.databaseId, config.bookCollectionId, [Query.orderDesc('$createdAt')])
    return books.documents
  } catch (error) {
    throw new Error(error);
  }
}

export const getLatestBooks = async () => {
  try {
    const books = await databases.listDocuments(
      config.databaseId,
      config.bookCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(5)]
    )

    return books.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const searchBooks = async (query) => {
  try {
    const books = await databases.listDocuments(
      config.databaseId,
      config.bookCollectionId,
      [
        Query.or([
          Query.search('title', query),
          Query.search('Description', query),
          Query.search("author", query),
          Query.search("ISBN", query)
        ])
      ]
    )
    return books.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if (type === "image") {
      fileUrl = storage.getFilePreview(config.storageId, fileId, 2000, 2000, 'top', 100);
    } else {
      throw new Error('Type de fichier non valide')
    }
    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if (!file) return;
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri
  }

  try {
    const uploadedFile = await storage.createFile(config.storageId, ID.unique(), asset)
    const fileUrl = await getFilePreview(uploadedFile.$id, type)
    return fileUrl
  } catch (error) {
    throw new Error('putain ' + error)
  }
}

export const createBook = async (form) => {
  try {
    const [thumbnailUrl] = await Promise.all([uploadFile(form.thumbnail, 'image')])


    const dataBook = {
      title: form.title,
      author: form.author,
      thumbnail: thumbnailUrl,
      Description: form.description,
      ISBN: form.isbn,
      genre: form.genre,
      creator: form.userId
    };
    const newBook = await databases.createDocument(
      config.databaseId,
      config.bookCollectionId,
      ID.unique(),
      dataBook
    )
    return newBook;
  } catch (error) {
    throw new Error(error)
  }
}