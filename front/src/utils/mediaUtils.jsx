export function formatDuration(seconds) {


  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
  const minutesString = remainingMinutes < 10 ? `0${remainingMinutes}` : `${remainingMinutes}`;
  const secondsString = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  return `${hoursString}:${minutesString}:${secondsString}`;
}
