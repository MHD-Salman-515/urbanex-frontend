import { api } from "./axios";

export const getFeaturedProperty = async () => {
  const res = await api.get("/properties?limit=1");
  return res?.data?.data?.[0];
};

