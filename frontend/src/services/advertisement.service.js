import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/advertisement";

const getAds = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getAdminAds = async (token) => {
    const response = await axios.get(`${API_URL}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const createAd = async (adData, token) => {
    const response = await axios.post(API_URL, adData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

const updateAd = async (id, adData, token) => {
    const response = await axios.put(`${API_URL}/${id}`, adData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

const deleteAd = async (id, token) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const advertisementService = {
    getAds,
    getAdminAds,
    createAd,
    updateAd,
    deleteAd
};

export default advertisementService;
