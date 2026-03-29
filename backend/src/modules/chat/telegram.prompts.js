export const TELEGRAM_TEXT = {
  myJobsButton: "📅 My Jobs",
};

export const telegramPrompts = {
  linkingInstructions: () =>
    "👋 Welcome to The Washing Machine Employee Bot!\n\nTo link your account:\n1. Log in to the Employee Portal.\n2. Go to your Profile.\n3. Click 'Connect Telegram'.\n4. Send the code provided there.",
  invalidLinkCode: () =>
    "❌ Invalid or expired linking code. Please generate a new one from your portal.",
  linkingSuccess: () =>
    "✅ Account successfully linked! You will now receive notifications here.",
  linkingError: () => "❌ An error occurred while linking your account.",
  notLinked: () => "❌ You are not linked to an employee account.",
  noActiveJobs: () => "🎉 You have no pending jobs assigned.",
  jobListIntro: () => "📋 *Your Assigned Jobs*\nSelect a job to view details:",
  jobsFetchError: () => "❌ Failed to fetch jobs.",
  callbackError: () => "❌ Error processing request",
  startConfirmation: () => "✅ Service Started!",
  startFailure: (message) => `❌ Failed to start service: ${message}`,
  completeConfirmation: () => "🎉 Service Completed!",
  completeFailure: (message) => `❌ Failed to complete service: ${message}`,
  jobDetails: ({
    customer,
    vehicle,
    services,
    date,
    time,
    location,
    contact,
    status,
  }) =>
    [
      "*JOB DETAILS*",
      "",
      `*Customer:* ${customer}`,
      `*Vehicle:* ${vehicle}`,
      `*Service:* ${services}`,
      `*Date:* ${date}`,
      `*Time:* ${time}`,
      `*Location:* ${location}`,
      `*Contact:* ${contact}`,
      "",
      `*Status:* ${status.toUpperCase()}`,
    ].join("\n"),
};
