import api from "@/lib/api";

const getAds = async () => {
    const response = await api.get("/advertisement");
    return response.data;
};

const getAdminAds = async () => {
    const response = await api.get("/advertisement/admin");
    return response.data;
};

const createAd = async (adData) => {
    const response = await api.post("/advertisement", adData, {
        headers: { 
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

const updateAd = async (id, adData) => {
    const response = await api.put(`/advertisement/${id}`, adData, {
        headers: { 
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

const deleteAd = async (id) => {
    const response = await api.delete(`/advertisement/${id}`);
    return response.data;
};

const requestAd = async (adData) => {
    const response = await api.post("/advertisement/request", adData);
    return response.data;
};

const advertisementService = {
    getAds,
    getAdminAds,
    createAd,
    updateAd,
    deleteAd,
    requestAd
};

export default advertisementService;
