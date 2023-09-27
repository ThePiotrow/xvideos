import React from "react";
import VideoIcon from "../components/icons/VideoIcon";
import PictureIcon from "../components/icons/PictureIcon";
import DefaultMediaIcon from "../components/icons/DefaultMediaIcon";

function MediaIcon({ type }) {
  switch (type) {
    case "image":
      return <PictureIcon />;
    case "video":
      return <VideoIcon />;
    default:
      return <DefaultMediaIcon />;
  }
}

export default MediaIcon;
