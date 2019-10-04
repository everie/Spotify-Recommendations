var nodemailer = require('nodemailer');
var settings = require('./settings');

function createMailer() {
	if (settings.useSmtp) {
		let options = {
			port: settings.smtpPort,
			host: settings.smtpHost,
			secure: settings.smtpSecure,
			auth: {
				user: settings.smtpUser,
				pass: settings.smtpPassword
			}
		};
		
		let defaults = {
			from: settings.smtpFrom,
			to: settings.smtpTo,
			subject: 'Spotify Recommendations: New track',
			text: 'A new track was just submitted to your Spotify playlist.',
		};

		let transporter = nodemailer.createTransport(options, defaults);
		
		return async function() {
			await transporter.sendMail();
		}
	}
	
	return async function() {
		return; // NOOP
	};
};

module.exports = {
	trySendEmail: createMailer()
};
