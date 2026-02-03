export const parseServiceFormData = (req, res, next) => {
  if (!req.body) return next();

  // Parse JSON fields (arrays)
  ["gallery_urls", "benefits"].forEach((field) => {
    if (typeof req.body[field] === "string") {
      try {
        const parsed = JSON.parse(req.body[field]);
        req.body[field] = parsed;
      } catch (e) {
        // If parse fails, leave it as string and let validator handle/error
      }
    }
  });

  // Handle empty strings for numbers and dates (FormData sends "" for empty fields)
  ["offer_price", "offer_start_date", "offer_end_date", "serviceprice"].forEach(
    (field) => {
      if (req.body[field] === "" || req.body[field] === "null") {
        req.body[field] = null;
      }
    },
  );

  // While Joi handles boolean conversion, it's safer to be explicit for form-data
  ["has_offer", "is_featured", "is_variable_price"].forEach((field) => {
    if (req.body[field] === "true") req.body[field] = true;
    if (req.body[field] === "false") req.body[field] = false;
  });

  next();
};
