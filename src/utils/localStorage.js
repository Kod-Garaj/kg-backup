function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const getKey = (key) => {
  const value = localStorage.getItem(key);
  if (value && isJsonString(value)) {
    return JSON.parse(value);
  }
  return value;
};

const setKey = (key, value) => {
  if (typeof value !== "string") {
    value = JSON.stringify(value);
  }
  localStorage.setItem(key, value);
};

const removeKey = (key) => {
  localStorage.removeItem(key);
};

export const storage = {
  getKey,
  setKey,
  removeKey,
};
