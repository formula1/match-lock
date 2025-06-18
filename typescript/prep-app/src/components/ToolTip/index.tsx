import toolttipIcon from "./icons8-info.svg";

export function ToolTipSpan({ children, tip }: { children: React.ReactNode, tip: string }){
  return <span
    data-tooltip-id="global-tooltip"
    data-tooltip-content={tip}
    style={{ display: "inline-flex", alignItems: "center", gap: "0.25em" }}
  >
    <img
      src={toolttipIcon} alt="View For More Info"
      style={{
        height: "1em",
        width: "auto",
        verticalAlign: "middle",
        maxWidth: "1em",
      }}
    />
    {children}
  </span>
}
