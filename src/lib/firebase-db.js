// Firebase Realtime Database REST API wrapper
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Brak FIREBASE_DATABASE_URL w zmiennych środowiskowych.");
}

async function dbGet(path) {
  try {
    const url = `${DATABASE_URL}/${path}.json`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Firebase GET error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Firebase GET error at ${path}:`, err);
    throw err;
  }
}

async function dbSet(path, data) {
  try {
    const url = `${DATABASE_URL}/${path}.json`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Firebase SET error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`Firebase SET error at ${path}:`, err);
    throw err;
  }
}

export { dbGet, dbSet };
