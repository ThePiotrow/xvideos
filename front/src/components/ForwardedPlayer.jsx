import React from "react";
import { TVPlayer } from "react-tv-player";

export default React.forwardRef((props, ref) => (
    <TVPlayer ref={ref} {...props} />
));