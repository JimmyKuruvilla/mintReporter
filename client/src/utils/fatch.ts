const patch = (url: string, body: any, headers: any) => {
  return fetch(url, {
    headers,
    method: 'PATCH',
    body: JSON.stringify(body)
  });
};

const post = (url: string, body: any, headers: any) => {
  return fetch(url, {
    headers,
    method: 'POST',
    body: JSON.stringify(body)
  });
};

const del = (url: string, headers: any) => {
  return fetch(url, {
    headers,
    method: 'DELETE'
  });
};

const baseUrl = 'http://localhost:4000'
export const fatch = async (
  path: string,
  method = 'get',
  body: any = {},
  headers = { 'Content-Type': 'application/json; charset=utf-8' },
  serverUrl = baseUrl
) => {
  let fetchFn;
  const url = `${serverUrl}/${path}`
  
  try {
    if (method === 'get') {
      fetchFn = () => fetch(url);
    } else if (method === 'patch') {
      fetchFn = () => patch(url, body, headers);
    } else if (method === 'post') {
      fetchFn = () => post(url, body, headers);
    } else if (method === 'delete') {
      fetchFn = () => del(url, headers);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }

    const response = await fetchFn();
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    return response.json();
  } catch (error: any) {
    console.log(`There has been a problem with your fetch operation: ${error.message}`);
    throw error;
  }
};