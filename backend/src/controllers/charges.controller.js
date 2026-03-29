import * as chargesService from "../services/charges.service.js";

// CREATE Extra Item
export const addExtraItem = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const itemData = req.body;

    const extraItem = await chargesService.addExtraItemService(
      bookingId,
      userId,
      itemData,
    );

    res.status(201).json(extraItem);
  } catch (error) {
    next(error);
  }
};

// DELETE Extra Item
export const removeExtraItem = async (req, res, next) => {
  try {
    const extraId = req.params.id;
    const removedItem = await chargesService.removeExtraItemService(extraId);
    res.json({ message: "Item removed", item: removedItem });
  } catch (error) {
    next(error);
  }
};

// UPDATE Extra Item Price
export const updateItemPrice = async (req, res, next) => {
  try {
    const extraId = req.params.id;
    const { price } = req.body;

    const userId = req.user.id;

    const updatedItem = await chargesService.updateExtraItemPriceService(
      extraId,
      price,
      userId,
    );

    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
};
