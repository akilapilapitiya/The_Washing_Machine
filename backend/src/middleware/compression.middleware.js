import compression from "compression";

// Compression middleware configuration
const compressionConfig = compression({
  level: 6, // Compression level (0-9, default is 6)
  threshold: 1024, // Compress only if response is larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers["x-no-compression"]) {
      return false;
    }

    // Use compression filter function
    return compression.filter(req, res);
  },
});

export default compressionConfig;
