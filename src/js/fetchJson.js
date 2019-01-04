export default function (url){
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(response => response.json())
          .then(jsonData => {
            console.log('[fetcjdata]:jsonData:',jsonData);
            resolve(jsonData);
          })
           .catch(e => reject(`Request failed. Returned ${e}`, null));
    });
  }