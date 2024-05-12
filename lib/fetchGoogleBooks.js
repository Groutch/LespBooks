export const loadBook = async function (isbnInput) {
  let isbn = isbnInput;
  isbn = isbn.replace(/[\-\s]/g, '');

  if (isbn !== '') {
    let book_complet = { id: '', title: '', isbn_13: '', cover: '', authors: '', 'description': '', publisher: '', date: 0, numberOfPages: 0, 'id_worldcat': '', 'id_google': '', 'ASIN': '', 'url': '', 'isPartOf': '', 'position': '' };
    let book_g = { id: '', title: '', isbn_13: '', cover: '', authors: '', 'description': '', publisher: '', date: 0, numberOfPages: 0, 'id_worldcat': '', 'id_google': '', 'ASIN': '', 'url': '' };

    let key = null;
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn${isbn}${key ? '&key=' + key : ''}`;

    return fetch(
      url,
      {
        method: "GET",
      }
    )
      .then(response => response.json())
  }
};