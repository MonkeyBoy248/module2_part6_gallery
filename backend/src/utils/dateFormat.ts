export function setDateFormat ()  {
  const timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const currentDate = Date.now() - timeZoneOffset
  const dateAsISO = new Date(currentDate).toISOString();

  return dateAsISO.replace('T', ' ')
    .slice(0, dateAsISO.lastIndexOf('.'));
}