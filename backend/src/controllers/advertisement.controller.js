import * as adService from "../services/advertisement.service.js";

export const getAdvertisements = async (req, res, next) => {
  try {
    const ads = await adService.getAllAdvertisementsService(false);
    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

export const getAdminAdvertisements = async (req, res, next) => {
  try {
    const ads = await adService.getAllAdvertisementsService(true);
    res.json({ success: true, data: ads });
  } catch (error) {
    next(error);
  }
};

export const createAdvertisement = async (req, res, next) => {
  try {
    const adData = req.body;
    if (req.file) {
      adData.image_url = `/uploads/ads/${req.file.filename}`;
    }
    const ad = await adService.createAdvertisementService(adData);
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

export const updateAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adData = req.body;
    if (req.file) {
      adData.image_url = `/uploads/ads/${req.file.filename}`;
    }
    const ad = await adService.updateAdvertisementService(id, adData);
    res.json({ success: true, data: ad });
  } catch (error) {
    next(error);
  }
};

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await adService.deleteAdvertisementService(id);
    res.json({ success: true, message: "Advertisement deleted successfully" });
  } catch (error) {
    next(error);
  }
};
