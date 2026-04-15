import * as adService from "../services/advertisement.service.js";
import { clearCacheByPattern } from "../configs/redis.js";

// GET All Advertisements (public)
export const getAdvertisements = async (req, res, next) => {
  try {
    const ads = await adService.getAllAdvertisementsService(false);
    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

// GET All Advertisements (admin)
export const getAdminAdvertisements = async (req, res, next) => {
  try {
    const ads = await adService.getAllAdvertisementsService(true);
    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

// CREATE Advertisement (admin)
export const createAdvertisement = async (req, res, next) => {
  try {
    const adData = req.body;
    if (req.file) {
      adData.image_url = `/uploads/ads/${req.file.filename}`;
    }
    // Handle string booleans from FormData
    if (adData.is_active === "true") adData.is_active = true;
    if (adData.is_active === "false") adData.is_active = false;

    const ad = await adService.createAdvertisementService(adData);
    await clearCacheByPattern("cache:/api/advertisement*");
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

// CREATE Advertisement Request (public)
export const requestAdvertisement = async (req, res, next) => {
  try {
    const { title, client_name, client_contact } = req.body;
    const ad = await adService.createAdvertisementService({
      title,
      client_name,
      client_contact,
      is_active: false,
    });
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

// UPDATE Advertisement (admin)
export const updateAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adData = req.body;
    if (req.file) {
      adData.image_url = `/uploads/ads/${req.file.filename}`;
    }
    // Handle string booleans from FormData
    if (adData.is_active === "true") adData.is_active = true;
    if (adData.is_active === "false") adData.is_active = false;

    const ad = await adService.updateAdvertisementService(id, adData);
    await clearCacheByPattern("cache:/api/advertisement*");
    res.json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

// DELETE Advertisement (admin)
export const deleteAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adService.deleteAdvertisementService(id);
    await clearCacheByPattern("cache:/api/advertisement*");
    res.json({ success: true, message: "Advertisement deleted successfully" });
  } catch (error) {
    next(error);
  }
};
