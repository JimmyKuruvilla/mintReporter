const patch = (url: string, body: any, headers: any) => {
  return fetch(url, {
    headers,
    method: 'PATCH',
    body
  });
};

const post = (url: string, body: any, headers: any) => {
  return fetch(url, {
    headers,
    method: 'POST',
    body
  });
};

const del = (url: string, headers: any) => {
  return fetch(url, {
    headers,
    method: 'DELETE'
  });
};

const baseUrl = 'http://localhost:4000'

type FatchOptions = {
  path: string,
  method?: string,
  body?: any,
  headers?: { [headerName: string]: string },
  serverUrl?: string,
}

export const fatch = async (options: FatchOptions) => {
  const {
    path,
    method = 'get',
    body = {},
    headers = { 'Content-Type': 'application/json; charset=utf-8' },
    serverUrl = baseUrl
  } = options

  let fetchFn;
  const url = `${serverUrl}/${path}`

  try {
    if (method.toLowerCase() === 'get') {
      fetchFn = () => fetch(url);
    } else if (method.toLowerCase() === 'patchraw') {
      fetchFn = () => patch(url, body, headers);
    } else if (method.toLowerCase() === 'patch') {
      fetchFn = () => patch(url, JSON.stringify(body), headers);
    } else if (method.toLowerCase() === 'postraw') {
      fetchFn = () => post(url, body, headers);
    } else if (method.toLowerCase() === 'post') {
      fetchFn = () => post(url, JSON.stringify(body), headers);
    } else if (method.toLowerCase() === 'delete') {
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
    console.error(`There has been a problem with your fetch operation: ${error.message}`);
    throw error;
  }
};