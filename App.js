import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

const App = () => {
  const [data, setData] = useState(null);

  const apiURL = 'http://localhost:8000/api/v1/order/';

  const getData = () => {
    fetch(apiURL)
      .then((response) => response.json())
      .then((json) => setData(json));
  };

  const postData = () => {
    fetch('http://localhost:8000/api/v1/order/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'foo',
        body: 'bar',
        userId: 1,
      }),
    })
    .then((response) => response.json())
    .then((json) => setData(json));
  };

  const putData = () => {
    fetch(`${apiURL}/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        title: 'foo',
        body: 'bar',
        userId: 1,
      }),
    })
    .then((response) => response.json())
    .then((json) => setData(json));
  };

  const deleteData = () => {
    fetch(`${apiURL}/1`, {
      method: 'DELETE',
    })
    .then((response) => response.json())
    .then((json) => setData(json));
  };

  return (
    <View style={{marginTop: 30}}>
      <Button onPress={getData} title="GET Data"  />
      <Button onPress={postData} title="POST Data" />
      <Button onPress={putData} title="PUT Data" />
      <Button onPress={deleteData} title="DELETE Data" />
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
};

export default App;
