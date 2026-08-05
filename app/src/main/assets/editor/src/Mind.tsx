import { Page, Pages } from "levelojs";
import Home from "./pages/home/Home";
import Files from "./pages/files/Files";
import Settings from "./pages/settings/Settings";

export default function Mind() {
  return (
    <Pages>
      <Page path="/" component={Home} />
      <Page path="/files" component={Files} />
      <Page path="/settings" component={Settings} />
    </Pages>
  )
}