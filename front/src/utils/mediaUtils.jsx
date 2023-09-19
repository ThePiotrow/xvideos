export function getMediaType(path) {
  const extension = path.split(".").pop().toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "gif"];
  const videoExtensions = ["mp4", "avi", "mkv", "webm"];

  if (imageExtensions.includes(extension)) return "image";
  if (videoExtensions.includes(extension)) return "video";
  return "unknown";
}
