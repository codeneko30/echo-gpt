import express from "express";

import registerRouter from "./routes/register/register.ts";
 import loginRouter from "./routes/login/login.ts";
 import refreshRouter from "./routes/refresh/refresh.ts";

 import logoutRouter from "./routes/logout/logout.ts";

 import getProfileRouter from "./routes/getProfile/getProfile.ts";
 import updateProfileRouter from "./routes/updateProfile/updateProfile.ts";
 import changePasswordRouter from "./routes/changePassword/changePassword.ts";
 import deleteAccountRouter from "./routes/deleteAccount/deleteAccount.ts";

 import subscriptionStatusRouter from "./routes/subscriptionStatus/subscriptionStatus.ts";
 import subscriptionUpgradeRouter from "./routes/subscriptionUpgrade/subscriptionUpgrade.ts";
 import remainingRequestsRouter from "./routes/remainingRequests/remainingRequests.ts";

 import getProvidersRouter from "./routes/getProviders/getProviders.ts";
 import createProviderRouter from "./routes/createProvider/createProvider.ts";
 import updateProviderRouter from "./routes/updateProvider/updateProvider.ts";
 import deleteProviderRouter from "./routes/deleteProvider/deleteProvider.ts";
 import providerHealthRouter from "./routes/providerHealth/providerHealth.ts";

 import chatSendRouter from "./routes/chatSend/chatSend.ts";
 import chatHistoryRouter from "./routes/chatHistory/chatHistory.ts";

 import searchRouter from "./routes/search/search.ts";
 import searchHistoryRouter from "./routes/searchHistory/searchHistory.ts";
 import searchSuggestionsRouter from "./routes/searchSuggestions/searchSuggestions.ts";

 import adminDashboardRouter from "./routes/adminDashboard/adminDashboard.ts";
 import adminUsersRouter from "./routes/adminUsers/adminUsers.ts";
import adminLogsRouter from "./routes/adminLogs/adminLogs.ts";
 import adminSystemHealthRouter from "./routes/adminSystemHealth/adminSystemHealth.ts";

require("dotenv").config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// ==================== AUTH ====================

app.use(registerRouter);
 app.use(loginRouter);
app.use(refreshRouter);
 app.use(logoutRouter);

// ==================== USERS ====================

 app.use(getProfileRouter);
 app.use(updateProfileRouter);
 app.use(changePasswordRouter);
 app.use(deleteAccountRouter);

// ==================== SUBSCRIPTIONS ====================

 app.use(subscriptionStatusRouter);
 app.use(subscriptionUpgradeRouter);
 app.use(remainingRequestsRouter);

// ==================== AI PROVIDERS ====================

 app.use(getProvidersRouter);
 app.use(createProviderRouter);
 app.use(updateProviderRouter);
 app.use(deleteProviderRouter);
 app.use(providerHealthRouter);

// ==================== CHAT ====================

 app.use(chatSendRouter);
 app.use(chatHistoryRouter);

// ==================== SEARCH ====================

 app.use(searchRouter);
 app.use(searchHistoryRouter);
 app.use(searchSuggestionsRouter);

// ==================== ADMIN ====================

 app.use(adminDashboardRouter);
app.use(adminUsersRouter);
app.use(adminLogsRouter);
 app.use(adminSystemHealthRouter);

app.listen(
    PORT,
    () => console.log(
        `EchoGPT Server running on port ${PORT}`
    )
);

export default app;