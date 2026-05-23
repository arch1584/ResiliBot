import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <LeftPanel />
      <RightPanel />
    </div>
  )
}