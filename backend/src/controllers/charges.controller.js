import * as chargesService from "../services/charges.service.js";

// POST /api/bookings/:id/extras
// Employee adds item (price is null)
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

// DELETE /api/extras/:id
export const removeExtraItem = async (req, res, next) => {
  try {
    const extraId = req.params.id;
    const removedItem = await chargesService.removeExtraItemService(extraId);
    res.json({ message: "Item removed", item: removedItem });
  } catch (error) {
    next(error);
  }
};

// PUT /api/extras/:id/price
// Cashier/Owner updates price
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
