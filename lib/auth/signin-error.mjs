// Provider failures must never be presented as an incorrect password.
// Keep unknown-account and incorrect-password responses indistinguishable.
export function signInError(error) {
  if (error?.status === 429 || ['over_request_rate_limit', 'over_email_send_rate_limit'].includes(error?.code)) {
    return {status: 429, message: 'Zu viele Anmeldeversuche. Bitte später erneut versuchen.'}
  }
  if (error?.code === 'email_not_confirmed') {
    return {status: 401, message: 'Bitte bestätige zuerst deine E-Mail-Adresse. Unter „Bestätigung erneut senden“ kannst du einen neuen Link anfordern.'}
  }
  if (error?.code === 'invalid_credentials') {
    return {status: 401, message: 'E-Mail-Adresse oder Passwort stimmen nicht. Bitte prüfe deine Eingabe oder nutze „Passwort vergessen?“.'}
  }
  return {status: 503, message: 'Die Anmeldung ist vorübergehend nicht verfügbar. Bitte später erneut versuchen.'}
}
