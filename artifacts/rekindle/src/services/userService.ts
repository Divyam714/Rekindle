const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : `http://${window.location.hostname}:5000/api`;

export interface UserRecord {
  id: number;
  name: string;
  phone: string;
  occasion?: string | null;
  tier?: string | null;
  created_at?: string;
}

export const getActiveUser = (): UserRecord | null => {
  const data = localStorage.getItem("rekindle_user");
  return data ? JSON.parse(data) : null;
};

export const setActiveUser = (user: UserRecord) => {
  localStorage.setItem("rekindle_user", JSON.stringify(user));
};

export async function syncUserLogin(phone: string, name?: string): Promise<UserRecord> {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to log in");

  setActiveUser(data.user);
  return data.user;
}

export async function syncUserOrder(phone: string, tier: string, occasion: string): Promise<UserRecord> {
  const res = await fetch(`${API_BASE_URL}/users/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, tier, occasion }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to record order");

  setActiveUser(data.user);
  return data.user;
}

export async function fetchUserFromDb(phone: string): Promise<UserRecord | null> {
  const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(phone)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}