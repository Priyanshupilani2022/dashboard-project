// Use the modern v2 syntax for all imports
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/v2/params");
const admin = require("firebase-admin");
const SibApiV3Sdk = require("@sendinblue/client");
const {logger} = require("firebase-functions");

admin.initializeApp();

// Define the secret using the recommended v2 method
const BREVO_KEY = defineSecret("BREVO_KEY");

// Define the function using the v2 onSchedule trigger
exports.sendTestEmail = onSchedule(
    {
      schedule: "every 5 minutes",
      // Make the secret available to the function's environment
      secrets: [BREVO_KEY],
    },
    async (event) => {
      logger.log("Starting Brevo email job (v2 syntax)...");

      try {
        // Access the secret's value in a v2 function
        const brevoApiKey = BREVO_KEY.value();

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const apiKey = apiInstance.authentications["api-key"];
        apiKey.apiKey = brevoApiKey;

        const sender = {
          email: "priyanshu@oneorigin.us",
          name: "Automated Shift Report",
        };

        const recipients = [
          {email: "priyanshu@oneorigin.us"},
          {email: "oneorigin.reports@gmail.com"},
        ];

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = sender;
        sendSmtpEmail.to = recipients;
        sendSmtpEmail.subject = "SUCCESS - Automated Report (V2 Syntax)";
        sendSmtpEmail.htmlContent = `
            <html>
              <body>
                <h1>Test Successful!</h1>
                <p>This email was sent using the v2 Functions syntax.</p>
                <p>Time of execution: ${new Date().toString()}</p>
              </body>
            </html>
          `;

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        logger.log("Email sent successfully. Response:", data);
      } catch (error) {
        logger.error("Error sending email with Brevo:", error);
      }
      return null;
    },
);
