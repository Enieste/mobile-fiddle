export const sendFile = (presignedurl,
                         file, // : {uri: string, type: string, name: string}
                         onSuccess,
                         onFail,
                         onProgress) => {
  console.log("presignedurl", presignedurl)
  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener('progress', (e) => {
    onProgress(e.loaded, e.total);
  }, false);
  xhr.onreadystatechange = () => {
    console.log(xhr.readyState, xhr.status);
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('successfully uploaded presignedurl');
        console.log(xhr);
        onSuccess(file.uri);
      } else {
        console.log('failed to upload presignedurl');
        console.log(xhr);
        onFail(file.uri);
      }
    }
  };
  xhr.open('PUT', presignedurl);
  xhr.setRequestHeader('Content-Type', file.type);
  xhr.send(file);
};