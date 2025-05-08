const API_BASE_URL = "http://localhost:5001/api"; // שנה בהתאם לפורט של ה-Backend

// פונקציה ליצירת Header לאימות (Basic Auth בדוגמה זו)
const createAuthHeader = (
  credentials: { user: string; pass: string } | null
): HeadersInit => {
  if (!credentials) return {};
  return {
    Authorization: "Basic " + btoa(`${credentials.user}:${credentials.pass}`),
  };
};

// פונקציה כללית ל-fetch עם טיפול בשגיאות ו-JSON
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {},
  credentials: { user: string; pass: string } | null = null
): Promise<T> => {
  const headers = {
    "Content-Type": "application/json",
    ...createAuthHeader(credentials),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // אם אין גוף תשובה או שהוא לא JSON
        errorData = { error: `HTTP error! status: ${response.status}` };
      }
      console.error("API Error:", errorData);
      // זורקים שגיאה כדי שנוכל לתפוס אותה בקומפוננטה
      throw new Error(
        errorData?.error || `Request failed with status ${response.status}`
      );
    }

    // אם אין תוכן (למשל 204 No Content)
    if (response.status === 204) {
      return null as T; // או ערך מתאים אחר
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Fetch API Error:", error);
    // זורקים את השגיאה הלאה כדי שהקומפוננטה תטפל בה
    throw error;
  }
};

// פונקציות ספציפיות ל-API
export const getBeeperModels = (): Promise<BeeperModel[]> =>
  fetchApi("/beepers/models");

export const purchaseBeepers = (
  items: { model_id: number; quantity: number }[]
): Promise<any> =>
  fetchApi("/beepers/purchase", {
    method: "POST",
    body: JSON.stringify({ items }),
  });

export const loginOperator = (
  user: string,
  pass: string
): Promise<{ message: string; operator_id: number }> =>
  fetchApi("/operations/login", { method: "POST" }, { user, pass }); // שולח Basic Auth

// --- פונקציות מוגנות (דורשות אימות) ---
export const getFavorites = (credentials: {
  user: string;
  pass: string;
}): Promise<number[]> => fetchApi("/favorites", { method: "GET" }, credentials);

export const addFavorite = (
  modelId: number,
  credentials: { user: string; pass: string }
): Promise<any> =>
  fetchApi(`/favorites/${modelId}`, { method: "POST" }, credentials);

export const removeFavorite = (
  modelId: number,
  credentials: { user: string; pass: string }
): Promise<any> =>
  fetchApi(`/favorites/${modelId}`, { method: "DELETE" }, credentials);

export const getSoldBeepers = (credentials: {
  user: string;
  pass: string;
}): Promise<SoldBeeper[]> =>
  fetchApi("/operations/beepers", { method: "GET" }, credentials);

export const activateBeepers = (
  beeperIds: string[],
  credentials: { user: string; pass: string }
): Promise<any> =>
  fetchApi(
    "/operations/beepers/activate",
    {
      method: "POST",
      body: JSON.stringify({ beeper_ids: beeperIds }),
    },
    credentials
  );
