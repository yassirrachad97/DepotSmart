// api/api.ts

const BASE_URL = "http://localhost:3000";  

export const fetchWarehousemans = async () => {
  const response = await fetch(`${BASE_URL}/warehousemans`);
  return response.json();
};
