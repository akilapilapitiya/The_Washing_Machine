import logger from '../configs/logger.js';
import * as systemHolidayService from "../services/systemHoliday.service.js";

// Get all holidays
export const getAllHolidaysController = async (req, res) => {
  try {
    const holidays = await systemHolidayService.getAllHolidays();
    res.status(200).json(holidays);
  } catch (error) {
    logger.error("Error fetching holidays:", error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

// Get holidays by date range
export const getHolidaysByRangeController = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const holidays = await systemHolidayService.getHolidaysByDateRange(
      start,
      end,
    );
    res.status(200).json(holidays);
  } catch (error) {
    logger.error("Error fetching holidays by range:", error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

// Check if a date is a holiday
export const checkHolidayDateController = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const holiday = await systemHolidayService.checkDateIsHoliday(date);

    if (holiday) {
      res.status(200).json({
        isHoliday: true,
        holiday,
      });
    } else {
      res.status(200).json({
        isHoliday: false,
        holiday: null,
      });
    }
  } catch (error) {
    logger.error("Error checking holiday date:", error);
    res.status(500).json({ error: "Failed to check holiday date" });
  }
};

// Get holiday by ID
export const getHolidayByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await systemHolidayService.getHolidayById(id);

    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.status(200).json(holiday);
  } catch (error) {
    logger.error("Error fetching holiday:", error);
    res.status(500).json({ error: "Failed to fetch holiday" });
  }
};

// Create new holiday (owner only)
export const createHolidayController = async (req, res) => {
  try {
    const { holidayname, holidaydate, starttime, endtime, holidaytype, description, is_recurring } =
      req.body;

    // Validation
    if (!holidayname || !holidaydate) {
      return res
        .status(400)
        .json({ error: "Holiday name and date are required" });
    }

    // Check if date already has a holiday
    const existingHoliday =
      await systemHolidayService.checkDateIsHoliday(holidaydate, starttime, endtime);
    if (existingHoliday) {
      return res.status(409).json({
        error: `A holiday already exists on this date/time: ${existingHoliday.holidayname}`,
      });
    }

    const holidayData = {
      holidayname,
      holidaydate,
      starttime: starttime || null,
      endtime: endtime || null,
      holidaytype: holidaytype || "public",
      description,
      is_recurring: is_recurring || false,
      created_by: req.user.id, // From auth middleware
    };

    const newHoliday = await systemHolidayService.createHoliday(holidayData);
    res.status(201).json(newHoliday);
  } catch (error) {
    logger.error("Error creating holiday:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      res.status(409).json({ error: "A holiday already exists on this date" });
    } else {
      res.status(500).json({ error: "Failed to create holiday" });
    }
  }
};

// Update holiday (owner only)
export const updateHolidayController = async (req, res) => {
  try {
    const { id } = req.params;
    const { holidayname, holidaydate, starttime, endtime, holidaytype, description, is_recurring } =
      req.body;

    // Check if holiday exists
    const existingHoliday = await systemHolidayService.getHolidayById(id);
    if (!existingHoliday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    // Always check for conflicts (excluding self)
    const targetDate = holidaydate || existingHoliday.holidaydate;
    const targetStart = starttime !== undefined ? starttime : existingHoliday.starttime;
    const targetEnd = endtime !== undefined ? endtime : existingHoliday.endtime;
    
    const dateConflict = await systemHolidayService.checkDateIsHoliday(targetDate, targetStart, targetEnd, id);
    if (dateConflict) {
      return res.status(409).json({
        error: `A holiday already exists in this timeframe: ${dateConflict.holidayname}`,
      });
    }

    const holidayData = {
      holidayname,
      holidaydate,
      starttime: targetStart,
      endtime: targetEnd,
      holidaytype,
      description,
      is_recurring,
    };

    const updatedHoliday = await systemHolidayService.updateHoliday(
      id,
      holidayData,
    );
    res.status(200).json(updatedHoliday);
  } catch (error) {
    logger.error("Error updating holiday:", error);
    if (error.code === "23505") {
      res.status(409).json({ error: "A holiday already exists on this date" });
    } else {
      res.status(500).json({ error: "Failed to update holiday" });
    }
  }
};

// Delete holiday (owner only)
export const deleteHolidayController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedHoliday = await systemHolidayService.deleteHoliday(id);

    if (!deletedHoliday) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.status(200).json({
      message: "Holiday deleted successfully",
      holiday: deletedHoliday,
    });
  } catch (error) {
    logger.error("Error deleting holiday:", error);
    res.status(500).json({ error: "Failed to delete holiday" });
  }
};

// Get upcoming holidays
export const getUpcomingHolidaysController = async (req, res) => {
  try {
    const holidays = await systemHolidayService.getUpcomingHolidays();
    res.status(200).json(holidays);
  } catch (error) {
    logger.error("Error fetching upcoming holidays:", error);
    res.status(500).json({ error: "Failed to fetch upcoming holidays" });
  }
};
