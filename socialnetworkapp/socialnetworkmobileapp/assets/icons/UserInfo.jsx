import * as React from "react"
import Svg, { SvgProps, Path, Rect } from "react-native-svg";

const UserInfo = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color="#000000" fill="none" {...props}>
    <Path d="M14 8.99988H18" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" />
    <Path d="M14 12.4999H17" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" />
    <Rect x="2" y="2.99988" width="20" height="18" rx="5" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinejoin="round" />
    <Path d="M5 15.9999C6.20831 13.4188 10.7122 13.249 12 15.9999" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M10.5 8.99988C10.5 10.1044 9.60457 10.9999 8.5 10.9999C7.39543 10.9999 6.5 10.1044 6.5 8.99988C6.5 7.89531 7.39543 6.99988 8.5 6.99988C9.60457 6.99988 10.5 7.89531 10.5 8.99988Z" stroke="currentColor" strokeWidth={props.strokeWidth} />
  </Svg>
);   

export default UserInfo;
