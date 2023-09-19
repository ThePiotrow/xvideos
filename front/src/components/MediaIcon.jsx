import React from "react";
import { getMediaType } from "../utils/mediaUtils";
import VideoIcon from "../components/icons/VideoIcon";
import PictureIcon from "../components/icons/PictureIcon";
import DefaultMediaIcon from "../components/icons/DefaultMediaIcon";

function MediaIcon({ path }) {
  const mediaType = getMediaType(path);

  switch (mediaType) {
    case "image":
      return <PictureIcon />;
    case "video":
      return <VideoIcon />;
    default:
      return <DefaultMediaIcon />;
  }
}

export default MediaIcon;
