export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const secondsString = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  // HH:MM:SS format (no more than 99 hours) and seconds are always displayed with 2 digits

  return `${hoursString}:${minutesString}:${secondsString.substring(0, 2)}`;
}

export function formatCreatedAt(seconds) {
  if (seconds < 60)
    return `Il y a ${seconds} seconde${seconds > 1 ? "s" : ""}`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;

  const days = Math.floor(hours / 24);
  if (days < 30)
    return `Il y a ${days} jour${days > 1 ? "s" : ""}`;

  const months = Math.floor(days / 30);
  if (months < 12)
    return `Il y a ${months} moi${months > 1 ? "s" : ""}`;

  const years = Math.floor(months / 12);
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}

